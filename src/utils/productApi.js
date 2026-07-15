// Open Food Facts is a free, open grocery database — no API key, no signup.
// We use it to enrich voice search with real-world product data.
// Docs: https://openfoodfacts.github.io/openfoodfacts-server/api/
// Note: OFF has no pricing data, so these results are shown as "Live"
// results alongside (not replacing) the local catalog, which does have
// prices for the price-range-filtering requirement.

const SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl'

export async function searchLiveProducts(query, { pageSize = 5, timeoutMs = 4000 } = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const url = `${SEARCH_URL}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${pageSize}`
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`OFF API responded ${res.status}`)
    const data = await res.json()
    clearTimeout(timeout)

    const products = Array.isArray(data.products) ? data.products : []
    return products
      .filter((p) => p.product_name)
      .slice(0, pageSize)
      .map((p, idx) => ({
        id: `live-${p.code || idx}`,
        name: p.product_name,
        brand: p.brands ? p.brands.split(',')[0].trim() : 'Unknown brand',
        category: (p.categories && p.categories.split(',')[0].trim()) || 'Other',
        price: null, // not available from this data source
        live: true,
      }))
  } catch (err) {
    clearTimeout(timeout)
    // Network hiccups / CORS / offline: fail quietly, caller falls back
    // to the local catalog so voice search always still works.
    return []
  }
}