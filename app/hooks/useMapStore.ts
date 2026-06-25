import { create } from "zustand";
import {
  Tool,
  Team,
  DrawPath,
  DrawCircle,
  DrawText,
  LanePoint,
  MapIcon,
  IconName,
} from "../types";
import { lanePoints as defaultLanePoints } from "../data/mapData";

export interface Note {
  id: string;
  text: string;
  createdAt: number;
}

interface MapState {
  tool: Tool;
  team: Team;
  color: string;
  strokeWidth: number;
  fontSize: number;
  selectedId: string | null;
  selectedIcon: IconName;
  lanePoints: LanePoint[];
  paths: DrawPath[];
  circles: DrawCircle[];
  texts: DrawText[];
  icons: MapIcon[];
  drawingPoints: number[];
  isDrawing: boolean;
  showHelp: boolean;
  notes: Note[];
  notesOpen: boolean;

  setTool: (tool: Tool) => void;
  setTeam: (team: Team) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (w: number) => void;
  setSelectedId: (id: string | null) => void;
  setSelectedIcon: (icon: IconName) => void;

  moveLanePoint: (id: string, x: number, y: number) => void;

  addPath: (path: DrawPath) => void;
  removePath: (id: string) => void;

  addCircle: (circle: DrawCircle) => void;
  removeCircle: (id: string) => void;

  addText: (text: DrawText) => void;
  updateText: (id: string, updates: Partial<DrawText>) => void;
  removeText: (id: string) => void;

  addIcon: (icon: MapIcon) => void;
  moveIcon: (id: string, x: number, y: number) => void;
  removeIcon: (id: string) => void;

  setDrawingPoints: (points: number[]) => void;
  setIsDrawing: (drawing: boolean) => void;

  addNote: (text: string) => void;
  updateNote: (id: string, text: string) => void;
  removeNote: (id: string) => void;
  setNotesOpen: (open: boolean) => void;
  resetAll: () => void;

  undo: () => void;
  redo: () => void;
  history: Partial<MapState>[];
  historyIndex: number;

  setShowHelp: (show: boolean) => void;
}

const pickState = (s: MapState) => ({
  lanePoints: s.lanePoints,
  paths: s.paths,
  circles: s.circles,
  texts: s.texts,
  icons: s.icons,
});

const generateId = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

export const useMapStore = create<MapState>((set, get) => ({
  tool: "select",
  team: "blue",
  color: "#EF4444",
  strokeWidth: 3,
  fontSize: 14,
  selectedId: null,
  selectedIcon: "swords" as IconName,
  lanePoints: [...defaultLanePoints],
  paths: [],
  circles: [],
  texts: [],
  icons: [],
  drawingPoints: [],
  isDrawing: false,
  showHelp: false,
  notes: (() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("hok-notes") || "[]"); } catch { return []; }
  })(),
  notesOpen: false,
  history: [],
  historyIndex: -1,

  setTool: (tool) => set({ tool, selectedId: null }),
  setTeam: (team) => set({ team }),
  setColor: (color) => set({ color }),
  setStrokeWidth: (w) => set({ strokeWidth: w }),
  setSelectedId: (id) => set({ selectedId: id }),
  setSelectedIcon: (icon) => set({ selectedIcon: icon }),

  moveLanePoint: (id, x, y) => {
    const state = get();
    set({
      lanePoints: state.lanePoints.map((p) => (p.id === id ? { ...p, x, y } : p)),
      history: [...state.history.slice(0, state.historyIndex + 1), pickState(state)],
      historyIndex: state.historyIndex + 1,
    });
  },

  addPath: (path) => {
    const state = get();
    set({
      paths: [...state.paths, path],
      history: [...state.history.slice(0, state.historyIndex + 1), pickState(state)],
      historyIndex: state.historyIndex + 1,
    });
  },
  removePath: (id) => set((s) => ({ paths: s.paths.filter((p) => p.id !== id) })),

  addCircle: (circle) => {
    const state = get();
    set({
      circles: [...state.circles, circle],
      history: [...state.history.slice(0, state.historyIndex + 1), pickState(state)],
      historyIndex: state.historyIndex + 1,
    });
  },
  removeCircle: (id) => set((s) => ({ circles: s.circles.filter((c) => c.id !== id) })),

  addText: (text) => {
    const state = get();
    set({
      texts: [...state.texts, text],
      history: [...state.history.slice(0, state.historyIndex + 1), pickState(state)],
      historyIndex: state.historyIndex + 1,
    });
  },
  updateText: (id, updates) => set((s) => ({
    texts: s.texts.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  })),
  removeText: (id) => set((s) => ({ texts: s.texts.filter((t) => t.id !== id) })),

  addIcon: (icon) => {
    const state = get();
    set({
      icons: [...state.icons, icon],
      history: [...state.history.slice(0, state.historyIndex + 1), pickState(state)],
      historyIndex: state.historyIndex + 1,
    });
  },
  moveIcon: (id, x, y) => set((s) => ({
    icons: s.icons.map((ic) => (ic.id === id ? { ...ic, x, y } : ic)),
  })),
  removeIcon: (id) => {
    const state = get();
    set({
      icons: state.icons.filter((ic) => ic.id !== id),
      history: [...state.history.slice(0, state.historyIndex + 1), pickState(state)],
      historyIndex: state.historyIndex + 1,
    });
  },

  setDrawingPoints: (points) => set({ drawingPoints: points }),
  setIsDrawing: (drawing) => set({ isDrawing: drawing }),

  addNote: (text) => {
    const note: Note = { id: generateId(), text, createdAt: Date.now() };
    const notes = [...get().notes, note];
    set({ notes });
    localStorage.setItem("hok-notes", JSON.stringify(notes));
  },
  updateNote: (id, text) => {
    const notes = get().notes.map((n) => (n.id === id ? { ...n, text } : n));
    set({ notes });
    localStorage.setItem("hok-notes", JSON.stringify(notes));
  },
  removeNote: (id) => {
    const notes = get().notes.filter((n) => n.id !== id);
    set({ notes });
    localStorage.setItem("hok-notes", JSON.stringify(notes));
  },
  setNotesOpen: (open) => set({ notesOpen: open }),

  resetAll: () => {
    set({
      lanePoints: [...defaultLanePoints],
      paths: [],
      circles: [],
      texts: [],
      icons: [],
      notes: [],
      selectedId: null,
      history: [],
      historyIndex: -1,
    });
    localStorage.removeItem("hok-notes");
  },

  undo: () => {
    const state = get();
    if (state.historyIndex < 0) return;
    const prev = state.history[state.historyIndex];
    set({ ...prev, historyIndex: state.historyIndex - 1 });
  },
  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;
    const next = state.history[state.historyIndex + 1];
    set({ ...next, historyIndex: state.historyIndex + 1 });
  },

  setShowHelp: (show) => set({ showHelp: show }),
}));
