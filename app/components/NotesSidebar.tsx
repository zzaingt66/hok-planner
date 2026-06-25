"use client";

import { useState } from "react";
import { useMapStore } from "../hooks/useMapStore";
import { StickyNote, Plus, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function NotesSidebar() {
  const { notes, notesOpen, setNotesOpen, addNote, updateNote, removeNote } = useMapStore();
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleAdd = () => {
    if (newText.trim()) {
      addNote(newText.trim());
      setNewText("");
    }
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      updateNote(editingId, editText.trim());
      setEditingId(null);
    }
  };

  return (
    <div className={`bg-zinc-950 border-l border-zinc-800 transition-all duration-300 overflow-hidden shrink-0 ${notesOpen ? "w-60" : "w-0"}`}>
      <div className="w-60 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <StickyNote size={14} style={{ color: "#e3c070" }} />
            <span className="text-xs font-semibold" style={{ color: "#e3c070" }}>Notes</span>
          </div>
          <button onClick={() => setNotesOpen(false)} className="text-zinc-500 hover:text-white">
            <X size={14} />
          </button>
        </div>

        {/* Add note */}
        <div className="p-2 border-b border-zinc-800">
          <div className="flex gap-1">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="New note..."
              className="flex-1 bg-zinc-900 text-white text-xs rounded px-2 py-1.5 border border-zinc-700 focus:outline-none focus:border-amber-600"
            />
            <button onClick={handleAdd} disabled={!newText.trim()}
              className="w-7 h-7 rounded flex items-center justify-center shrink-0 disabled:opacity-30"
              style={{ background: `linear-gradient(229deg, #c09440 17.3%, #e3c070 83.26%)` }}>
              <Plus size={14} className="text-zinc-950" />
            </button>
          </div>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {notes.length === 0 && (
            <p className="text-zinc-600 text-[10px] text-center py-6">No notes yet</p>
          )}
          {notes.map((note) => (
            <div key={note.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 group">
              {editingId === note.id ? (
                <div className="flex gap-1">
                  <input
                    autoFocus
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingId(null); }}
                    className="flex-1 bg-zinc-800 text-white text-xs rounded px-2 py-1 border border-zinc-600 focus:outline-none focus:border-amber-600"
                  />
                  <button onClick={saveEdit} className="text-xs px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600">OK</button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-1">
                  <p
                    onClick={() => startEdit(note.id, note.text)}
                    className="text-xs text-zinc-300 flex-1 cursor-pointer hover:text-white break-words"
                  >
                    {note.text}
                  </p>
                  <button
                    onClick={() => removeNote(note.id)}
                    className="text-zinc-600 hover:text-red-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
              <span className="text-[9px] text-zinc-600 mt-1 block">
                {new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
