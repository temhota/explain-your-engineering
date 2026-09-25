"use client";
import { App, ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
export function UIProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider locale={enUS}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
