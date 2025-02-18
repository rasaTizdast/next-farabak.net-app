export async function fetchUsdToRialRate() {
  try {
    const response = await fetch(
      "https://brsapi.ir/FreeTsetmcBourseApi/Api_Free_Gold_Currency_v2.json"
    );
    if (!response.ok) {
      console.error("Failed to fetch exchange rate:", response.statusText);
      return null;
    }

    const data = await response.json();
    const usdRate = data.currency.find(
      (item: any) => item.symbol === "USD"
    )?.price;

    if (!usdRate) {
      console.error("USD rate not found in the response");
      return null;
    }

    return usdRate;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return null;
  }
}
