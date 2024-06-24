import {useMemo, useState} from 'react';
import styled from '@emotion/styled';

import {Button} from 'sentry/components/button';
import ButtonBar from 'sentry/components/buttonBar';
import {CompactSelect} from 'sentry/components/compactSelect';
import DropdownButton from 'sentry/components/dropdownButton';
import ErrorBoundary from 'sentry/components/errorBoundary';
import BreadcrumbsTimeline from 'sentry/components/events/breadcrumbs/breadcrumbsTimeline';
import {
  applyBreadcrumbSearch,
  BREADCRUMB_TIME_DISPLAY_LOCALSTORAGE_KEY,
  BREADCRUMB_TIME_DISPLAY_OPTIONS,
  BreadcrumbTimeDisplay,
  getBreadcrumbFilters,
} from 'sentry/components/events/breadcrumbs/utils';
import {EventDataSection} from 'sentry/components/events/eventDataSection';
import {
  BREADCRUMB_SORT_LOCALSTORAGE_KEY,
  BREADCRUMB_SORT_OPTIONS,
  BreadcrumbSort,
} from 'sentry/components/events/interfaces/breadcrumbs';
import {getVirtualCrumb} from 'sentry/components/events/interfaces/breadcrumbs/utils';
import Input from 'sentry/components/input';
import {IconClock, IconEllipsis, IconFilter, IconSort} from 'sentry/icons';
import {t, tn} from 'sentry/locale';
import {space} from 'sentry/styles/space';
import type {RawCrumb} from 'sentry/types/breadcrumbs';
import {EntryType, type Event} from 'sentry/types/event';
import {useLocalStorageState} from 'sentry/utils/useLocalStorageState';

interface BreadcrumbsDataSectionProps {
  event: Event;
}

export default function BreadcrumbsDataSection({event}: BreadcrumbsDataSectionProps) {
  const [search, setSearch] = useState('');
  const [filterSet, setFilterSet] = useState(new Set<string>());
  const [sort, setSort] = useLocalStorageState<BreadcrumbSort>(
    BREADCRUMB_SORT_LOCALSTORAGE_KEY,
    BreadcrumbSort.NEWEST
  );
  const [timeDisplay, setTimeDisplay] = useLocalStorageState<BreadcrumbTimeDisplay>(
    BREADCRUMB_TIME_DISPLAY_LOCALSTORAGE_KEY,
    BreadcrumbTimeDisplay.RELATIVE
  );

  const breadcrumbEntryIndex =
    event.entries?.findIndex(entry => entry.type === EntryType.BREADCRUMBS) ?? -1;
  const breadcrumbs: RawCrumb[] = useMemo(
    () => event.entries?.[breadcrumbEntryIndex]?.data?.values ?? [],
    [event, breadcrumbEntryIndex]
  );
  const allCrumbs = useMemo(() => [...breadcrumbs], [breadcrumbs]);
  // Mapping of breadcrumb index -> breadcrumb meta
  const meta: Record<number, any> =
    event._meta?.entries?.[breadcrumbEntryIndex]?.data?.values;

  // The virtual crumb is a representation of this event, displayed alongside
  // the rest of the breadcrumbs for more additional context.
  const virtualCrumb = getVirtualCrumb(event);
  let virtualCrumbIndex: number | undefined;
  if (virtualCrumb) {
    virtualCrumbIndex = allCrumbs.length;
    allCrumbs.push(virtualCrumb);
  }

  const filterOptions = useMemo(() => getBreadcrumbFilters(allCrumbs), [allCrumbs]);
  const filteredCrumbs = allCrumbs.filter(bc =>
    filterSet.size === 0 ? true : filterSet.has(bc.type)
  );
  const searchedCrumbs = useMemo(
    () => applyBreadcrumbSearch(search, filteredCrumbs),
    [search, filteredCrumbs]
  );

  const hasFilters = filterSet.size > 0 || search.length > 0;

  if (!breadcrumbEntryIndex) {
    return null;
  }

  if (breadcrumbs.length <= 0) {
    return null;
  }

  const actions = (
    <ButtonBar gap={1}>
      <Input
        size="xs"
        placeholder={t('Search')}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <CompactSelect
        size="xs"
        onChange={options => {
          const newFilters = options.map(({value}) => value);
          setFilterSet(new Set(newFilters));
        }}
        multiple
        options={filterOptions}
        maxMenuHeight={400}
        trigger={(props, isOpen) => (
          <DropdownButton
            isOpen={isOpen}
            size="xs"
            icon={<IconFilter size="xs" />}
            {...props}
          >
            {filterSet.size
              ? tn('%s Active Filter', '%s Active Filters', filterSet.size)
              : t('Filter')}
          </DropdownButton>
        )}
      />
      <CompactSelect
        size="xs"
        triggerProps={{
          icon: <IconSort size="xs" />,
        }}
        onChange={selectedOption => {
          setSort(selectedOption.value);
        }}
        value={sort}
        options={BREADCRUMB_SORT_OPTIONS}
      />
      <CompactSelect
        size="xs"
        triggerProps={{
          icon: <IconClock size="xs" />,
        }}
        onChange={selectedOption => {
          setTimeDisplay(selectedOption.value);
        }}
        value={timeDisplay}
        options={BREADCRUMB_TIME_DISPLAY_OPTIONS}
      />
    </ButtonBar>
  );

  return (
    <EventDataSection
      key="breadcrumbs"
      type="breadcrmbs"
      title={t('Breadcrumbs')}
      actions={actions}
      data-test-id="breadcrumbs-data-section"
    >
      <ErrorBoundary mini message={t('There was an error loading the event breadcrumbs')}>
        {searchedCrumbs.length ? (
          <BreadcrumbsTimeline
            breadcrumbs={searchedCrumbs}
            virtualCrumbIndex={virtualCrumbIndex}
            meta={meta}
            sort={sort}
            timeDisplay={timeDisplay}
          />
        ) : (
          <EmptyBreadcrumbsMessage>
            {t('No breadcrumbs found. ')}
            {hasFilters && (
              <ClearFiltersButton
                size="xs"
                onClick={() => {
                  setFilterSet(new Set());
                  setSearch('');
                }}
              >
                {t('Clear filters')}
              </ClearFiltersButton>
            )}
          </EmptyBreadcrumbsMessage>
        )}
        <ViewAllContainer>
          <VerticalEllipsis rotate={80} />
          <div>
            <ViewAllButton size="sm">{t('View All')}</ViewAllButton>
          </div>
        </ViewAllContainer>
      </ErrorBoundary>
    </EventDataSection>
  );
}

const EmptyBreadcrumbsMessage = styled('div')`
  border: 1px solid ${p => p.theme.border};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${p => p.theme.subText};
  border-radius: 4px;
  padding: ${space(3)} ${space(1)};
`;

const ClearFiltersButton = styled(Button)`
  margin-top: ${space(1)};
`;

const ViewAllContainer = styled('div')`
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  margin-top: ${space(1)};
  &::after {
    content: '';
    position: absolute;
    left: 10.5px;
    width: 1px;
    top: -${space(1)};
    height: ${space(1)};
    background: ${p => p.theme.border};
  }
`;

const VerticalEllipsis = styled(IconEllipsis)`
  height: 22px;
  color: ${p => p.theme.subText};
  margin: ${space(0.5)};
  transform: rotate(90deg);
`;

const ViewAllButton = styled(Button)`
  padding: ${space(0.75)} ${space(1)};
`;
