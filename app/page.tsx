"use client";

import dynamic from "next/dynamic";
import Toolbar from "./components/Toolbar";
import HelpModal from "./components/HelpModal";
import NotesSidebar from "./components/NotesSidebar";

const MapCanvas = dynamic(() => import("./components/MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-black">
      <div className="text-zinc-500 text-sm">Loading map...</div>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-zinc-950">

      <header className="h-10 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold tracking-tight" style={{ color: "#e3c070" }}>
            HoK Map Planner
          </h1>
          <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">Honor of Kings</span>
        </div>
        <div className="text-[10px] text-zinc-500">
          <kbd className="px-1 bg-zinc-800 rounded border border-zinc-700">?</kbd> shortcuts
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <Toolbar />
        <div className="flex-1 relative min-w-0">
          <MapCanvas />
        </div>
        <NotesSidebar />
      </div>

      <HelpModal />
    </div>
  );
}
