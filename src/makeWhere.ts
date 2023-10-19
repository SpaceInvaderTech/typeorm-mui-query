import type { GridFilterItem } from '@mui/x-data-grid';
import { fieldFormat, cast } from './helpers';

type MakeWhereProps = {
  tableName?: string;
  filterItem: GridFilterItem;
  parameterName: string;
};

export function makeWhere({
  tableName,
  filterItem: { field, operator, value },
  parameterName,
}: MakeWhereProps): string {
  switch (operator) {
    // number
    case '=':
    case '!=':
    case '>':
    case '>=':
    case '<':
    case '<=':
      return `${fieldFormat(
        field,
        tableName
      )} ${operator} :${parameterName}::int`;
    // common
    case 'contains':
      return `${fieldFormat(
        field,
        tableName
      )} ILIKE '%' || :${parameterName} || '%'`;
    case 'equals':
      return `${fieldFormat(field, tableName)} = :${parameterName}`;
    case 'startsWith':
      return `${fieldFormat(field, tableName)} ILIKE :${parameterName} || '%'`;
    case 'endsWith':
      return `${fieldFormat(field, tableName)} ILIKE '%' || :${parameterName}`;
    case 'isEmpty':
      return `${fieldFormat(field, tableName)} IS NULL`;
    case 'isNotEmpty':
      return `${fieldFormat(field, tableName)} IS NOT NULL`;
    case 'isAnyOf':
      return `${fieldFormat(field, tableName)} IN(:...${parameterName})`;
    // date | selectable
    case 'is':
      return `${fieldFormat(field, tableName)} = :${parameterName}${cast(
        value
      )}`;
    case 'not':
      return `${fieldFormat(field, tableName)} != :${parameterName}${cast(
        value
      )}`;
    case 'after':
      return `${fieldFormat(field, tableName)} > :${parameterName}${cast(
        value
      )}`;
    case 'onOrAfter':
      return `${fieldFormat(field, tableName)} >= :${parameterName}${cast(
        value
      )}`;
    case 'before':
      return `${fieldFormat(field, tableName)} < :${parameterName}${cast(
        value
      )}`;
    case 'onOrBefore':
      return `${fieldFormat(field, tableName)} <= :${parameterName}${cast(
        value
      )}`;
    default:
      console.warn('Unknown operator: %s', operator);
      return `${fieldFormat(field, tableName)} ${operator} :${parameterName}`;
  }
}
