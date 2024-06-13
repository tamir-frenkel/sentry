import {
  BREADCRUMB_TIMESTAMP_PLACEHOLDER,
  BreadcrumbTimeDisplay,
  getBreadcrumbColorConfig,
  getBreadcrumbIcon,
  getBreadcrumbTitle,
} from 'sentry/components/events/breadcrumbs/utils';
import {BreadcrumbSort} from 'sentry/components/events/interfaces/breadcrumbs';
import {convertCrumbType} from 'sentry/components/events/interfaces/breadcrumbs/utils';
import {StructuredData} from 'sentry/components/structuredEventData';
import * as Timeline from 'sentry/components/timeline';
import type {RawCrumb} from 'sentry/types/breadcrumbs';
import {defined} from 'sentry/utils';

interface BreadcrumbsTimelineProps {
  breadcrumbs: RawCrumb[];
  meta?: Record<string, any>;
  sort?: BreadcrumbSort;
  timeDisplay?: BreadcrumbTimeDisplay;
  virtualCrumbIndex?: number;
}
export default function BreadcrumbsTimeline({
  breadcrumbs,
  virtualCrumbIndex,
  sort = BreadcrumbSort.NEWEST,
  timeDisplay = BreadcrumbTimeDisplay.RELATIVE,
  meta = {},
}: BreadcrumbsTimelineProps) {
  const startTimestamp =
    timeDisplay === BreadcrumbTimeDisplay.RELATIVE
      ? breadcrumbs[breadcrumbs.length - 1].timestamp
      : undefined;
  const items = breadcrumbs.map((breadcrumb, i) => {
    const bc = convertCrumbType(breadcrumb);
    const bcMeta = meta[i];
    const isVirtualCrumb = defined(virtualCrumbIndex) && i === virtualCrumbIndex;
    return (
      <Timeline.Item
        key={i}
        title={getBreadcrumbTitle(bc.category)}
        colorConfig={getBreadcrumbColorConfig(bc.type)}
        icon={getBreadcrumbIcon(bc.type)}
        timestamp={bc.timestamp ?? BREADCRUMB_TIMESTAMP_PLACEHOLDER}
        startTimestamp={startTimestamp}
        // XXX: Only the virtual crumb can be marked as active for breadcrumbs
        isActive={isVirtualCrumb ?? false}
      >
        {defined(bc.message) && (
          <Timeline.Text>
            <StructuredData
              value={bc.message}
              depth={0}
              maxDefaultDepth={1}
              meta={bcMeta?.message}
              withAnnotatedText
              withOnlyFormattedText
            />
          </Timeline.Text>
        )}
        {defined(bc.data) && (
          <Timeline.Data>
            <StructuredData
              value={bc.data}
              depth={0}
              maxDefaultDepth={1}
              meta={bcMeta?.data}
              withAnnotatedText
              withOnlyFormattedText
            />
          </Timeline.Data>
        )}
      </Timeline.Item>
    );
  });

  return (
    <Timeline.Group>
      {sort === BreadcrumbSort.NEWEST ? items.reverse() : items}
    </Timeline.Group>
  );
}
