import type { ScannerFitFacts } from "./types";

// Confirmed in Farabak's X-ray category API on 2026-11-03:
// CTX 5800 (product 576) and CTX 9800 DSi (product 577), airport luggage.
// Manufacturer source pages are exact model pages. The published tunnel data
// gives maximum width at conveyor edge but no usable opening height. We store
// that width as a reference only; no fit comparison treats it as usable aperture.
export const scannerCatalog: ScannerFitFacts[] = [
  {
    productId: 576,
    name: "CTX 5800",
    href: "/products/x-ray/airport-luggage/ctx-5800",
    tunnelWidthMm: 750,
    tunnelHeightMm: null,
    tunnelWidthIsMaximumAtConveyorEdge: true,
    outerWidthMm: 1570,
    outerHeightMm: 1550,
    outerLengthMm: 2610,
    conveyorSpeedMps: 0.14,
    sourceUrl: "https://www.smithsdetection.com/products/ctx-5800/",
    checkedOn: "2026-11-03",
  },
  {
    productId: 577,
    name: "CTX 9800 DSi",
    href: "/products/x-ray/airport-luggage/ctx-9800-dsi",
    tunnelWidthMm: 1020,
    tunnelHeightMm: null,
    tunnelWidthIsMaximumAtConveyorEdge: true,
    outerWidthMm: 2400,
    outerHeightMm: 2177,
    outerLengthMm: 4803,
    conveyorSpeedMps: null,
    sourceUrl: "https://www.smithsdetection.com/products/ctx-9800-dsi/",
    checkedOn: "2026-11-03",
  },
];
