const reDate = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d/;

export function cast(value: string | string[]) {
  if (typeof value === 'string') {
    if (reDate.test(value)) {
      return '::timestamp';
    }
  }
  return '';
}

export function fieldFormat(tableName: string | null, field: string) {
  return field.includes('.') || tableName === null
    ? field
    : `${tableName}.${field}`;
}
