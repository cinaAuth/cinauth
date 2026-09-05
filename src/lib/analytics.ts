import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getVisitorId() {
  let v = localStorage.getItem("ca_visitor_id");
  if (!v) {
    v = uid();
    localStorage.setItem("ca_visitor_id", v);
  }
  return v;
}

function getSessionId() {
  let s = sessionStorage.getItem("ca_session_id");
  if (!s) {
    s = uid();
    sessionStorage.setItem("ca_session_id", s);
  }
  return s;
}

function parseUA() {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Other";
  const os = /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad|iPod/.test(ua)
      ? "iOS"
      : /Mac OS X/.test(ua)
        ? "macOS"
        : /Windows/.test(ua)
          ? "Windows"
          : /Linux/.test(ua)
            ? "Linux"
            : "Other";
  const device = /iPad|Tablet/.test(ua)
    ? "Tablet"
    : /Mobi|Android|iPhone/.test(ua)
      ? "Mobile"
      : "Desktop";
  return { browser, os, device };
}

function getCountry(): string | null {
  const locale = navigator.language || "";
  const parts = locale.split("-");
  const region = parts[parts.length - 1];
  return region && region.length === 2 ? region.toUpperCase() : null;
}

/** Records an anonymous page view for a storefront page. */
export function useTrackStoreView(storeId: string | undefined, path: string) {
  useEffect(() => {
    if (!storeId || typeof window === "undefined") return;
    const key = `ca_pv_${storeId}_${path}_${getSessionId()}_${Math.floor(Date.now() / 15000)}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const params = new URLSearchParams(window.location.search);
    const { browser, os, device } = parseUA();

    void supabase.from("store_page_views").insert({
      store_id: storeId,
      path,
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      referrer: document.referrer ? new URL(document.referrer).hostname : null,
      browser,
      os,
      device,
      country: getCountry(),
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
    });
  }, [storeId, path]);
}
