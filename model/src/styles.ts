import { MapStyle } from "./types.js";

export interface StylePreset {
  background: string;
  border: string;
  label: string;
  palette: string[];
}

export function getStylePreset(style: MapStyle): StylePreset {
  switch (style) {
    case "atlas":
      return {
        background: "#f8f1dc",
        border: "#5b4730",
        label: "#3f2f1f",
        palette: ["#d9c59a", "#c9ddb5", "#e8b67a", "#a8cbb7", "#d7a0a0", "#b3c7e6"]
      };
    case "dark":
      return {
        background: "#10141c",
        border: "#d7e3ff",
        label: "#f4f8ff",
        palette: ["#29435c", "#386fa4", "#4f6d7a", "#6b9080", "#7d5ba6", "#bc4b51"]
      };
    case "school":
      return {
        background: "#ffffff",
        border: "#1a1a1a",
        label: "#111111",
        palette: ["#f9c74f", "#90be6d", "#43aa8b", "#577590", "#f9844a", "#f94144"]
      };
    case "minimal":
    default:
      return {
        background: "#f7f8fb",
        border: "#20263a",
        label: "#20263a",
        palette: ["#c7d2fe", "#fde68a", "#bfdbfe", "#fecaca", "#bbf7d0", "#ddd6fe"]
      };
  }
}
