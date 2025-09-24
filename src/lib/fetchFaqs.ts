import { FaqItem } from "@/components/FaqAccordion";

export async function fetchFaqs(): Promise<FaqItem[]> {
  try {
    // Use an absolute URL in production, or a relative URL in development
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const res = await fetch(`${baseUrl}/api/faqs/general`, {
      next: {
        revalidate: 300, // Cache for 5 minutes
      },
    });

    if (!res.ok) {
      console.error(`Error fetching FAQs: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return data.faqs || [];
  } catch (error) {
    console.error("Failed to fetch FAQs:", error);
    return [];
  }
}
