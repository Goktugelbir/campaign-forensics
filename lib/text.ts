/** URL-safe anchor id from a heading, Turkish characters folded to ASCII ("Haklarınız" → "haklariniz"). */
export function headingId(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
