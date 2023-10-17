const reDate = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d/;

export function cast(value: string | string[]) {
  if (typeof value === 'string') {
    if (reDate.test(value)) {
      return '::timestamp';
    }
  }
  return '';
}

function isQuoted(value: string) {
  return value.startsWith('"') && value.endsWith('"');
}

function quote(value: string) {
  if (isQuoted(value)) return value;
  return `"${value}"`;
}

export function fieldFormat(tableName: string | null, field: string) {
  if (field.includes('.') || tableName === null) return field;
  return `${quote(tableName)}.${quote(field)}`;
}
