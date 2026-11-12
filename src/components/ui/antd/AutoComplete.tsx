"use client";
import { AutoComplete as AntAutoComplete, AutoCompleteProps } from "antd";

export function AutoComplete(props: AutoCompleteProps) {
  return (
    <AntAutoComplete
      allowClear
      placeholder="جستجو..."
      filterOption={(input, option) =>
        String(option?.value ?? "")
          .toLowerCase()
          .includes(input.toLowerCase())
      }
      {...props}
    />
  );
}
