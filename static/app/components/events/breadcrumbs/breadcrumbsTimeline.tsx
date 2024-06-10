import {convertBreadcrumbsToTimelineItems} from 'sentry/components/events/breadcrumbs/utils';
import * as Timeline from 'sentry/components/timeline';
import type {RawCrumb} from 'sentry/types/breadcrumbs';

interface BreadcrumbsDataProps {
  breadcrumbs: RawCrumb[];
}
export default function BreadcrumbsTimeline({breadcrumbs}: BreadcrumbsDataProps) {
  const items = convertBreadcrumbsToTimelineItems(breadcrumbs);
  return <Timeline.Group>{items}</Timeline.Group>;
}
