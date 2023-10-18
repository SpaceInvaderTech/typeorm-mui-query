import type { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import type { GridFilterModel, GridSortModel } from '@mui/x-data-grid';
import { Brackets } from 'typeorm';
import { makeWhere } from './makeWhere';
import { fieldFormat } from './helpers';

type Props = {
  qb: SelectQueryBuilder<ObjectLiteral>;
  tableMap?: {
    [tableName: string]: string[];
  };
  tableDefault?: string;
  filterModel?: GridFilterModel;
  sortModel?: GridSortModel;
  quickFilterFields?: string[];
  nullsFirst?: boolean;
};

function invertTableMap(tableMap: Props['tableMap']) {
  if (!tableMap) return {};
  return Object.entries(tableMap).reduce((acc, [tableName, fields]) => {
    fields.forEach((field) => {
      acc[field] = tableName;
    });
    return acc;
  }, {} as { [field: string]: string });
}

export function handleFilterAndSort({
  qb,
  tableMap,
  tableDefault,
  filterModel,
  sortModel,
  quickFilterFields,
  nullsFirst = false,
}: Props) {
  const tableNameMap = invertTableMap(tableMap);
  if (filterModel) {
    const whereStatements: string[] = [];
    const parameters: ObjectLiteral = {};
    filterModel.items.forEach((filterItem) => {
      if (filterItem.value === undefined) {
        return;
      }
      if (Array.isArray(filterItem.value) && filterItem.value.length === 0) {
        return;
      }
      const parameterName = `p${filterItem.id}`;
      const whereStatement = makeWhere({
        tableName: tableNameMap[filterItem.field] || tableDefault,
        filterItem,
        parameterName,
      });
      whereStatements.push(`(${whereStatement})`);
      parameters[parameterName] = filterItem.value;
    });
    if (whereStatements.length > 0) {
      qb.andWhere(
        new Brackets((qb2) => {
          qb2.where(
            whereStatements.join(filterModel.logicOperator ?? ' OR '),
            parameters
          );
        })
      );
    }
    if (quickFilterFields && filterModel.quickFilterValues?.length) {
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
  if (sortModel) {
    sortModel.forEach(({ field, sort }) =>
      qb.addOrderBy(
        fieldFormat(field, tableNameMap[field] || tableDefault),
        sort?.toUpperCase() as 'ASC' | 'DESC',
        nullsFirst ? 'NULLS FIRST' : 'NULLS LAST'
      )
    );
  }
}
