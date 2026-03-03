export function unixTimestampToDate(timestamp: bigint | string) {
  return new Date(Number(timestamp) * 1000).toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}
