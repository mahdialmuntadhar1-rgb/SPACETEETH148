export type BusinessNameField =
  | string
  | { ku?: string | null; ar?: string | null; en?: string | null }
  | null
  | undefined;

export function getBusinessName(nameField: BusinessNameField): string {
  if (!nameField) return 'No Name';
  if (typeof nameField === 'string') return nameField;
  return nameField.ku || nameField.ar || nameField.en || 'No Name';
}
