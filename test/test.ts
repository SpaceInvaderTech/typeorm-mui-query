import assert from 'node:assert';
import { DataSource } from 'typeorm';
import { handleQueryStringParameters, handleFilterAndSort } from '../src/main';

const queryParameterString =
  'sortModel=%5B%7B%22field%22%3A%22date%22%2C%22sort%22%3A%22desc%22%7D%5D&filterModel=%7B%22items%22%3A%5B%5D%7D&offset=0&limit=50';
const searchParamsObject = Object.fromEntries(
  new URLSearchParams(queryParameterString)
);

describe('tests', () => {
  it('handleQueryStringParameters', () => {
    const result = handleQueryStringParameters(searchParamsObject);
    // console.log(result);
    assert.deepEqual(result, {
      offset: 0,
      limit: 50,
      sortModel: [{ field: 'date', sort: 'desc' }],
      filterModel: { items: [] },
    });
  });
  it('handleFilterAndSort', () => {
    const queryParameters = handleQueryStringParameters(searchParamsObject);
    const ds = new DataSource({
      type: 'sqlite',
      database: 'test',
      entities: [],
    });
    const qb = ds.createQueryBuilder().from('test', 'test');
    handleFilterAndSort(
      qb,
      'test',
      queryParameters.filterModel!,
      queryParameters.sortModel
    );
    const resultQuery = qb.getQuery();
    assert.strictEqual(
      resultQuery,
      'SELECT * FROM "test" "test" ORDER BY test.date DESC NULLS LAST'
    );
  });
});
