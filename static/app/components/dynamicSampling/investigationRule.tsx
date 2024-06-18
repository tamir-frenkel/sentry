import {useEffect} from 'react';
import styled from '@emotion/styled';
import moment from 'moment';

import {addErrorMessage, addSuccessMessage} from 'sentry/actionCreators/indicator';
import type {BaseButtonProps} from 'sentry/components/button';
import {Button} from 'sentry/components/button';
import ExternalLink from 'sentry/components/links/externalLink';
import {Tooltip} from 'sentry/components/tooltip';
import {IconQuestion, IconStack} from 'sentry/icons';
import {t, tct} from 'sentry/locale';
import {space} from 'sentry/styles/space';
import type {Organization} from 'sentry/types/organization';
import {trackAnalytics} from 'sentry/utils/analytics';
import type EventView from 'sentry/utils/discover/eventView';
import type {ApiQueryKey} from 'sentry/utils/queryClient';
import {useApiQuery, useMutation, useQueryClient} from 'sentry/utils/queryClient';
import type RequestError from 'sentry/utils/requestError/requestError';
import useApi from 'sentry/utils/useApi';
import useOrganization from 'sentry/utils/useOrganization';
import {Datasource} from 'sentry/views/alerts/rules/metric/types';
import {getQueryDatasource} from 'sentry/views/alerts/utils';

// Number of samples under which we can trigger an investigation rule
const INVESTIGATION_MAX_SAMPLES_TRIGGER = 5;

type Props = {
  buttonProps: BaseButtonProps;
  eventView: EventView;
  numSamples: number | null | undefined;
};

type PropsInternal = Props & {
  organization: Organization;
};

type CustomDynamicSamplingRule = {
  condition: Record<string, any>;
  dateAdded: string;
  endDate: string;
  numSamples: number;
  orgId: string;
  projects: number[];
  ruleId: number;
  sampleRate: number;
  startDate: string;
};
type CreateCustomRuleVariables = {
  organization: Organization;
  period: string | null;
  projects: number[];
  query: string;
};

function makeRuleExistsQueryKey(
  query: string,
  projects: number[],
  organization: Organization
): ApiQueryKey {
  // sort the projects to keep the query key invariant to the order of the projects
  const sortedProjects = [...projects].sort();
  return [
    `/organizations/${organization.slug}/dynamic-sampling/custom-rules/`,
    {
      query: {
        project: sortedProjects,
        query,
      },
    },
  ];
}

function hasTooFewSamples(numSamples: number | null | undefined) {
  // check if we have got the samples, but there are too few of them
  return (
    numSamples !== null &&
    numSamples !== undefined &&
    numSamples < INVESTIGATION_MAX_SAMPLES_TRIGGER
  );
}

function useGetExistingRule(
  query: string,
  projects: number[],
  organization: Organization,
  isTransactionQuery: boolean
) {
  const result = useApiQuery<CustomDynamicSamplingRule | '' | null>(
    makeRuleExistsQueryKey(query, projects, organization),
    {
      enabled: isTransactionQuery,
      staleTime: 0,
      // No retries for 4XX errors.
      // This makes the error feedback a lot faster, and there is no unnecessary network traffic.
      retry: (failureCount, error) => {
        if (failureCount >= 2) {
          return false;
        }
        if (error.status && error.status >= 400 && error.status < 500) {
          // don't retry 4xx errors (in theory 429 should be retried but not immediately)
          return false;
        }
        return true;
      },
    }
  );

  if (result.data === '') {
    // cleanup, the endpoint returns a 204 (with no body), change it to null
    result.data = null;
  }

  return result;
}

function useCreateInvestigationRuleMutation() {
  const api = useApi();
  const queryClient = useQueryClient();
  const {mutate} = useMutation<
    CustomDynamicSamplingRule,
    RequestError,
    CreateCustomRuleVariables
  >({
    mutationFn: variables => {
      const {organization} = variables;
      const endpoint = `/organizations/${organization.slug}/dynamic-sampling/custom-rules/`;
      return api.requestPromise(endpoint, {
        method: 'POST',
        data: variables,
      });
    },
    onSuccess: (_data, variables) => {
      addSuccessMessage(t('Successfully created investigation rule'));
      // invalidate the rule-exists query
      queryClient.invalidateQueries(
        makeRuleExistsQueryKey(
          variables.query,
          variables.projects,
          variables.organization
        )
      );
      trackAnalytics('dynamic_sampling.custom_rule_add', {
        organization: variables.organization,
        projects: variables.projects,
        query: variables.query,
        success: true,
      });
    },
    onError: (error, variables) => {
      if (error.status === 429) {
        addErrorMessage(
          t(
            'You have reached the maximum number of concurrent investigation rules allowed'
          )
        );
      } else {
        addErrorMessage(t('Unable to create investigation rule'));
      }

      trackAnalytics('dynamic_sampling.custom_rule_add', {
        organization: variables.organization,
        projects: variables.projects,
        query: variables.query,
        success: false,
      });
    },
    retry: false,
  });
  return mutate;
}

