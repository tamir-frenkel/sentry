import {useMemo} from 'react';

import type {Event} from 'sentry/types/event';
import {DiscoverDatasets} from 'sentry/utils/discover/types';
import {getTraceTimeRangeFromEvent} from 'sentry/utils/performance/quickTrace/utils';
import {useApiQuery} from 'sentry/utils/queryClient';
import useOrganization from 'sentry/utils/useOrganization';

interface BaseEvent {
  culprit: string;
  id: string; // Used for subtitle
  'issue.id': number;
  message: string;
  project: string;
  'project.name': string;
  timestamp: string;
  title: string;
  transaction: string;
}

export interface TimelineDiscoverEvent extends BaseEvent {
  'event.type': string;
  'stack.function': string[];
}
interface TimelineIssuePlatformEvent extends BaseEvent {}

export type TimelineEvent = TimelineDiscoverEvent | TimelineIssuePlatformEvent;

export interface TraceEventResponse {
  data: TimelineEvent[];
  meta: unknown;
}

interface UseTraceTimelineEventsOptions {
  event: Event;
}

export function useTraceTimelineEvents({event}: UseTraceTimelineEventsOptions): {
  endTimestamp: number;
  isError: boolean;
  isLoading: boolean;
  oneOtherIssueEvent: TimelineEvent | undefined;
  startTimestamp: number;
  traceEvents: TimelineEvent[];
} {
  const organization = useOrganization();
  // If the org has global views, we want to look across all projects,
  // otherwise, just look at the current project.
  const hasGlobalViews = organization.features.includes('global-views');
  const project = hasGlobalViews ? -1 : event.projectID;
  const {start, end} = getTraceTimeRangeFromEvent(event);

  const traceId = event.contexts?.trace?.trace_id ?? '';
  const enabled = !!traceId;
  const {
    data: issuePlatformData,
    isLoading: isLoadingIssuePlatform,
    isError: isErrorIssuePlatform,
  } = useApiQuery<TraceEventResponse>(
    [
      `/organizations/${organization.slug}/events/`,
      {
        query: {
          // Get performance issues
          dataset: DiscoverDatasets.ISSUE_PLATFORM,
          field: [
            'message',
            'title',
            'project',
            'timestamp',
            'issue.id',
            'transaction',
            'culprit', // Used for the subtitle
          ],
          per_page: 100,
          query: `trace:${traceId}`,
          referrer: 'api.issues.issue_events',
          sort: '-timestamp',
          start,
          end,
          project: project,
        },
      },
    ],
    {staleTime: Infinity, retry: false, enabled}
  );
  const {
    data: discoverData,
    isLoading: isLoadingDiscover,
    isError: isErrorDiscover,
  } = useApiQuery<{
    data: TimelineEvent[];
    meta: unknown;
  }>(
    [
      `/organizations/${organization.slug}/events/`,
      {
        query: {
          // Other events
          dataset: DiscoverDatasets.DISCOVER,
          field: [
            'message',
            'title',
            'project',
            'timestamp',
            'issue.id',
            'transaction',
            'event.type',
            'stack.function',
            'culprit', // Used for the subtitle
          ],
          per_page: 100,
          query: `trace:${traceId}`,
          referrer: 'api.issues.issue_events',
          sort: '-timestamp',
          start,
          end,
          project: project,
        },
      },
    ],
    {staleTime: Infinity, retry: false, enabled}
  );

  const eventData = useMemo(() => {
    if (
      isLoadingIssuePlatform ||
      isLoadingDiscover ||
      isErrorIssuePlatform ||
      isErrorDiscover
    ) {
      return {
        data: [],
        startTimestamp: 0,
        endTimestamp: 0,
      };
    }

    // Events is unsorted since they're grouped by date later
    const events = [...issuePlatformData.data, ...discoverData.data];

    const oneOtherIssueEvent = getOneOtherIssueEvent(event, events);

    // The current event might be missing when there is a large number of issues
    const hasCurrentEvent = events.some(e => e.id === event.id);
    if (!hasCurrentEvent) {
      events.push({
        id: event.id,
        culprit: event.culprit,
        'issue.id': Number(event.groupID),
        message: event.message,
        project: event.projectID,
        // The project name for current event is not used
        'project.name': '',
        timestamp: event.dateCreated!,
        title: event.title,
        transaction: '',
      });
    }
    const timestamps = events.map(e => new Date(e.timestamp).getTime());
    const startTimestamp = Math.min(...timestamps);
    const endTimestamp = Math.max(...timestamps);
    return {
      data: events,
      startTimestamp,
      endTimestamp,
      oneOtherIssueEvent,
    };
  }, [
    event,
    issuePlatformData,
    discoverData,
    isLoadingIssuePlatform,
    isLoadingDiscover,
    isErrorIssuePlatform,
    isErrorDiscover,
  ]);

  return {
    traceEvents: eventData.data,
    startTimestamp: eventData.startTimestamp,
    endTimestamp: eventData.endTimestamp,
    isLoading: isLoadingIssuePlatform || isLoadingDiscover,
    isError: isErrorIssuePlatform || isErrorDiscover,
    oneOtherIssueEvent: eventData.oneOtherIssueEvent,
  };
}

function getOneOtherIssueEvent(
  event: Event,
  allTraceEvents: TimelineEvent[]
): TimelineEvent | undefined {
  const groupId = event.groupID;
  if (!groupId) {
    return undefined;
  }
  const otherIssues = allTraceEvents.filter(
    (_event, index, self) =>
      _event['issue.id'] !== undefined &&
      // Exclude the current issue
      _event['issue.id'] !== Number(groupId) &&
      self.findIndex(e => e['issue.id'] === _event['issue.id']) === index
  );
  return otherIssues.length === 1 ? otherIssues[0] : undefined;
}
