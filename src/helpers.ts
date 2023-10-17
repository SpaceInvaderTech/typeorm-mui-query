const reDate = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d/;

export function cast(value: string | string[]) {
  if (typeof value === 'string') {
    if (reDate.test(value)) {
      return '::timestamp';
    }
  }
  return '';
}

export function fieldFormat(field: string, tableName?: string | null) {
  if (field.includes('.') || !tableName) return field;
  return `${tableName}.${field}`;
}