const InvestigationInProgressNotification = styled('span')`
  font-size: ${p => p.theme.fontSizeMedium};
  color: ${p => p.theme.subText};
  font-weight: ${p => p.theme.fontWeightBold};
  display: inline-flex;
  align-items: center;
  gap: ${space(0.5)};
`;

function InvestigationRuleCreationInternal(props: PropsInternal) {
  const projects = [...props.eventView.project];
  const organization = props.organization;
  const period = props.eventView.statsPeriod || null;
  const query = props.eventView.getQuery();
  const isTransactionQueryMissing =
    getQueryDatasource(query)?.source !== Datasource.TRANSACTION;
  const createInvestigationRule = useCreateInvestigationRuleMutation();
  const {
    data: rule,
    isFetching: isLoading,
    isError,
  } = useGetExistingRule(query, projects, organization, !isTransactionQueryMissing);

  const isBreakingRequestError = isError && !isTransactionQueryMissing;
  const isLikelyMoreNeeded = hasTooFewSamples(props.numSamples);

  useEffect(() => {
    if (isBreakingRequestError) {
      addErrorMessage(t('Unable to fetch investigation rule'));
    }
  }, [isBreakingRequestError]);

  if (isLoading) {
    return null;
  }
  if (isBreakingRequestError) {
    return null;
  }

  const isInvestigationRuleInProgress = !!rule;

  if (isInvestigationRuleInProgress) {
    // investigation rule in progress, just show a message
    const existingRule = rule as CustomDynamicSamplingRule;
    const ruleStartDate = new Date(existingRule.startDate);
    const now = new Date();
    const interval = moment.duration(now.getTime() - ruleStartDate.getTime()).humanize();

    return (
      <InvestigationInProgressNotification>
        {tct('Collecting samples since [interval]  ago.', {interval})}

        <Tooltip
          isHoverable
          title={tct(
            'A user has temporarily adjusted retention priorities, increasing the odds of getting events matching your search query. [link:Learn more.]',
            {
              link: (
                <ExternalLink href="https://docs.sentry.io/product/performance/retention-priorities/#investigation-mode" />
              ),
            }
          )}
        >
          <StyledIconQuestion size="sm" color="subText" />
        </Tooltip>
      </InvestigationInProgressNotification>
    );
  }

  // no investigation rule in progress, show a button to create one
  return (
    <Tooltip
      isHoverable
      title={
        isTransactionQueryMissing
          ? tct(
              'If you filter by [code:event.type:transaction] we can adjust your retention priorities, increasing the odds of getting matching events. [link:Learn more.]',
              {
                code: <code />,
                link: (
                  <ExternalLink href="https://docs.sentry.io/product/performance/retention-priorities/#investigation-mode" />
                ),
              }
            )
          : tct(
              'We can find more events that match your search query by adjusting your retention priorities for an hour, increasing the odds of getting matching events. [link:Learn more.]',
              {
                link: (
                  <ExternalLink href="https://docs.sentry.io/product/performance/retention-priorities/#investigation-mode" />
                ),
              }
            )
      }
    >
      <Button
        priority={isLikelyMoreNeeded ? 'primary' : 'default'}
        {...props.buttonProps}
        disabled={isTransactionQueryMissing}
        onClick={() => createInvestigationRule({organization, period, projects, query})}
        icon={<IconStack />}
      >
        {t('Get Samples')}
      </Button>
    </Tooltip>
  );
}

export function InvestigationRuleCreation(props: Props) {
  const organization = useOrganization();

  if (!organization.isDynamicallySampled) {
    return null;
  }

  return <InvestigationRuleCreationInternal {...props} organization={organization} />;
}

const StyledIconQuestion = styled(IconQuestion)`
  position: relative;
  top: 2px;
`;
