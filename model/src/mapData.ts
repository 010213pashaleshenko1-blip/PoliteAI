import { MapRegion } from "./types.js";

export interface CountryShape {
  id: string;
  name: string;
  region: Exclude<MapRegion, "world">;
  points: string;
  labelX: number;
  labelY: number;
}

export const COUNTRY_SHAPES: CountryShape[] = [
  { id: "france", name: "France", region: "europe", points: "180,220 225,205 255,225 245,270 200,282 170,255", labelX: 215, labelY: 240 },
  { id: "germany", name: "Germany", region: "europe", points: "255,180 290,172 305,205 294,242 260,236 245,208", labelX: 278, labelY: 206 },
  { id: "spain", name: "Spain", region: "europe", points: "120,270 175,258 205,285 195,322 130,330 105,302", labelX: 155, labelY: 295 },
  { id: "italy", name: "Italy", region: "europe", points: "305,255 330,250 342,270 334,295 345,320 330,340 313,322 318,296", labelX: 330, labelY: 285 },
  { id: "poland", name: "Poland", region: "europe", points: "310,165 350,165 360,197 340,223 307,215 298,188", labelX: 330, labelY: 192 },
  { id: "ukraine", name: "Ukraine", region: "europe", points: "360,180 430,175 448,208 430,232 370,238 350,212", labelX: 400, labelY: 205 },

  { id: "kazakhstan", name: "Kazakhstan", region: "asia", points: "520,185 630,172 675,205 660,242 560,248 510,218", labelX: 595, labelY: 208 },
  { id: "china", name: "China", region: "asia", points: "690,175 785,168 835,210 808,280 720,290 675,235", labelX: 755, labelY: 220 },
  { id: "india", name: "India", region: "asia", points: "660,295 712,290 738,340 710,402 665,380 648,330", labelX: 695, labelY: 335 },
  { id: "mongolia", name: "Mongolia", region: "asia", points: "718,138 790,138 810,166 745,176 705,162", labelX: 754, labelY: 155 },

  { id: "egypt", name: "Egypt", region: "africa", points: "355,352 392,350 402,392 390,435 350,430 340,385", labelX: 372, labelY: 388 },
  { id: "algeria", name: "Algeria", region: "africa", points: "228,350 310,340 338,392 315,465 240,470 205,400", labelX: 270, labelY: 398 },
  { id: "nigeria", name: "Nigeria", region: "africa", points: "315,425 362,423 370,465 330,488 300,462", labelX: 338, labelY: 452 },
  { id: "south-africa", name: "South Africa", region: "africa", points: "312,590 388,585 430,622 408,670 330,675 288,638", labelX: 360, labelY: 628 }
];

export function getShapesForRegion(region: MapRegion): CountryShape[] {
  if (region === "world") return COUNTRY_SHAPES;
  return COUNTRY_SHAPES.filter((shape) => shape.region === region);
}
