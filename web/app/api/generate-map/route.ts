import { NextRequest, NextResponse } from "next/server";

type MapRegion = "world" | "europe" | "asia" | "africa";
type MapStyle = "minimal" | "atlas" | "dark" | "school";

interface ParsedPrompt {
  originalPrompt: string;
  region: MapRegion;
  style: MapStyle;
  labels: boolean;
  colorfulness: number;
  variation: number;
  withWater: boolean;
  intelligence: number;
}

interface CountryShape {
  id: string;
  name: string;
  region: Exclude<MapRegion, "world">;
  points: string;
  labelX: number;
  labelY: number;
}

function detectRegion(text: string): MapRegion {
  if (/(европ|europe)/i.test(text)) return "europe";
  if (/(ази|asia)/i.test(text)) return "asia";
  if (/(африк|africa)/i.test(text)) return "africa";
  return "world";
}

function detectStyle(text: string): MapStyle {
  if (/(минимал|minimal)/i.test(text)) return "minimal";
  if (/(атлас|atlas)/i.test(text)) return "atlas";
  if (/(темн|dark)/i.test(text)) return "dark";
  if (/(школь|school)/i.test(text)) return "school";
  return "minimal";
}

function detectLabels(text: string): boolean {
  return /(подпис|label|назван)/i.test(text);
}

function detectColorfulness(text: string): number {
  if (/(мягк|soft|pastel)/i.test(text)) return 0.45;
  if (/(ярк|bright|colorful)/i.test(text)) return 0.95;
  return 0.7;
}

function detectVariation(text: string): number {
  if (/(слегк|чуть|немного)/i.test(text)) return 0.28;
  if (/(сильно|очень|жестко)/i.test(text)) return 0.85;
  return 0.5;
}

function detectWater(text: string, withWater?: boolean): boolean {
  if (typeof withWater === "boolean") return withWater;
  if (/(без воды|no water)/i.test(text)) return false;
  return /(вода|океан|море|sea|ocean|water)/i.test(text);
}

function detectIntelligence(text: string): number {
  let score = 0.5;
  if (/(детал|detail|качеств|quality)/i.test(text)) score += 0.15;
  if (/(нейрон|ai|ии|умн)/i.test(text)) score += 0.2;
  if (/(реальн|realistic|точн)/i.test(text)) score += 0.1;
  return Math.min(score, 1);
}

function parsePrompt(prompt: string, withWater?: boolean): ParsedPrompt {
  return {
    originalPrompt: prompt,
    region: detectRegion(prompt),
    style: detectStyle(prompt),
    labels: detectLabels(prompt),
    colorfulness: detectColorfulness(prompt),
    variation: detectVariation(prompt),
    withWater: detectWater(prompt, withWater),
    intelligence: detectIntelligence(prompt)
  };
}

function getStylePreset(style: MapStyle, withWater: boolean) {
  switch (style) {
    case "atlas":
      return {
        background: withWater ? "#cfe0ea" : "#f8f1dc",
        border: "#5b4730",
        label: "#3f2f1f",
        water: "#bfd8e6",
        waterStroke: "#8fb4c4",
        palette: ["#d9c59a", "#c9ddb5", "#e8b67a", "#a8cbb7", "#d7a0a0", "#b3c7e6"]
      };
    case "dark":
      return {
        background: withWater ? "#09111b" : "#10141c",
        border: "#d7e3ff",
        label: "#f4f8ff",
        water: "#10253c",
        waterStroke: "#274f73",
        palette: ["#29435c", "#386fa4", "#4f6d7a", "#6b9080", "#7d5ba6", "#bc4b51"]
      };
    case "school":
      return {
        background: withWater ? "#dff1ff" : "#ffffff",
        border: "#1a1a1a",
        label: "#111111",
        water: "#b7e3ff",
        waterStroke: "#6eb3e6",
        palette: ["#f9c74f", "#90be6d", "#43aa8b", "#577590", "#f9844a", "#f94144"]
      };
    case "minimal":
    default:
      return {
        background: withWater ? "#eaf4ff" : "#f7f8fb",
        border: "#20263a",
        label: "#20263a",
        water: "#d7ebff",
        waterStroke: "#9ec8f8",
        palette: ["#c7d2fe", "#fde68a", "#bfdbfe", "#fecaca", "#bbf7d0", "#ddd6fe"]
      };
  }
}

const COUNTRY_SHAPES: CountryShape[] = [
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

function getShapesForRegion(region: MapRegion) {
  if (region === "world") return COUNTRY_SHAPES;
  return COUNTRY_SHAPES.filter((shape) => shape.region === region);
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h >>> 0) || 1;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
}

function tweakColor(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + amount, g + amount, b + amount);
}

function varyPolygon(points: string, rand: () => number, variation: number, intelligence: number): string {
  const maxShift = 6 + 10 * variation * intelligence;
  return points
    .split(" ")
    .map((pair, index) => {
      const [xStr, yStr] = pair.split(",");
      const x = Number(xStr);
      const y = Number(yStr);
      const wave = Math.sin(index * 1.3 + rand() * 3.14) * variation * 3;
      const nx = x + (rand() - 0.5) * maxShift + wave;
      const ny = y + (rand() - 0.5) * maxShift - wave * 0.6;
      return `${nx.toFixed(1)},${ny.toFixed(1)}`;
    })
    .join(" ");
}

