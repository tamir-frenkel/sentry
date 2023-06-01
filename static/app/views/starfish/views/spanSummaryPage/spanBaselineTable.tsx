import {Fragment} from 'react';
import {useTheme} from '@emotion/react';

import GridEditable, {
  COL_WIDTH_UNDEFINED,
  GridColumnHeader,
} from 'sentry/components/gridEditable';
import {Tooltip} from 'sentry/components/tooltip';
import {Series} from 'sentry/types/echarts';
import {formatPercentage} from 'sentry/utils/formatters';
import {useLocation} from 'sentry/utils/useLocation';
import {P50_COLOR, THROUGHPUT_COLOR} from 'sentry/views/starfish/colours';
import {SpanDescription} from 'sentry/views/starfish/components/spanDescription';
import Sparkline, {
  generateHorizontalLine,
} from 'sentry/views/starfish/components/sparkline';
import type {Span} from 'sentry/views/starfish/queries/types';
import {
  ApplicationMetrics,
  useApplicationMetrics,
} from 'sentry/views/starfish/queries/useApplicationMetrics';
import {SpanMetrics, useSpanMetrics} from 'sentry/views/starfish/queries/useSpanMetrics';
import {useSpanMetricSeries} from 'sentry/views/starfish/queries/useSpanMetricSeries';
import {DataTitles, getTooltip} from 'sentry/views/starfish/views/spans/types';

type Props = {
  span: Span;
};

type Row = {
  description: string;
  metricSeries: Record<string, Series>;
  metrics: SpanMetrics;
  timeSpent: string;
};

export type Keys = 'description' | 'epm()' | 'p50(span.self_time)' | 'timeSpent';
export type TableColumnHeader = GridColumnHeader<Keys>;

export function SpanBaselineTable({span}: Props) {
  const location = useLocation();

  const {data: applicationMetrics} = useApplicationMetrics();
  const {data: spanMetrics} = useSpanMetrics(span);
  const {data: spanMetricSeries} = useSpanMetricSeries(span);

  const renderHeadCell = column => {
    return <span>{column.name}</span>;
  };

  const renderBodyCell = (column: TableColumnHeader, row: Row) => {
    return (
      <BodyCell
        span={span}
        column={column}
        row={row}
        applicationMetrics={applicationMetrics}
      />
    );
  };

  return (
    <GridEditable
      isLoading={false}
      data={[
        {
          description: span.description ?? '',
          metrics: spanMetrics,
          metricSeries: spanMetricSeries,
          timeSpent: formatPercentage(
            spanMetrics.total_time / applicationMetrics['sum(span.duration)']
          ),
        },
      ]}
      columnOrder={COLUMN_ORDER}
      columnSortBy={[]}
      grid={{
        renderHeadCell,
        renderBodyCell,
      }}
      location={location}
    />
  );
}

type CellProps = {
  column: TableColumnHeader;
  row: Row;
  span: Span;
};

function BodyCell({
  span,
  column,
  row,
  applicationMetrics,
}: CellProps & {applicationMetrics: ApplicationMetrics}) {
  if (column.key === 'description') {
    return <DescriptionCell span={span} row={row} column={column} />;
  }

  if (column.key === 'p50(span.self_time)') {
    return <P50Cell span={span} row={row} column={column} />;
  }

  if (column.key === 'epm()') {
    return <EPMCell span={span} row={row} column={column} />;
  }

  if (column.key === 'timeSpent') {
    return (
      <TimeSpentCell
        formattedTimeSpent={row[column.key]}
        totalSpanTime={row.metrics.total_time}
        totalAppTime={applicationMetrics['sum(span.duration)']}
      />
    );
  }

  return <span>{row[column.key]}</span>;
}

function DescriptionCell({span}: CellProps) {
  return <SpanDescription span={span} />;
}

function P50Cell({row}: CellProps) {
  const theme = useTheme();
  const p50 = row.metrics?.p50;
  const p50Series = row.metricSeries?.p50;

  return (
    <Fragment>
      {p50Series ? (
        <Sparkline
          color={P50_COLOR}
          series={p50Series}
          markLine={
            p50 ? generateHorizontalLine(`${p50.toFixed(2)}`, p50, theme) : undefined
          }
        />
      ) : null}
    </Fragment>
  );
}

function EPMCell({row}: CellProps) {
  const theme = useTheme();
  const epm = row.metrics?.spm;
  const epmSeries = row.metricSeries?.spm;

  return (
    <Fragment>
      {epmSeries ? (
        <Sparkline
          color={THROUGHPUT_COLOR}
          series={epmSeries}
          markLine={
            epm ? generateHorizontalLine(`${epm.toFixed(2)}`, epm, theme) : undefined
          }
        />
      ) : null}
    </Fragment>
  );
}

export function TimeSpentCell({
  formattedTimeSpent,
  totalSpanTime,
  totalAppTime,
}: {
  formattedTimeSpent: string;
  totalAppTime: number;
  totalSpanTime: number;
}) {
  const toolTip = getTooltip('timeSpent', totalSpanTime, totalAppTime);
  return (
    <span>
      <Tooltip title={toolTip}>{formattedTimeSpent}</Tooltip>
    </span>
  );
}

const COLUMN_ORDER: TableColumnHeader[] = [
  {
    key: 'description',
    name: 'Description',
    width: 500,
  },
  {
    key: 'epm()',
    name: 'Throughput (TPM)',
    width: COL_WIDTH_UNDEFINED,
  },
  {
    key: 'p50(span.self_time)',
    name: DataTitles.p50,
    width: COL_WIDTH_UNDEFINED,
  },
  {
    key: 'timeSpent',
    name: DataTitles.timeSpent,
    width: COL_WIDTH_UNDEFINED,
  },
];
