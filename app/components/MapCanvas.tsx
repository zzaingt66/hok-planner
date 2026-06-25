"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Circle, Text, Group, Rect } from "react-konva";
import { useMapStore } from "../hooks/useMapStore";
import { generateId } from "../lib/utils";
import { KonvaEventObject } from "konva/lib/Node";
import { IconName } from "../types";

interface ImgMeta {
  img: HTMLImageElement;
  natW: number;
  natH: number;
}

const ICON_SIZE = 32;

export default function MapCanvas() {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState({ w: 800, h: 800 });
  const [imgMeta, setImgMeta] = useState<ImgMeta | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [iconImages, setIconImages] = useState<Record<string, HTMLImageElement>>({});
  const [boxStart, setBoxStart] = useState<{ x: number; y: number } | null>(null);
  const [boxEnd, setBoxEnd] = useState<{ x: number; y: number } | null>(null);

  const {
    tool, team, color, strokeWidth, fontSize, selectedId, selectedIcon, eraserMode,
    lanePoints, paths, circles, texts, icons,
    drawingPoints, isDrawing,
    setSelectedId, moveLanePoint,
    addPath, removePath,
    addCircle, removeCircle,
    addText, updateText, removeText,
    addIcon, moveIcon, removeIcon, removeMultiple,
    setDrawingPoints, setIsDrawing,
  } = useMapStore();

  // Container resize
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setContainer({ w: containerRef.current.offsetWidth, h: containerRef.current.offsetHeight });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Load map image
  useEffect(() => {
    const img = new Image();
    img.src = "/hok-map.png";
    img.onload = () => setImgMeta({ img, natW: img.naturalWidth, natH: img.naturalHeight });
    img.onerror = () => {
      const S = 800;
      const c = document.createElement("canvas");
      c.width = S; c.height = S;
      const ctx = c.getContext("2d")!;
      const g = ctx.createLinearGradient(0, 0, S, S);
      g.addColorStop(0, "#0f1923"); g.addColorStop(0.5, "#1a2a3a"); g.addColorStop(1, "#0f1923");
      ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
      ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1;
      for (let i = 0; i < S; i += S / 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, S); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(S, i); ctx.stroke();
      }
      ctx.strokeStyle = "rgba(59,130,246,0.12)"; ctx.lineWidth = 40;
      ctx.beginPath(); ctx.moveTo(0, S); ctx.lineTo(S, 0); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(40, S - 40); ctx.lineTo(40, 40); ctx.lineTo(S - 40, 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(80, S - 80); ctx.lineTo(S / 2, S / 2); ctx.lineTo(S - 80, 80); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(40, S - 40); ctx.lineTo(S - 40, S - 40); ctx.lineTo(S - 40, 40); ctx.stroke();
      ctx.setLineDash([]);
      const ph = new Image();
      ph.src = c.toDataURL();
      ph.onload = () => setImgMeta({ img: ph, natW: S, natH: S });
    };
  }, []);

  // Load icon images from public/
  useEffect(() => {
    const sources: { key: IconName; src: string }[] = [
      { key: "swords", src: "/swords.png" },
      { key: "defence", src: "/defence.png" },
    ];
    const loaded: Record<string, HTMLImageElement> = {};
    let pending = sources.length;
    sources.forEach(({ key, src }) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loaded[key] = img;
        pending--;
        if (pending === 0) setIconImages({ ...loaded });
      };
      img.onerror = () => {
        pending--;
        if (pending === 0) setIconImages({ ...loaded });
      };
    });
  }, []);

  // Display rect preserving aspect ratio, centered
  const display = (() => {
    if (!imgMeta) return { x: 0, y: 0, w: container.w, h: container.h };
    const { natW, natH } = imgMeta;
    const scale = Math.min(container.w / natW, container.h / natH);
    const w = natW * scale;
    const h = natH * scale;
    return { x: (container.w - w) / 2, y: (container.h - h) / 2, w, h };
  })();

  const toNorm = useCallback((px: number, py: number) => ({
    x: ((px - display.x) / display.w) * 100,
    y: ((py - display.y) / display.h) * 100,
  }), [display]);

  const toPixel = useCallback((nx: number, ny: number) => ({
    x: display.x + (nx / 100) * display.w,
    y: display.y + (ny / 100) * display.h,
  }), [display]);

  const handleStageClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const target = e.target;
      const stage = stageRef.current;
      if (!stage || target.getStage() !== stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const coords = toNorm(pointer.x, pointer.y);

      if (tool === "icon") {
        addIcon({ id: generateId(), icon: selectedIcon, x: coords.x, y: coords.y, color, size: ICON_SIZE, team });
        return;
      }
      if (tool === "text") {
        const id = generateId();
        addText({ id, x: coords.x, y: coords.y, text: "Note", color, fontSize, team });
        setEditingTextId(id);
        return;
      }
      if (tool === "circle") {
        addCircle({ id: generateId(), x: coords.x, y: coords.y, radiusX: 5, radiusY: 5, color, strokeWidth, team });
        return;
      }
      if (tool === "select") setSelectedId(null);
    },
    [tool, team, color, strokeWidth, fontSize, selectedIcon, toNorm, addIcon, addText, addCircle, setSelectedId]
  );

  const handleMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (tool === "eraser" && eraserMode === "box") {
        const pointer = stageRef.current?.getPointerPosition();
        if (!pointer) return;
        setBoxStart(pointer);
        setBoxEnd(pointer);
        return;
      }
      if (tool === "pencil" || tool === "arrow") {
        const pointer = stageRef.current?.getPointerPosition();
        if (!pointer) return;
        setIsDrawing(true);
        setDrawingPoints([pointer.x, pointer.y]);
      }
    },
    [tool, eraserMode, setIsDrawing, setDrawingPoints]
  );

  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (tool === "eraser" && eraserMode === "box" && boxStart) {
        const pointer = stageRef.current?.getPointerPosition();
        if (!pointer) return;
        setBoxEnd(pointer);
        return;
      }
      if (!isDrawing || (tool !== "pencil" && tool !== "arrow")) return;
      const pointer = stageRef.current?.getPointerPosition();
      if (!pointer) return;
      setDrawingPoints([...drawingPoints, pointer.x, pointer.y]);
    },
    [isDrawing, tool, eraserMode, boxStart, drawingPoints, setDrawingPoints]
  );

  const handleMouseUp = useCallback(() => {
    if (tool === "eraser" && eraserMode === "box" && boxStart && boxEnd) {
      const x1 = Math.min(boxStart.x, boxEnd.x);
      const y1 = Math.min(boxStart.y, boxEnd.y);
      const x2 = Math.max(boxStart.x, boxEnd.x);
      const y2 = Math.max(boxStart.y, boxEnd.y);

      const idsToRemove: string[] = [];

      paths.forEach((p) => {
        for (let i = 0; i < p.points.length; i += 2) {
          const px = display.x + (p.points[i] / 100) * display.w;
          const py = display.y + (p.points[i + 1] / 100) * display.h;
          if (px >= x1 && px <= x2 && py >= y1 && py <= y2) {
            idsToRemove.push(p.id);
            break;
          }
        }
      });

      circles.forEach((c) => {
        const px = display.x + (c.x / 100) * display.w;
        const py = display.y + (c.y / 100) * display.h;
        if (px >= x1 && px <= x2 && py >= y1 && py <= y2) idsToRemove.push(c.id);
      });

      texts.forEach((t) => {
        const px = display.x + (t.x / 100) * display.w;
        const py = display.y + (t.y / 100) * display.h;
        if (px >= x1 && px <= x2 && py >= y1 && py <= y2) idsToRemove.push(t.id);
      });

      icons.forEach((ic) => {
        const px = display.x + (ic.x / 100) * display.w;
        const py = display.y + (ic.y / 100) * display.h;
        if (px >= x1 && px <= x2 && py >= y1 && py <= y2) idsToRemove.push(ic.id);
      });

      if (idsToRemove.length > 0) removeMultiple(idsToRemove);
      setBoxStart(null);
      setBoxEnd(null);
      return;
    }

    if (!isDrawing || (tool !== "pencil" && tool !== "arrow")) return;
    if (drawingPoints.length >= 4) {
      const normPoints: number[] = [];
      for (let i = 0; i < drawingPoints.length; i += 2) {
        const n = toNorm(drawingPoints[i], drawingPoints[i + 1]);
        normPoints.push(n.x, n.y);
      }
      addPath({ id: generateId(), points: normPoints, color, strokeWidth, tool: tool as "pencil" | "arrow", team });
    }
    setIsDrawing(false);
    setDrawingPoints([]);
  }, [isDrawing, tool, eraserMode, boxStart, boxEnd, drawingPoints, color, strokeWidth, team, toNorm, addPath, setIsDrawing, setDrawingPoints, display, paths, circles, texts, icons, removeMultiple]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (editingTextId) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        removePath(selectedId);
        removeCircle(selectedId);
        removeText(selectedId);
        removeIcon(selectedId);
        setSelectedId(null);
      }
      if (e.ctrlKey && e.key === "z") { e.preventDefault(); useMapStore.getState().undo(); }
      if (e.ctrlKey && e.key === "y") { e.preventDefault(); useMapStore.getState().redo(); }
    },
    [selectedId, editingTextId, removePath, removeCircle, removeText, removeIcon, setSelectedId]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const getCursor = () => {
    if (tool === "select") return "default";
    if (tool === "pencil" || tool === "arrow" || tool === "circle" || tool === "icon") return "crosshair";
    if (tool === "text") return "text";
    if (tool === "eraser") return eraserMode === "box" ? "crosshair" : "pointer";
    return "default";
  };

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-black" style={{ cursor: getCursor() }}>
      <Stage ref={stageRef} width={container.w} height={container.h} onClick={handleStageClick}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>

        {/* Map background */}
        <Layer>
          {imgMeta && <KonvaImage image={imgMeta.img} x={display.x} y={display.y} width={display.w} height={display.h} />}
        </Layer>

        {/* Lane points - draggable */}
        <Layer>
          {lanePoints.map((pt) => {
            const pos = toPixel(pt.x, pt.y);
            const isBlue = pt.team === "blue";
            const fill = isBlue ? "#3B82F6" : "#EF4444";
            const glow = isBlue ? "rgba(59,130,246,0.4)" : "rgba(239,68,68,0.4)";
            return (
              <Group key={pt.id} x={pos.x} y={pos.y} draggable
                onDragEnd={(e) => { const n = toNorm(e.target.x(), e.target.y()); moveLanePoint(pt.id, n.x, n.y); }}>
                <Circle radius={28} fill={glow} />
                <Circle radius={22} fill={fill} stroke="white" strokeWidth={2.5} />
                <Text x={-10} y={-10} text={pt.label} fontSize={20} fill="white" fontStyle="bold" align="center" width={20} />
                <Text x={-25} y={28} text={pt.team === "blue" ? "Blue" : "Red"} fontSize={10} fill="rgba(255,255,255,0.7)" width={50} align="center" />
              </Group>
            );
          })}
        </Layer>

        {/* Icons - PNG images from public/ */}
        <Layer>
          {icons.map((ic) => {
            const pos = toPixel(ic.x, ic.y);
            const img = iconImages[ic.icon];
            return (
              <Group key={ic.id} x={pos.x - ICON_SIZE / 2} y={pos.y - ICON_SIZE / 2} draggable
                onDragEnd={(e) => { const n = toNorm(e.target.x() + ICON_SIZE / 2, e.target.y() + ICON_SIZE / 2); moveIcon(ic.id, n.x, n.y); }}
                onClick={() => { if (tool === "eraser") removeIcon(ic.id); else setSelectedId(ic.id); }}>
                {img ? (
                  <KonvaImage image={img} width={ICON_SIZE} height={ICON_SIZE} />
                ) : (
                  <>
                    <Circle x={ICON_SIZE / 2} y={ICON_SIZE / 2} radius={ICON_SIZE / 2} fill="rgba(0,0,0,0.5)" stroke={ic.color} strokeWidth={2} />
                    <Text x={ICON_SIZE / 2 - 4} y={ICON_SIZE / 2 - 5} text="?" fontSize={14} fill={ic.color} />
                  </>
                )}
              </Group>
            );
          })}
        </Layer>

        {/* Drawings */}
        <Layer>
          {paths.map((path) => {
            const pixelPoints = path.points.flatMap((v, i) => {
              if (i % 2 === 0) return display.x + (v / 100) * display.w;
              return display.y + (v / 100) * display.h;
            });
            return (
              <Group key={path.id}>
                {tool === "eraser" && eraserMode === "single" && (
                  <Line points={pixelPoints} stroke="transparent" strokeWidth={Math.max(path.strokeWidth * 3, 16)}
                    tension={0.5} lineCap="round" lineJoin="round"
                    onClick={() => removePath(path.id)} />
                )}
                <Line points={pixelPoints} stroke={path.color} strokeWidth={path.strokeWidth}
                  tension={0.5} lineCap="round" lineJoin="round"
                  onClick={() => tool === "eraser" && removePath(path.id)} />
              </Group>
            );
          })}
          {isDrawing && drawingPoints.length >= 2 && (
            <Line points={drawingPoints} stroke={color} strokeWidth={strokeWidth}
              tension={0.5} lineCap="round" lineJoin="round"
              dash={tool === "arrow" ? [10, 5] : undefined} />
          )}
          {circles.map((c) => {
            const pos = toPixel(c.x, c.y);
            const r = (c.radiusX / 100) * display.w;
            return (
              <Group key={c.id}>
                {tool === "eraser" && eraserMode === "single" && (
                  <Circle x={pos.x} y={pos.y} radius={Math.max(r + 12, 20)}
                    fill="transparent"
                    onClick={() => removeCircle(c.id)} />
                )}
                <Circle x={pos.x} y={pos.y} radius={r}
                  stroke={c.color} strokeWidth={c.strokeWidth} fill="transparent"
                  onClick={() => tool === "eraser" && removeCircle(c.id)} />
              </Group>
            );
          })}
          {texts.map((t) => {
            const pos = toPixel(t.x, t.y);
            return (
              <Group key={t.id}>
                {tool === "eraser" && eraserMode === "single" && (
                  <Text x={pos.x - 8} y={pos.y - 4} text={t.text} fontSize={t.fontSize} fill="transparent"
                    padding={10}
                    onClick={() => removeText(t.id)} />
                )}
                <Text x={pos.x} y={pos.y} text={t.text} fontSize={t.fontSize} fill={t.color}
                  fontStyle="bold" shadowColor="black" shadowBlur={3}
                  onClick={() => { if (tool === "eraser") removeText(t.id); else setSelectedId(t.id); }}
                  onDblClick={() => setEditingTextId(t.id)} />
              </Group>
            );
          })}

          {/* Box eraser preview */}
          {tool === "eraser" && eraserMode === "box" && boxStart && boxEnd && (
            <Rect
              x={Math.min(boxStart.x, boxEnd.x)}
              y={Math.min(boxStart.y, boxEnd.y)}
              width={Math.abs(boxEnd.x - boxStart.x)}
              height={Math.abs(boxEnd.y - boxStart.y)}
              fill="rgba(255,255,255,0.08)"
              stroke="white"
              strokeWidth={1.5}
              dash={[6, 4]}
            />
          )}
        </Layer>
      </Stage>

      {editingTextId && <TextEditor textId={editingTextId} onClose={() => setEditingTextId(null)} />}
    </div>
  );
}

function TextEditor({ textId, onClose }: { textId: string; onClose: () => void }) {
  const { texts, updateText } = useMapStore();
  const text = texts.find((t) => t.id === textId);
  const [value, setValue] = useState(text?.text || "");
  useEffect(() => { setValue(text?.text || ""); }, [text]);
  if (!text) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <div className="bg-zinc-800 border border-zinc-600 rounded-lg p-4 shadow-xl">
        <input autoFocus type="text" value={value} onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { updateText(textId, { text: value }); onClose(); }
            if (e.key === "Escape") onClose();
          }}
          className="bg-zinc-900 text-white border border-zinc-600 rounded px-3 py-2 w-64 focus:outline-none focus:border-blue-500"
          placeholder="Enter text..." />
        <div className="flex gap-2 mt-2 justify-end">
          <button onClick={() => { updateText(textId, { text: value }); onClose(); }} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-500">Save</button>
          <button onClick={onClose} className="px-3 py-1 bg-zinc-600 text-white text-sm rounded hover:bg-zinc-500">Cancel</button>
        </div>
      </div>
    </div>
  );
}