function createWaterPaths(region: MapRegion, rand: () => number) {
  const jitter = () => (rand() - 0.5) * 12;

  if (region === "europe") {
    return [
      `M 70 ${135 + jitter()} C 180 ${100 + jitter()}, 290 ${115 + jitter()}, 380 ${150 + jitter()} S 560 ${210 + jitter()}, 640 ${180 + jitter()} L 640 80 L 70 80 Z`,
      `M 60 ${340 + jitter()} C 150 ${300 + jitter()}, 250 ${295 + jitter()}, 355 ${325 + jitter()} S 520 ${370 + jitter()}, 650 ${350 + jitter()} L 650 520 L 60 520 Z`
    ];
  }

  if (region === "asia") {
    return [
      `M 470 ${120 + jitter()} C 610 ${80 + jitter()}, 790 ${95 + jitter()}, 910 ${160 + jitter()} L 910 50 L 470 50 Z`,
      `M 760 ${300 + jitter()} C 850 ${320 + jitter()}, 920 ${390 + jitter()}, 950 ${480 + jitter()} L 950 680 L 760 680 Z`
    ];
  }

  if (region === "africa") {
    return [
      `M 120 ${300 + jitter()} C 160 ${250 + jitter()}, 220 ${220 + jitter()}, 270 ${250 + jitter()} L 270 680 L 120 680 Z`,
      `M 430 ${250 + jitter()} C 520 ${260 + jitter()}, 610 ${330 + jitter()}, 670 ${430 + jitter()} L 670 680 L 430 680 Z`
    ];
  }

  return [
    `M 0 70 C 220 20, 440 120, 670 80 S 900 40, 1000 100 L 1000 0 L 0 0 Z`,
    `M 0 620 C 190 570, 330 655, 520 610 S 790 560, 1000 630 L 1000 700 L 0 700 Z`
  ];
}

function generateMapSvg(parsed: ParsedPrompt): string {
  const width = 1000;
  const height = 700;
  const preset = getStylePreset(parsed.style, parsed.withWater);
  const shapes = getShapesForRegion(parsed.region);
  const seed = hashString(parsed.originalPrompt + String(parsed.withWater));
  const rand = mulberry32(seed);

  const title = parsed.region === "world"
    ? "World Political Map"
    : `${parsed.region[0].toUpperCase()}${parsed.region.slice(1)} Political Map`;

  const waterPaths = parsed.withWater
    ? createWaterPaths(parsed.region, rand)
        .map((d) => `<path d="${d}" fill="${preset.water}" stroke="${preset.waterStroke}" stroke-width="2" opacity="0.95" />`)
        .join("\n")
    : "";

  const polygons = shapes
    .map((shape, index) => {
      const baseColor = preset.palette[index % preset.palette.length];
      const brightnessShift = (rand() - 0.5) * 50 * parsed.colorfulness;
      const fill = tweakColor(baseColor, brightnessShift);
      const points = varyPolygon(shape.points, rand, parsed.variation, parsed.intelligence);
      const shadowDx = ((rand() - 0.5) * 3).toFixed(1);
      const shadowDy = ((rand() - 0.5) * 3).toFixed(1);

      return `
        <polygon
          points="${points}"
          fill="${fill}"
          stroke="${preset.border}"
          stroke-width="2"
          stroke-linejoin="round"
          transform="translate(${shadowDx}, ${shadowDy})"
          opacity="0.18"
        />
        <polygon
          points="${points}"
          fill="${fill}"
          stroke="${preset.border}"
          stroke-width="2"
          stroke-linejoin="round"
        />
        ${parsed.labels ? `<text x="${shape.labelX}" y="${shape.labelY}" font-size="14" text-anchor="middle" fill="${preset.label}" font-family="Arial, sans-serif" font-weight="700">${shape.name}</text>` : ""}
      `;
    })
    .join("\n");

  const neuralInfo = `Neural detail ${Math.round(parsed.intelligence * 100)}%`;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="${preset.background}" />
    ${waterPaths}
    <text x="40" y="52" font-size="30" fill="${preset.label}" font-family="Arial, sans-serif" font-weight="700">${title}</text>
    <text x="40" y="82" font-size="15" fill="${preset.label}" font-family="Arial, sans-serif" opacity="0.8">Generated by PoliteAI · ${neuralInfo}</text>
    <g>${polygons}</g>
  </svg>`;
}

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = String(body?.prompt || "").trim();
    const withWater = typeof body?.withWater === "boolean" ? body.withWater : undefined;

    if (!prompt) {
      return NextResponse.json({ error: "Пустой prompt" }, { status: 400 });
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const parsed = parsePrompt(prompt, withWater);
    const svg = generateMapSvg(parsed);
    const image = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

    return NextResponse.json({ ok: true, image, debug: parsed });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 });
  }
}
