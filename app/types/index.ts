export type Team = "blue" | "red";

export type Tool = "select" | "pencil" | "arrow" | "circle" | "text" | "eraser" | "icon";

export type IconName = "swords" | "defence";

export interface LanePoint {
  id: string;
  label: string;
  x: number;
  y: number;
  team: "blue" | "red";
}

export interface DrawPath {
  id: string;
  points: number[];
  color: string;
  strokeWidth: number;
  tool: "pencil" | "arrow";
  team: Team;
}

export interface DrawCircle {
  id: string;
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  color: string;
  strokeWidth: number;
  team: Team;
}

export interface DrawText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  team: Team;
}

export interface MapIcon {
  id: string;
  icon: IconName;
  x: number;
  y: number;
  color: string;
  size: number;
  team: Team;
}

export const BLUE_TEAM = "#3B82F6";
export const RED_TEAM = "#EF4444";
