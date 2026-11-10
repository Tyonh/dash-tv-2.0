"use client";

import { NewsTicker } from "./NewsTicker";
import { PodioSection } from "./PodioSection";
import { PositivacaoSection } from "./PositivacaoSection";
import { RankingSection } from "./RankingSection";
import { WeatherWidget } from "./WeatherWidget";

type Props = { gatilho: number };

export function DataSlide({ gatilho }: Props) {
  return (
    <div className="flex h-full w-full flex-col">
      <RankingSection gatilho={gatilho} />
      <PositivacaoSection gatilho={gatilho} />
      <PodioSection gatilho={gatilho} />
      <WeatherWidget />
      <NewsTicker gatilho={gatilho} />
    </div>
  );
}
