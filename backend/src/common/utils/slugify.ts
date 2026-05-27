/**
 * Converts a string into a URL-friendly slug.
 * Removes accents, lowercases, replaces non-alphanumeric chars with hyphens.
 *
 * @example slugify('Electrónica y Gadgets') → 'electronica-y-gadgets'
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics/accents
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}
