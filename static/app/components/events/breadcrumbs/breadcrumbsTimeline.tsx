import {
  BREADCRUMB_TIMESTAMP_PLACEHOLDER,
  getBreadcrumbColorConfig,
  getBreadcrumbIcon,
  getBreadcrumbTitle,
} from 'sentry/components/events/breadcrumbs/utils';
import {
  convertCrumbType,
  getVirtualCrumb,
} from 'sentry/components/events/interfaces/breadcrumbs/utils';
import {StructuredData} from 'sentry/components/structuredEventData';
import * as Timeline from 'sentry/components/timeline';
import type {Event} from 'sentry/types';
import type {RawCrumb} from 'sentry/types/breadcrumbs';
import {defined} from 'sentry/utils';

interface BreadcrumbsTimelineProps {
  breadcrumbs: RawCrumb[];
  event: Event;
  meta?: Record<string, any>;
}
export default function BreadcrumbsTimeline({
  breadcrumbs,
  event,
  meta = {},
}: BreadcrumbsTimelineProps) {
  const virtualCrumb = getVirtualCrumb(event);
  const timelineCrumbs = [...breadcrumbs];
  if (virtualCrumb) {
    timelineCrumbs.push(virtualCrumb);
  }
  const startTimestamp = timelineCrumbs[timelineCrumbs.length - 1].timestamp;
  const items = timelineCrumbs.map((breadcrumb, i) => {
    const bc = convertCrumbType(breadcrumb);
    const bcMeta = meta[i];
    const isVirtualCrumb = virtualCrumb && i === timelineCrumbs.length - 1;
    return (
      <Timeline.Item
        key={i}
        title={getBreadcrumbTitle(bc.category)}
        colorConfig={getBreadcrumbColorConfig(bc.type)}
        icon={getBreadcrumbIcon(bc.type)}
        timestamp={bc.timestamp ?? BREADCRUMB_TIMESTAMP_PLACEHOLDER}
        startTimestamp={startTimestamp}
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

  return <Timeline.Group>{items}</Timeline.Group>;
}
