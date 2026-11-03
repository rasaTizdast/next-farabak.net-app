import type { ScannerFitFacts } from "./types";

// Keep only dimensions verified on Farabak-listed product detail pages.
// The current live detail and specification endpoints do not publish usable
// structured aperture or chassis dimensions, so candidates stay out of scoring.
export const scannerCatalog: ScannerFitFacts[] = [];
