"use client";

import React, { useMemo, useState } from "react";

import { Select } from "antd";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import arLocale from "i18n-iso-countries/langs/ar.json";

countries.registerLocale(enLocale);
countries.registerLocale(arLocale);

const fallbackTimeZones = [
  "UTC",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

function getAllTimeZones() {
  try {
    // ✅ Modern browsers / Node
    if (
      typeof Intl !== "undefined" &&
      typeof Intl.supportedValuesOf === "function"
    ) {
      const zones = Intl.supportedValuesOf("timeZone");
      // sometimes "Etc/UTC" exists too; keep list unique + sorted
      return Array.from(new Set(zones)).sort();
    }
  } catch {}
  return fallbackTimeZones;
}

export function TimeZoneSelect({
  value,
  onChange,
  placeholder = "Select time zone…",
  style,
}) {
  const [search, setSearch] = useState("");

  const timeZones = useMemo(() => getAllTimeZones(), []);

  // AntD v5: options prop is best for performance
  const options = useMemo(
    () =>
      timeZones.map((tz) => ({
        label: tz,
        value: tz,
      })),
    [timeZones]
  );

  return (
    <Select
      showSearch
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ width: "100%", ...style }}
      options={options}
      // better UX
      allowClear
      // keep typed text
      searchValue={search}
      onSearch={setSearch}
      onBlur={() => setSearch("")}
      // fast, case-insensitive filter
      filterOption={(input, option) =>
        (option?.value ?? "").toLowerCase().includes(input.toLowerCase())
      }
      // optional: nice dropdown height
      listHeight={320}
      virtual
    />
  );
}

export function CountrySelect({
  value,
  onChange,
  placeholder = "Select country…",
  size = "middle",
  allowClear = true,
  locale = "en", // "ar" لو عايز عربي
}) {
  const options = useMemo(() => {
    const names = countries.getNames(locale, { select: "official" });
    return Object.entries(names)
      .map(([code, name]) => ({ value: code, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [locale]);

  return (
    <Select
      showSearch
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      options={options}
      allowClear={allowClear}
      size={size}
      listHeight={320}
      virtual
      filterOption={(input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase()) ||
        (option?.value ?? "").toLowerCase().includes(input.toLowerCase())
      }
    />
  );
}
