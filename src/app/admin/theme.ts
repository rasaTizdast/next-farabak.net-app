import { theme, type ThemeConfig } from "antd";

/**
 * Dark theme for the admin panel.
 *
 * Mirrors the palette previously forced via styled-JSX important
 * overrides so Ant Design components render dark natively:
 *  - containers: gray-800 (#1f2937)
 *  - headers: gray-900 (#111827)
 *  - hover/inputs: gray-700 (#374151)
 *  - borders: gray-600 (#4b5563) / gray-700 (#374151)
 *  - primary accent: blue-500 (#3b82f6)
 */
export const adminDarkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#3b82f6",
    colorInfo: "#3b82f6",
    colorLink: "#3b82f6",
    colorBgBase: "#030712",
    colorBgLayout: "#030712",
    colorBgContainer: "#1f2937",
    colorBgElevated: "#1f2937",
    colorBorder: "#4b5563",
    colorBorderSecondary: "#374151",
    colorText: "#f3f4f6",
    colorTextSecondary: "#e5e7eb",
    colorTextTertiary: "#9ca3af",
    colorTextQuaternary: "#6b7280",
    borderRadius: 8,
    fontFamily: "var(--font-iran-yekan), system-ui, arial",
  },
  components: {
    Table: {
      headerBg: "#111827",
      headerColor: "#e5e7eb",
      headerSortActiveBg: "#111827",
      headerSortHoverBg: "#1f2937",
      rowHoverBg: "#374151",
      borderColor: "#374151",
      headerBorderRadius: 0,
      cellFontSize: 14,
      headerSplitColor: "#374151",
    },
    Select: {
      optionSelectedBg: "#3b82f6",
      optionActiveBg: "#374151",
      selectorBg: "#374151",
    },
    Modal: {
      contentBg: "#1f2937",
      headerBg: "#1f2937",
      titleColor: "#f3f4f6",
    },
    Drawer: {
      colorBgElevated: "#1f2937",
    },
    Popover: {
      colorBgElevated: "#1f2937",
    },
    Tabs: {
      itemSelectedColor: "#ffffff",
      itemHoverColor: "#ffffff",
      inkBarColor: "#3b82f6",
    },
    Pagination: {
      itemActiveBg: "#3b82f6",
      itemBg: "#1f2937",
      itemLinkBg: "#1f2937",
    },
    Input: {
      colorBgContainer: "#374151",
      activeBorderColor: "#3b82f6",
      hoverBorderColor: "#4b5563",
    },
    InputNumber: {
      colorBgContainer: "#374151",
    },
    Tag: {
      defaultBg: "#1f2937",
      defaultColor: "#e5e7eb",
    },
    Empty: {
      colorTextDescription: "#9ca3af",
    },
  },
};
