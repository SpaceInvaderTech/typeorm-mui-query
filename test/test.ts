import assert from 'node:assert';
import { handleQueryStringParameters, handleFilterAndSort } from '../src/main';
import { ds } from './lib/datasource';

describe('tests', () => {
  const queryParameterString =
    'sortModel=%5B%7B%22field%22%3A%22date%22%2C%22sort%22%3A%22desc%22%7D%5D&filterModel=%7B%22items%22%3A%5B%5D%7D&offset=0&limit=50';
  const searchParamsObject = Object.fromEntries(
    new URLSearchParams(queryParameterString)
  );

  it('handleQueryStringParameters', () => {
    const result = handleQueryStringParameters(searchParamsObject);
    assert.deepEqual(result, {
      offset: 0,
      limit: 50,
      sortModel: [{ field: 'date', sort: 'desc' }],
      filterModel: { items: [] },
    });
  });
  it('handleFilterAndSort', () => {
    const { filterModel, sortModel } =
      handleQueryStringParameters(searchParamsObject);
    const qb = ds.createQueryBuilder().from('test', 'test');
    handleFilterAndSort({
      qb,
      // tableMap: { test: ['date'] },
      tableDefault: 'test',
      filterModel,
      sortModel,
    });
    const resultQuery = qb.getQuery();
    assert.strictEqual(
      resultQuery,
      'SELECT * FROM "test" "test" ORDER BY test.date DESC NULLS LAST'
    );
  });
});

describe('crash tests', () => {
  before(async () => {
    await ds.initialize();
  });
  after(async () => {
    await ds.destroy();
  });
  it('handleQueryStringParameters and', async () => {
    const searchParamsObject = Object.fromEntries(
      new URLSearchParams(
        'sortModel=%5B%7B%22field%22%3A%22barcode%22%2C%22sort%22%3A%22desc%22%7D%5D&filterModel=%7B%22items%22%3A%5B%7B%22field%22%3A%22account.id%22%2C%22operator%22%3A%22is%22%2C%22id%22%3A81088%2C%22value%22%3A%22504e1338-eba4-4be2-9a76-1a9d11196ebf%22%7D%2C%7B%22field%22%3A%22account.id%22%2C%22operator%22%3A%22is%22%2C%22id%22%3A19590%2C%22value%22%3A%22d188567e-45b5-4ed4-ace5-df2c664e1718%22%7D%5D%7D&offset=0&limit=50'
      )
    );
    const { filterModel, sortModel } =
      handleQueryStringParameters(searchParamsObject);
    // console.log(JSON.stringify(queryParameters, null, 2));
    const qb = ds.createQueryBuilder().from('test', 'account');
    handleFilterAndSort({
      qb,
      tableMap: { test: ['date'] },
      filterModel,
      sortModel,
    });
    await qb.getMany();
  });
  it('handleQueryStringParameters or', async () => {
    const searchParamsObject = Object.fromEntries(
      new URLSearchParams(
        'sortModel=%5B%7B%22field%22%3A%22barcode%22%2C%22sort%22%3A%22desc%22%7D%5D&filterModel=%7B%22items%22%3A%5B%7B%22field%22%3A%22account.id%22%2C%22operator%22%3A%22is%22%2C%22id%22%3A81088%2C%22value%22%3A%22504e1338-eba4-4be2-9a76-1a9d11196ebf%22%7D%2C%7B%22field%22%3A%22account.id%22%2C%22operator%22%3A%22is%22%2C%22id%22%3A19590%2C%22value%22%3A%22d188567e-45b5-4ed4-ace5-df2c664e1718%22%7D%5D%2C%22logicOperator%22%3A%22or%22%7D&offset=0&limit=50'
        // 'sortModel=%5B%7B%22field%22%3A%22barcode%22%2C%22sort%22%3A%22desc%22%7D%5D&filterModel=%7B%22items%22%3A%5B%7B%22field%22%3A%22account.id%22%2C%22operator%22%3A%22is%22%2C%22id%22%3A51814%2C%22value%22%3A%22891892bd-e720-4da1-b36e-3b38dcce0063%22%7D%2C%7B%22field%22%3A%22account.id%22%2C%22operator%22%3A%22is%22%2C%22id%22%3A95154%2C%22value%22%3A%22821b9ad6-6f28-49d9-80d9-0c3b8dcf7f1c%22%7D%5D%7D&offset=0&limit=50'
      )
    );
    const { filterModel, sortModel } =
      handleQueryStringParameters(searchParamsObject);
    // console.log(JSON.stringify(queryParameters, null, 2));
    const qb = ds.createQueryBuilder().from('test', 'account');
    handleFilterAndSort({
      qb,
      tableMap: { account: ['id'] },
      filterModel,
      sortModel,
    });
    await qb.getMany();
  });
});
