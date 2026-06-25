"use client";

import { useMapStore } from "../hooks/useMapStore";
import {
  MousePointer2, Pencil, ArrowUpRight, Circle, Type,
  Eraser, Undo2, Redo2, HelpCircle, Swords, Shield, RotateCcw, StickyNote,
  MousePointer, Square,
} from "lucide-react";
import { Tool, IconName, EraserMode } from "../types";
import Image from "next/image";

const tools: { id: Tool; icon: any; label: string; shortcut: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select / Move", shortcut: "V" },
  { id: "pencil", icon: Pencil, label: "Draw Path", shortcut: "P" },
  { id: "arrow", icon: ArrowUpRight, label: "Arrow", shortcut: "A" },
  { id: "circle", icon: Circle, label: "Circle Zone", shortcut: "C" },
  { id: "text", icon: Type, label: "Text Note", shortcut: "T" },
  { id: "eraser", icon: Eraser, label: "Eraser", shortcut: "E" },
  { id: "icon", icon: Swords, label: "Place Icon", shortcut: "I" },
];

const iconOptions: { id: IconName; img: string; label: string }[] = [
  { id: "swords", img: "/swords.png", label: "Swords" },
  { id: "defence", img: "/defence.png", label: "Defence" },
];

const GOLD = "#c09440";
const GOLD_LIGHT = "#e3c070";

export default function Toolbar() {
  const { tool, team, color, strokeWidth, selectedIcon, eraserMode, setTool, setTeam, setColor, setStrokeWidth, setSelectedIcon, setEraserMode } = useMapStore();

  return (
    <div className="w-12 bg-zinc-950 border-r border-zinc-800 flex flex-col items-center py-2 gap-1 shrink-0">
      {tools.map((t) => {
        const Icon = t.icon;
        const isActive = tool === t.id;
        return (
          <button key={t.id} onClick={() => setTool(t.id)} title={`${t.label} (${t.shortcut})`}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all
              ${isActive ? "text-zinc-950 shadow-lg" : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"}`}
            style={isActive ? { background: `linear-gradient(229deg, ${GOLD} 17.3%, ${GOLD_LIGHT} 83.26%)` } : {}}>
            <Icon size={16} />
          </button>
        );
      })}

      {/* Icon sub-picker */}
      {tool === "icon" && (
        <div className="flex flex-col gap-1 mt-1">
          {iconOptions.map((io) => (
            <button key={io.id} onClick={() => setSelectedIcon(io.id)} title={io.label}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all p-0.5
                ${selectedIcon === io.id ? "ring-2 ring-amber-500" : "hover:bg-zinc-800"}`}>
              <Image src={io.img} alt={io.label} width={28} height={28} className="object-contain brightness-0 invert" />
            </button>
          ))}
        </div>
      )}

      {/* Eraser mode sub-picker */}
      {tool === "eraser" && (
        <div className="flex flex-col gap-1 mt-1">
          {([
            { id: "single" as EraserMode, icon: MousePointer, label: "Single erase" },
            { id: "box" as EraserMode, icon: Square, label: "Box erase" },
          ]).map((em) => (
            <button key={em.id} onClick={() => setEraserMode(em.id)} title={em.label}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all
                ${eraserMode === em.id ? "text-zinc-950" : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"}`}
              style={eraserMode === em.id ? { background: `linear-gradient(229deg, ${GOLD} 17.3%, ${GOLD_LIGHT} 83.26%)` } : {}}>
              <em.icon size={14} />
            </button>
          ))}
        </div>
      )}

      <div className="w-6 h-px bg-zinc-800 my-2" />

      {/* Team toggle */}
      <button onClick={() => setTeam(team === "blue" ? "red" : "blue")}
        title={`Switch to ${team === "blue" ? "Red" : "Blue"}`}
        className="w-9 h-9 rounded-lg flex items-center justify-center border-2 border-zinc-700 transition-all hover:border-zinc-500">
        <div className="w-3 h-3 rounded-full" style={{ background: `linear-gradient(229deg, ${GOLD} 17.3%, ${GOLD_LIGHT} 83.26%)` }} />
      </button>

      {/* Colors: red, green, blue, orange */}
      <div className="flex flex-col gap-1 mt-2">
        {["#EF4444", "#22C55E", "#3B82F6", "#F97316"].map((c) => (
          <button key={c} onClick={() => setColor(c)}
            className={`w-5 h-5 rounded-full border-2 mx-auto transition-all ${color === c ? "border-white scale-125" : "border-zinc-600 hover:scale-110"}`}
            style={{ backgroundColor: c }} />
        ))}
      </div>

      {/* Stroke width */}
      <div className="flex flex-col gap-1 mt-2 items-center">
        {[2, 3, 5, 8].map((w) => (
          <button key={w} onClick={() => setStrokeWidth(w)} title={`${w}px`}
            className={`w-7 h-3 rounded flex items-center justify-center ${strokeWidth === w ? "bg-zinc-700" : "hover:bg-zinc-800"}`}>
            <div className="rounded-full" style={{ width: `${w * 2 + 4}px`, height: `${w}px`, background: `linear-gradient(229deg, ${GOLD} 17.3%, ${GOLD_LIGHT} 83.26%)` }} />
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <button onClick={() => useMapStore.getState().undo()} title="Undo (Ctrl+Z)"
        className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300">
        <Undo2 size={16} />
      </button>
      <button onClick={() => useMapStore.getState().redo()} title="Redo (Ctrl+Y)"
        className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300">
        <Redo2 size={16} />
      </button>
      <button onClick={() => useMapStore.getState().setNotesOpen(!useMapStore.getState().notesOpen)} title="Notes"
        className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300">
        <StickyNote size={16} />
      </button>
      <button onClick={() => { if (confirm("Reset everything?")) useMapStore.getState().resetAll(); }} title="Reset all"
        className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-800 hover:text-red-400">
        <RotateCcw size={16} />
      </button>
      <button onClick={() => useMapStore.getState().setShowHelp(true)} title="Shortcuts (?)"
        className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 mb-1">
        <HelpCircle size={16} />
      </button>
    </div>
  );
}
