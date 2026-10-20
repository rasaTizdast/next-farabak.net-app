export type HomepageTestimonial = {
  quote: string;
  name: string;
  role: string;
  source: string;
  approvedForPublication: boolean;
};

export const HISTORY_START_YEAR = 1381;

// Add real, attributed quotes only after the customer approves public use.
export const homepageTestimonials: HomepageTestimonial[] = [];
