import * as Timeline from 'sentry/components/timeline';
import {
  IconFire,
  IconFix,
  IconInfo,
  IconLocation,
  IconMobile,
  IconRefresh,
  IconSort,
  IconSpan,
  IconStack,
  IconTerminal,
  IconUser,
  IconWarning,
} from 'sentry/icons';
import {t} from 'sentry/locale';
import {BreadcrumbType, type RawCrumb} from 'sentry/types/breadcrumbs';

const BREADCRUMB_TIMESTAMP_PLACEHOLDER = '--';
const BREADCRUMB_TITLE_PLACEHOLDER = t('Generic');

export function convertBreadcrumbsToTimelineItems(
  breadcrumbs: RawCrumb[]
): React.ReactNode[] {
  const results = breadcrumbs.map((bc, i) => {
    return (
      <Timeline.Item
        key={i}
        title={bc.category ?? BREADCRUMB_TITLE_PLACEHOLDER}
        icon={getIconFromBreadcrumbType(bc.type)}
        color={getColorFromBreadcrumbType(bc.type)}
        description={bc.message}
        timestamp={bc.timestamp ?? BREADCRUMB_TIMESTAMP_PLACEHOLDER}
      >
        {JSON.stringify(bc.data)}
      </Timeline.Item>
    );
  });
  return results;
}

export function getColorFromBreadcrumbType(type?: BreadcrumbType): string {
  switch (type) {
    case BreadcrumbType.ERROR:
      return 'red400';
    case BreadcrumbType.WARNING:
      return 'yellow400';
    case BreadcrumbType.NAVIGATION:
    case BreadcrumbType.HTTP:
      return 'green400';
    case BreadcrumbType.INFO:
    case BreadcrumbType.QUERY:
      return 'blue400';
    case BreadcrumbType.USER:
    case BreadcrumbType.UI:
    case BreadcrumbType.DEBUG:
      return 'purple400';
    case BreadcrumbType.SYSTEM:
    case BreadcrumbType.SESSION:
    case BreadcrumbType.TRANSACTION:
      return 'pink400';
    default:
      return 'gray300';
  }
}

export function getIconFromBreadcrumbType(type?: BreadcrumbType): React.ReactNode {
  switch (type) {
    case BreadcrumbType.USER:
    case BreadcrumbType.UI:
      return <IconUser size="xs" />;
    case BreadcrumbType.NAVIGATION:
      return <IconLocation size="xs" />;
    case BreadcrumbType.DEBUG:
      return <IconFix size="xs" />;
    case BreadcrumbType.INFO:
      return <IconInfo size="xs" />;
    case BreadcrumbType.ERROR:
      return <IconFire size="xs" />;
    case BreadcrumbType.HTTP:
      return <IconSort size="xs" rotated />;
    case BreadcrumbType.WARNING:
      return <IconWarning size="xs" />;
    case BreadcrumbType.QUERY:
      return <IconStack size="xs" />;
    case BreadcrumbType.SYSTEM:
      return <IconMobile size="xs" />;
    case BreadcrumbType.SESSION:
      return <IconRefresh size="xs" />;
    case BreadcrumbType.TRANSACTION:
      return <IconSpan size="xs" />;
    default:
      return <IconTerminal size="xs" />;
  }
}
