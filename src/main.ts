import type { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import type {
  GridFilterItem,
  GridFilterModel,
  GridSortItem,
} from '@mui/x-data-grid';
import { Brackets } from 'typeorm';

const reDate = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d/;

function cast(value: string | string[]) {
  if (typeof value === 'string') {
    if (reDate.test(value)) {
      return '::timestamp';
    }
  }
  return '';
}

function fieldFormat(tableName: string | null, field: string) {
  return field.includes('.') || tableName === null
    ? field
    : `${tableName}.${field}`;
}

export function makeWhere(
  tableName: string | null,
  { field, operator }: GridFilterItem,
  parameterName: string,
  value: string | string[]
): string {
  switch (operator) {
    // number
    case '=':
    case '!=':
    case '>':
    case '>=':
    case '<':
    case '<=':
      return `${fieldFormat(
        tableName,
        field
      )} ${operator} :${parameterName}::int`;
    // common
    case 'contains':
      return `${fieldFormat(
        tableName,
        field
      )} ILIKE '%' || :${parameterName} || '%'`;
    case 'equals':
      return `${fieldFormat(tableName, field)} = :${parameterName}`;
    case 'startsWith':
      return `${fieldFormat(tableName, field)} ILIKE :${parameterName} || '%'`;
    case 'endsWith':
      return `${fieldFormat(tableName, field)} ILIKE '%' || :${parameterName}`;
    case 'isEmpty':
      return `${fieldFormat(tableName, field)} IS NULL`;
    case 'isNotEmpty':
      return `${fieldFormat(tableName, field)} IS NOT NULL`;
    case 'isAnyOf':
      return `${fieldFormat(tableName, field)} IN(:...${parameterName})`;
    // date | selectable
    case 'is':
      return `${fieldFormat(tableName, field)} = :${parameterName}${cast(
        value
      )}`;
    case 'not':
      return `${fieldFormat(tableName, field)} != :${parameterName}${cast(
        value
      )}`;
    case 'after':
      return `${fieldFormat(tableName, field)} > :${parameterName}${cast(
        value
      )}`;
    case 'onOrAfter':
      return `${fieldFormat(tableName, field)} >= :${parameterName}${cast(
        value
      )}`;
    case 'before':
      return `${fieldFormat(tableName, field)} < :${parameterName}${cast(
        value
      )}`;
    case 'onOrBefore':
      return `${fieldFormat(tableName, field)} <= :${parameterName}${cast(
        value
      )}`;
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
}

const defaultParameters = {
  offset: 0,
  limit: 100,
  sortModel: [] as GridSortItem[],
  filterModel: undefined as unknown as GridFilterModel,
};

export function handleQueryStringParameters(
  queryStringParameters:
    | {
        offset: undefined;
        limit: undefined;
        sortModel: string | undefined;
        filterModel: string | undefined;
      }
    | undefined
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

export function handleFilterAndSort(
  qb: SelectQueryBuilder<ObjectLiteral>,
  tableName: string | null,
  filterModel: GridFilterModel,
  sortModel: GridSortItem[],
  quickFilterFields: string[] = []
) {
  if (filterModel) {
    const whereStatements: string[] = [];
    const parameters: ObjectLiteral = {};
    filterModel.items.forEach((item) => {
      if (item.value === undefined) {
        return;
      }
      if (Array.isArray(item.value) && item.value.length === 0) {
        return;
      }
      const parameterName = `p${item.id}`;
      const whereStatement = makeWhere(
        tableName,
        item,
        parameterName,
        item.value
      );
      whereStatements.push(`(${whereStatement})`);
      parameters[parameterName] = item.value;
    });
    if (whereStatements.length > 0) {
      qb.andWhere(
        new Brackets((qb2) => {
          qb2.where(
            whereStatements.join(filterModel.logicOperator ?? ''),
            parameters
          );
        })
      );
    }
    if (filterModel.quickFilterValues && filterModel.quickFilterValues.length) {
      filterModel.quickFilterValues.forEach((value, index) => {
        const parameterName = `quickFilter${index}`;
        const params = { [parameterName]: value };
        const whereStatement = quickFilterFields
          .map((field) => `${field} ILIKE '%' || :${parameterName} || '%'`)
          .join(' OR ');
        if (filterModel.logicOperator === 'or' && index > 0) {
          qb.orWhere(whereStatement, params);
        } else {
          qb.andWhere(whereStatement, params);
        }
      });
    }
  }
  if (sortModel.length) {
    sortModel.forEach(({ field, sort }) =>
      qb.addOrderBy(
        fieldFormat(tableName, field),
        sort?.toUpperCase() as 'ASC' | 'DESC',
        'NULLS LAST'
      )
    );
  }
}
