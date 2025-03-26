export async function fetchUsdToRialRate() {
  try {
    // Determine if we're on the client or server
    const isClient = typeof window !== "undefined";

    let url;
    if (isClient) {
      // Client-side: Use relative URL
      url = "/api/exchangeRate";
    } else {
      // Server-side: Use absolute URL with NEXT_PUBLIC_BASE_URL
      // or fallback to a constructed URL from process.env.VERCEL_URL or localhost
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      url = `${baseUrl}/api/exchangeRate`;
    }

    // Make the request with the appropriate URL
    const response = await fetch(url, {
      // Prevent browser caching to ensure we always get server cache
      cache: isClient ? "no-store" : undefined,
    });

    if (!response.ok) {
      console.error("Failed to fetch exchange rate:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.rate;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return null;
  }
}
