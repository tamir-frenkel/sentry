import {Fragment} from 'react';
import styled from '@emotion/styled';

import Alert from 'sentry/components/alert';
import TraceView from 'sentry/components/events/interfaces/spans/traceView';
import {useSpanWaterfallModelFromTransaction} from 'sentry/components/events/interfaces/spans/useSpanWaterfallModelFromTransaction';
import LoadingIndicator from 'sentry/components/loadingIndicator';
import {normalizeDateTimeParams} from 'sentry/components/organizations/pageFilters/parse';
import Panel from 'sentry/components/panels/panel';
import {parseStatsPeriod} from 'sentry/components/timeRangeSelector/utils';
import {IconClose} from 'sentry/icons';
import {tct} from 'sentry/locale';
import {space} from 'sentry/styles/space';
import type {PageFilters} from 'sentry/types';
import {defined} from 'sentry/utils';
import {useApiQuery} from 'sentry/utils/queryClient';
import {useLocalStorageState} from 'sentry/utils/useLocalStorageState';
import useOrganization from 'sentry/utils/useOrganization';
import usePageFilters from 'sentry/utils/usePageFilters';

type SpanSamples = Array<[string, string]>;

type AggregateSpanRow = {
  'avg(absolute_offset)': number;
  'avg(duration)': number;
  'avg(exclusive_time)': number;
  'count()': number;
  description: string;
  group: string;
  is_segment: number;
  node_fingerprint: string;
  parent_node_fingerprint: string;
  samples: SpanSamples;
  start_ms: number;
};

// Skip index added on transaction name on this date.
const INDEXED_SPANS_CUTOVER_DATE = new Date('2024-03-23');
function getStartDate(selection: PageFilters) {
  if (selection.datetime.period) {
    const {start} = parseStatsPeriod(selection.datetime.period);

    return new Date(start);
  }

  return selection.datetime.start ? new Date(selection.datetime.start) : null;
}

export function useAggregateSpans({
  transaction,
  httpMethod,
}: {
  transaction: string;
  httpMethod?: string;
}) {
  const organization = useOrganization();
  const {selection} = usePageFilters();
  let useIndexedSpansBackend = true;

  const start = getStartDate(selection);

  if (start && start < INDEXED_SPANS_CUTOVER_DATE) {
    useIndexedSpansBackend = false;
  }

  const endpointOptions = {
    query: {
      transaction,
      ...(defined(httpMethod) ? {'http.method': httpMethod} : null),
      project: selection.projects,
      environment: selection.environments,
      backend: useIndexedSpansBackend ? 'indexedSpans' : 'nodestore',
      ...normalizeDateTimeParams(selection.datetime),
    },
  };

  return useApiQuery<{
    data: {[fingerprint: string]: AggregateSpanRow}[];
    meta: any;
  }>(
    [
      `/organizations/${organization.slug}/spans-aggregation/`,
      {
        query: endpointOptions.query,
      },
    ],
    {
      staleTime: Infinity,
      enabled: true,
    }
  );
}

type Props = {
  transaction: string;
  httpMethod?: string;
};

export function AggregateSpans({transaction, httpMethod}: Props) {
  const organization = useOrganization();
  const [isBannerOpen, setIsBannerOpen] = useLocalStorageState<boolean>(
    'aggregate-waterfall-info-banner',
    true
  );

  const {waterfallModel, isLoading, event} = useSpanWaterfallModelFromTransaction(
    transaction,
    httpMethod
  );

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <Fragment>
      {isBannerOpen && (
        <StyledAlert
          type="info"
          showIcon
          trailingItems={<StyledCloseButton onClick={() => setIsBannerOpen(false)} />}
        >
          {tct(
            'This is an aggregate view across [x] events. You can see how frequent each span appears in the aggregate and identify any outliers.',
            {x: event.count}
          )}
        </StyledAlert>
      )}
      <Panel>
        <TraceView
          waterfallModel={waterfallModel}
          organization={organization}
          isEmbedded
          isAggregate
        />
      </Panel>
    </Fragment>
  );
}

const StyledAlert = styled(Alert)`
  margin-bottom: ${space(2)};
`;

const StyledCloseButton = styled(IconClose)`
  cursor: pointer;
`;
