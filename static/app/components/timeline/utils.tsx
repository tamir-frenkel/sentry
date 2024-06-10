import {BreadcrumbType} from 'sentry/types/breadcrumbs';
import {useLocation} from 'sentry/utils/useLocation';
import useOrganization from 'sentry/utils/useOrganization';

export function useHasNewTimelineUI() {
  const location = useLocation();
  const organization = useOrganization();
  return (
    location.query.newTimeline === '1' ||
    organization.features.includes('new-timeline-ui')
  );
}

export function getColorFromBreadcrumbType(type?: BreadcrumbType): string {
  switch (type) {
    case BreadcrumbType.ERROR:
      return 'red300';
    case BreadcrumbType.WARNING:
      return 'yellow300';
    case BreadcrumbType.NAVIGATION:
    case BreadcrumbType.HTTP:
      return 'green300';
    case BreadcrumbType.INFO:
    case BreadcrumbType.QUERY:
      return 'blue300';
    case BreadcrumbType.USER:
    case BreadcrumbType.UI:
    case BreadcrumbType.DEBUG:
      return 'purple300';
    case BreadcrumbType.SYSTEM:
    case BreadcrumbType.SESSION:
    case BreadcrumbType.TRANSACTION:
      return 'pink300';
    default:
      return 'gray300';
  }
}
