import ErrorBoundary from 'sentry/components/errorBoundary';
import BreadcrumbsTimeline from 'sentry/components/events/breadcrumbs/breadcrumbsTimeline';
import {EventDataSection} from 'sentry/components/events/eventDataSection';
import {t} from 'sentry/locale';
import {EntryType, type Event} from 'sentry/types';

interface BreadcrumbsDataSectionProps {
  event: Event;
}

export default function BreadcrumbsDataSection({event}: BreadcrumbsDataSectionProps) {
  const breadcrumbEntry = event.entries.find(
    entry => entry.type === EntryType.BREADCRUMBS
  );
  if (!breadcrumbEntry) {
    return null;
  }
  const breadcrumbs = breadcrumbEntry?.data?.values ?? [];
  if (breadcrumbs.length <= 0) {
    return null;
  }

  return (
    <EventDataSection
      key="breadcrumbs"
      type="breadcrmbs"
      title={t('Breadcrumbs')}
      data-test-id="breadcrumbs-data-section"
    >
      <ErrorBoundary mini message={t('There was an error loading the event breadcrumbs')}>
        <BreadcrumbsTimeline breadcrumbs={breadcrumbs} />
      </ErrorBoundary>
    </EventDataSection>
  );
}
