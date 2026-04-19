export type MapRegion = "world" | "europe" | "asia" | "africa";
export type MapStyle = "minimal" | "atlas" | "dark" | "school";

export interface ParsedPrompt {
  originalPrompt: string;
  region: MapRegion;
  style: MapStyle;
  labels: boolean;
  colorfulness: number;
  variation: number;
}
