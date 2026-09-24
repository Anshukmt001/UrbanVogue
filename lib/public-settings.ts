"use client";

import { useEffect, useState } from "react";

export interface PublicSettings {
  campaignStatus: "open" | "paused" | "sold_out";
  earlyAccessLimit: number;
  tenPercentLimit: number;
  fivePercentLimit: number;
  tierOnePercent: number;
  tierTwoPercent: number;
  allowRegistration: boolean;
}

export const DEFAULT_PUBLIC_SETTINGS: PublicSettings = {
  campaignStatus: "open",
  earlyAccessLimit: 100,
  tenPercentLimit: 50,
  fivePercentLimit: 50,
  tierOnePercent: 10,
  tierTwoPercent: 5,
  allowRegistration: true,
};

let cachedSettings: PublicSettings | null = null;
let inFlight: Promise<PublicSettings> | null = null;

export function fetchPublicSettings(): Promise<PublicSettings> {
  if (cachedSettings) return Promise.resolve(cachedSettings);
  if (!inFlight) {
    inFlight = fetch("/api/settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json?.success || !json.data) return DEFAULT_PUBLIC_SETTINGS;
        return { ...DEFAULT_PUBLIC_SETTINGS, ...json.data };
      })
      .catch(() => DEFAULT_PUBLIC_SETTINGS)
      .then((value) => {
        cachedSettings = value;
        inFlight = null;
        return value;
      });
  }
  return inFlight;
}

export function usePublicSettings(): PublicSettings {
  const [settings, setSettings] = useState<PublicSettings>(
    cachedSettings ?? DEFAULT_PUBLIC_SETTINGS
  );

  useEffect(() => {
    let active = true;
    fetchPublicSettings().then((value) => {
      if (active) setSettings(value);
    });
    return () => {
      active = false;
    };
  }, []);

  return settings;
}
