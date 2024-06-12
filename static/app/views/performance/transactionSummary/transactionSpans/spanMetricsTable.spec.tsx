import {initializeData as _initializeData} from 'sentry-test/performance/initializePerformanceData';
import {act, render, screen, waitFor} from 'sentry-test/reactTestingLibrary';

import ProjectsStore from 'sentry/stores/projectsStore';
import SpanMetricsTable from 'sentry/views/performance/transactionSummary/transactionSpans/spanMetricsTable';

const initializeData = () => {
  const data = _initializeData({
    features: ['performance-view'],
  });

  act(() => ProjectsStore.loadInitialData(data.organization.projects));
  return data;
};

describe('SpanMetricsTable', () => {
  it('should render the table and rows of data', async () => {
    const {organization, project} = initializeData();

    const mockRequest = MockApiClient.addMockResponse({
      url: `/organizations/${organization.slug}/events/`,
      method: 'GET',
      body: {
        data: [
          {
            'span.group': 'abc123',
            'span.op': 'db',
            'span.description': 'SELECT thing FROM my_cool_db',
            'spm()': 4.448963396488444,
            'sum(span.self_time)': 1236071121.5044901,
            'avg(span.duration)': 30900.700924083318,
          },
        ],
      },
    });

    render(
      <SpanMetricsTable transactionName="Test Transaction" project={project} query={''} />
    );

    await waitFor(() =>
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
    );

    expect(mockRequest).toHaveBeenCalled();

    const {
      opHeader,
      descriptionHeader,
      throughputHeader,
      avgDurationHeader,
      timeSpentHeader,
    } = await findTableHeaders();

    expect(opHeader).toHaveTextContent('Span Operation');
    expect(descriptionHeader).toHaveTextContent('Span Description');
    expect(throughputHeader).toHaveTextContent('Throughput');
    expect(avgDurationHeader).toHaveTextContent('Avg Duration');
    expect(timeSpentHeader).toHaveTextContent('Time Spent');

    const {opCell, descriptionCell, throughputCell, avgDurationCell, timeSpentCell} =
      await findFirstRowCells();

    expect(opCell).toHaveTextContent('db');
    expect(descriptionCell).toHaveTextContent('SELECT thing FROM my_cool_db');
    expect(throughputCell).toHaveTextContent('4.45/s');
    expect(avgDurationCell).toHaveTextContent('30.90s');
    expect(timeSpentCell).toHaveTextContent('2.04wk');
  });

  it('should handle the case when there is no span grouping', async () => {
    const {organization, project} = initializeData();

    const mockRequest = MockApiClient.addMockResponse({
      url: `/organizations/${organization.slug}/events/`,
      method: 'GET',
      body: {
        data: [
          {
            'span.op': 'db',
            'spm()': 5000,
            'sum(span.self_time)': 12346071121.5044901,
            'avg(span.duration)': 30900.700924083318,
          },
        ],
      },
    });

    render(
      <SpanMetricsTable transactionName="Test Transaction" project={project} query={''} />
    );

    await waitFor(() =>
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
    );

    expect(mockRequest).toHaveBeenCalled();
    const {opCell, descriptionCell} = await findFirstRowCells();

    expect(opCell).toHaveTextContent('db');
    expect(descriptionCell).toHaveTextContent('\u2014');
  });

  // it('should not accept invalid tags in the search query', () => {
  //   const {organization, project} = initializeData();

  //   const mockRequest = MockApiClient.addMockResponse({
  //     url: `/organizations/${organization.slug}/events/`,
  //     method: 'GET',
  //     body: {
  //       data: [
  //         {
  //           'span.op': 'db',
  //           'spm()': 5000,
  //           'sum(span.self_time)': 12346071121.5044901,
  //           'avg(span.duration)': 30900.700924083318,
  //         },
  //       ],
  //     },
  //   });

  //   render(
  //     <SpanMetricsTable
  //       transactionName="Test Transaction"
  //       project={project}
  //       query={'http.method:POST span.op:db'}
  //     />
  //   );

  //   expect(mockRequest).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       method: 'GET',
  //       query: {
  //         cursor: undefined,
  //         dataset: 'spansMetrics',
  //         environment: [],
  //         excludeOther: 0,
  //         field: [],
  //         interval: '30m',
  //         orderby: undefined,
  //         partial: 1,
  //         per_page: 50,
  //         project: [],
  //         query: 'span.op:[cache.get_item,cache.get] project.id:1',
  //         referrer: 'api.performance.cache.samples-cache-hit-miss-chart',
  //         statsPeriod: '10d',
  //         topEvents: undefined,
  //         yAxis: 'cache_miss_rate()',
  //       },
  //     })
  //   );

  //   screen.debug();
  // });
});

async function findTableHeaders() {
  const tableHeaders = await screen.findAllByTestId('grid-head-cell');
  const [
    opHeader,
    descriptionHeader,
    throughputHeader,
    avgDurationHeader,
    timeSpentHeader,
  ] = tableHeaders;

  return {
    opHeader,
    descriptionHeader,
    throughputHeader,
    avgDurationHeader,
    timeSpentHeader,
  };
}

async function findFirstRowCells() {
  const bodyCells = await screen.findAllByTestId('grid-body-cell');
  const [opCell, descriptionCell, throughputCell, avgDurationCell, timeSpentCell] =
    bodyCells;

  return {
    opCell,
    descriptionCell,
    throughputCell,
    avgDurationCell,
    timeSpentCell,
  };
}
