import { LanePoint } from "../types";

export const MAP_SIZE = 100;

export const lanePoints: LanePoint[] = [
  // Blue side (bottom-left base)
  { id: "blue-support", label: "S", x: 85, y: 80, team: "blue" },
  { id: "blue-top", label: "T", x: 18, y: 15, team: "blue" },
  { id: "blue-mid", label: "M", x: 48, y: 50, team: "blue" },
  { id: "blue-bot", label: "B", x: 88, y: 85, team: "blue" },
  { id: "blue-jg", label: "J", x: 54, y: 73, team: "blue" },

  // Red side (top-right base)
  { id: "red-support", label: "S", x: 90, y: 76, team: "red" },
  { id: "red-top", label: "T", x: 24, y: 11, team: "red" },
  { id: "red-mid", label: "M", x: 56, y: 43, team: "red" },
  { id: "red-bot", label: "B", x: 93, y: 80, team: "red" },
  { id: "red-jg", label: "J", x: 77, y: 47, team: "red" },
];
