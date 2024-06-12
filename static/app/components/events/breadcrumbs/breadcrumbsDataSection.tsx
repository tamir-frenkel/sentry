import styled from '@emotion/styled';

import ErrorBoundary from 'sentry/components/errorBoundary';
import BreadcrumbsTimeline from 'sentry/components/events/breadcrumbs/breadcrumbsTimeline';
import {EventDataSection} from 'sentry/components/events/eventDataSection';
import {t} from 'sentry/locale';
import {space} from 'sentry/styles/space';
import {EntryType, type Event} from 'sentry/types';

interface BreadcrumbsDataSectionProps {
  event: Event;
}

export default function BreadcrumbsDataSection({event}: BreadcrumbsDataSectionProps) {
  const breadcrumbEntryIndex = event.entries.findIndex(
    entry => entry.type === EntryType.BREADCRUMBS
  );
  if (!breadcrumbEntryIndex) {
    return null;
  }
  const breadcrumbs = event.entries[breadcrumbEntryIndex]?.data?.values ?? [];
  if (breadcrumbs.length <= 0) {
    return null;
  }

  const meta = event._meta?.entries?.[breadcrumbEntryIndex]?.data?.values;
  return (
    <EventDataSection
      key="breadcrumbs"
      type="breadcrmbs"
      title={t('Breadcrumbs')}
      data-test-id="breadcrumbs-data-section"
    >
      <ErrorBoundary mini message={t('There was an error loading the event breadcrumbs')}>
        <NestedScroll>
          <BreadcrumbsTimeline breadcrumbs={breadcrumbs} event={event} meta={meta} />
        </NestedScroll>
      </ErrorBoundary>
    </EventDataSection>
  );
}

const NestedScroll = styled('div')`
  padding: ${space(0.5)} ${space(1)} ${space(0.5)} ${space(0.5)};
  border: 1px solid ${p => p.theme.border};
  border-radius: 4px;
  height: 450px;
  overflow-y: scroll;
  resize: vertical;
`;
