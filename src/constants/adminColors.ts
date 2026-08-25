/**
 * Shared color tokens for the admin panel dark palette.
 *
 * Centralizes the hex values that were previously hardcoded in inline styles
 * (Card headStyle/bodyStyle, Modal/Drawer `styles`, Input/Tag/Badge `style`,
 * Statistic `valueStyle`, ...). Matches the tokens already defined in
 * `src/app/admin/theme.ts` (adminDarkTheme) so components stay in sync.
 *
 * Usage: `headStyle={{ backgroundColor: adminColors.panel }}`
 */
export const adminColors = {
  // Surfaces (light → deep)
  panelInner: "#1e293b",
  panel: "#1f2937",
  panelAlt: "#19202b",
  panelDeep: "#111827",
  panelDarker: "#121f3b",

  // Borders
  border: "#374151",
  borderLight: "#4b5563",
  borderSubtle: "#334155",
  borderSoft: "#f0f0f0",

  // Text
  textBright: "#f3f4f6",
  textLight: "#e5e7eb",
  textMuted: "#d1d5db",
  textPlaceholder: "#54647c",

  // Semantic / status
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  dangerStrong: "#f5222d",
  info: "#1668dc",
  successAnt: "#52c41a",
  green: "#16a34a",
  red: "#dc2626",

  // Neutral
  white: "#ffffff",
  black: "#000000",
} as const;
