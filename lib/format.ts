export function formatDateTime(input: string) {
  const date = new Date(input);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
