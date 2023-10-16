import type { GridFilterModel, GridSortModel } from '@mui/x-data-grid';

type QueryStringParameters = {
  offset?: number;
  limit?: number;
  sortModel?: string;
  filterModel?: string;
};

const initParameters = {
  offset: 0,
  limit: 100,
  sortModel: [] as GridSortModel,
  filterModel: { items: [] } as GridFilterModel,
};

export function handleQueryStringParameters(
  queryStringParameters: QueryStringParameters | undefined,
  defaultParameters = initParameters
) {
  if (queryStringParameters === undefined) {
    return defaultParameters;
  }
  const definedParameters = { ...defaultParameters };
  if (queryStringParameters.offset !== undefined) {
    definedParameters.offset = Number(queryStringParameters.offset);
  }
  if (queryStringParameters.limit !== undefined) {
    definedParameters.limit = Number(queryStringParameters.limit);
  }
  if (queryStringParameters.sortModel !== undefined) {
    definedParameters.sortModel = JSON.parse(queryStringParameters.sortModel);
  }
  if (queryStringParameters.filterModel !== undefined) {
    definedParameters.filterModel = JSON.parse(
      queryStringParameters.filterModel
    );
  }
  return definedParameters;
}
