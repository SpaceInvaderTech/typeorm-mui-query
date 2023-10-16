import type { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import type { GridFilterModel, GridSortItem } from '@mui/x-data-grid';
import { Brackets } from 'typeorm';
import { makeWhere } from './makeWhere';
import { fieldFormat } from './helpers';

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
            whereStatements.join(filterModel.logicOperator ?? ' OR '),
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
