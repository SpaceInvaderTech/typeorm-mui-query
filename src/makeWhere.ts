import type { GridFilterItem } from '@mui/x-data-grid';
import { fieldFormat, cast } from './helpers';

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
