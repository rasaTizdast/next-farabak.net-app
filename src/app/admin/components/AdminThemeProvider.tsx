"use client";

import { ConfigProvider } from "antd";
import faIR from "antd/locale/fa_IR";

import { adminDarkTheme } from "../theme";

export default function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider locale={faIR} theme={adminDarkTheme}>
      {children}
    </ConfigProvider>
  );
}
