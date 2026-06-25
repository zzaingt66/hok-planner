"use client";

import { useMapStore } from "../hooks/useMapStore";
import { X } from "lucide-react";

const shortcuts = [
  { key: "V", action: "Select / Move" },
  { key: "P", action: "Pencil (draw paths)" },
  { key: "A", action: "Arrow tool" },
  { key: "C", action: "Circle zone" },
  { key: "T", action: "Text note" },
  { key: "E", action: "Eraser" },
  { key: "I", action: "Place icon (Swords/Defence)" },
  { key: "Drag", action: "Move lane points & icons" },
  { key: "Delete", action: "Remove selected" },
  { key: "Ctrl+Z", action: "Undo" },
  { key: "Ctrl+Y", action: "Redo" },
  { key: "?", action: "Show this help" },
];

export default function HelpModal() {
  const { showHelp, setShowHelp } = useMapStore();
  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white border border-stone-200 rounded-xl shadow-2xl w-80 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-800">Shortcuts</h2>
          <button onClick={() => setShowHelp(false)} className="text-stone-400 hover:text-stone-700"><X size={20} /></button>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {shortcuts.map((s) => (
              <div key={s.key} className="flex items-center justify-between">
                <kbd className="px-2 py-0.5 bg-stone-100 border border-stone-200 rounded text-xs font-mono text-stone-600 min-w-[50px] text-center">{s.key}</kbd>
                <span className="text-xs text-stone-500">{s.action}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 border-t border-stone-200 text-center">
          <button onClick={() => setShowHelp(false)} className="px-4 py-1.5 bg-stone-100 text-stone-600 text-sm rounded hover:bg-stone-200">Close</button>
        </div>
      </div>
    </div>
  );
}
