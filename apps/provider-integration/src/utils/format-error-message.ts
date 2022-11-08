export function formatErrorMessage(e: any, defaultMsg?: string): string {
  let message = defaultMsg ? defaultMsg : 'Unknown Error';
  if (
    e.response &&
    e.response.data &&
    e.response.data.message.length > 0 &&
    typeof e.response.data.message === 'string'
  ) {
    message = e.response.data.message;
  } else if (e.message && typeof message === 'string') {
    message = e.message;
  }
  return message;
}
