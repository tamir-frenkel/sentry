import {convertBreadcrumbsToTimelineItems} from 'sentry/components/events/breadcrumbs/utils';
import * as Timeline from 'sentry/components/timeline';
import type {Event} from 'sentry/types';
import type {RawCrumb} from 'sentry/types/breadcrumbs';

interface BreadcrumbsTimelineProps {
  breadcrumbs: RawCrumb[];
  event: Event;
}
export default function BreadcrumbsTimeline({
  breadcrumbs,
  event,
}: BreadcrumbsTimelineProps) {
  const items = convertBreadcrumbsToTimelineItems(breadcrumbs, event);
  return <Timeline.Group>{items}</Timeline.Group>;
}
