export const fetchUsdToRialRate = async (): Promise<number | null> => {
  try {
    const response = await fetch("/api/exchangeRate", {
      // Prevent browser caching to ensure we always get the server rate
      cache: "no-store",
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
};
