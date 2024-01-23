export function truncateText(text) {
  const maxLength = 140;
  return text.length > maxLength
    ? text.substring(0, text.lastIndexOf(" ", maxLength)) + "..."
    : text;
}
