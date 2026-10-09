/** Follow the backend's pagination without inventing a frontend limit. */
export async function loadContentPages(fetchPage, query, signal) {
  const rows = [];
  for (let page = 1; page <= 10000; page += 1) {
    const response = await fetchPage({ ...query, page, per_page: 50 }, signal);
    if (!Array.isArray(response.data) || !Number.isInteger(response.meta?.last_page) || response.meta.last_page < 1)
      throw new Error("The CMS returned invalid content pagination.");
    rows.push(...response.data);
    if (page >= response.meta.last_page) return rows;
  }
  throw new Error("Too many CMS content pages.");
}
