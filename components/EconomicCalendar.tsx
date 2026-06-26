"use client";

import { useEffect, useRef } from "react";

/**
 * Calendario económico de TradingView (embebible). Muestra las mismas noticias
 * de alto impacto que ForexFactory (NFP, FOMC, IPC, etc.), integrado al sitio.
 */
export function EconomicCalendar() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    container.appendChild(widget);

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      isTransparent: false,
      locale: "es",
      countryFilter: "us", // solo noticias de Estados Unidos (dólar)
      importanceFilter: "-1,0,1",
      width: "100%",
      height: 680,
    });
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ minHeight: 680 }}
    />
  );
}
