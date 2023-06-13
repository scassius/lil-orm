export function escapeValue(value: any): string {
  if (typeof value === 'string') {
    return `'${value}'`;
  }
  return value;
}
