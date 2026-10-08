export async function request(path, options = {}) {
  let response;
  try { response = await fetch('/api' + path, { ...options, headers: { 'Accept': 'application/json', ...(options.body ? {'Content-Type':'application/json'} : {}), ...options.headers } }); }
  catch { throw new Error('Temporarily unavailable. Please try again later.'); }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = response.status === 403 ? 'Service unavailable.' : response.status === 503
      ? 'Temporarily unavailable. Please try again later.' : response.status === 422 ? 'Check your details.' : 'Something went wrong. Please try again.';
    const error = new Error(message);
    error.fields = response.status === 422 ? payload.errors || {} : {};
    throw error;
  }
  return payload;
}
