"use client";

import { memo } from "react";
import Script from "next/script";

/** Widget de clima de Fortaleza. Memoizado: o script do weatherwidget.io troca o <a> por um iframe. */
function WeatherWidgetBase() {
  return (
    <>
      <a
        className="weatherwidget-io"
        href="https://forecast7.com/pt/n3d73n38d53/fortaleza/"
        data-label_1="FORTALEZA"
        data-label_2="CLIMA"
        data-font="Ubuntu"
        data-icons="Climacons Animated"
        data-theme="original"
      >
        FORTALEZA CLIMA
      </a>
      <Script id="weatherwidget-io-js" src="https://weatherwidget.io/js/widget.min.js" strategy="afterInteractive" />
    </>
  );
}

export const WeatherWidget = memo(WeatherWidgetBase);
