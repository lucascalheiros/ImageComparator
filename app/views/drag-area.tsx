"use client"
import React, { useEffect, useRef, useState } from "react";
import ImageWindow from "./image-window";
import { saveWindows, loadWindows } from "../db/db";


type ImageWindowState = {
  id: string;
  left: number;
  top: number;
  zIndex: number;
  height: number;
  width: number;
  imageUrl: string;   // runtime only
  imageName: string;
  blob: Blob;         // persisted
};

export default function DragArea() {
  const [windows, setWindows] = useState<ImageWindowState[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const offset = useRef({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("No param useeffect")
    loadWindows().then(items => {
      setWindows(
        items.map(w => ({
          ...w,
          imageUrl: URL.createObjectURL(w.blob),
        }))
      );
    });
  }, []);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const bringToFront = (id: string) => {
    const maxZ = Math.max(...windows.map(w => w.zIndex), 0);

    setWindows(prev =>
      prev.map(w =>
        w.id === id ? {...w, zIndex: maxZ + 1} : w
      )
    );
  };

  const onStartDrag = (id: string, e: React.MouseEvent) => {
    const win = windows.find(w => w.id === id);
    if (!win) return;

    setDraggingId(id);
    offset.current = {
      x: e.clientX - win.left,
      y: e.clientY - win.top,
    };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;

    setWindows(prev =>
      prev.map(w =>
        w.id === draggingId
          ? {
            ...w,
            left: e.clientX - offset.current.x,
            top: e.clientY - offset.current.y,
          }
          : w
      )
    );
  };

  const onMouseUp = () => {
    setDraggingId(null);
    const persist = windows.map(({ imageUrl, ...rest }) => rest);
    saveWindows(persist);
  };

  const addWindow = (file: File) => {
    const newWindows = [
      ...windows,
      {
        id: crypto.randomUUID(),
        left: 150,
        top: 150,
        zIndex: Math.max(...windows.map(w => w.zIndex), 0) + 1,
        height: 400,
        width: 300,
        imageUrl: URL.createObjectURL(file),
        imageName: file.name,
        blob: file,
      },
    ]
    setWindows(newWindows);
    const persist = newWindows.map(({ imageUrl, ...rest }) => rest);
    saveWindows(persist);
  };

  const removeWindow = (id: string) => {
    setWindows(prev => {
      const win = prev.find(w => w.id === id);
      if (win) URL.revokeObjectURL(win.imageUrl);
      const newWindows = prev.filter(w => w.id !== id);
      const persist = newWindows.map(({ imageUrl, ...rest }) => rest);
      saveWindows(persist);
      return newWindows
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      addWindow(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const updateSize = (id: string, size: { width: number; height: number }) => {
  setWindows((prev) =>
    prev.map((w) =>
      w.id === id ? { ...w, ...size } : w
    )
  );
};

  return (
    <div
      className="relative w-screen h-screen bg-gray-100"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <div className="flex flex-col items-center gap-2 p-2">
        <span className="text-black">
          Arraste uma imagem, ou:
        </span>

        <button
          onClick={openPicker}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Selecionar imagens
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const files = e.target.files;
          if (!files) return;

          Array.from(files).forEach(addWindow);
          e.target.value = "";
        }}
      />

      {windows.map(win => (
        <ImageWindow
          key={win.id}
          {...win}
          onStartDrag={(e) => onStartDrag(win.id, e)}
          onBringToFront={() => bringToFront(win.id)}
          onClose={() => removeWindow(win.id)}
          onResize={(size) => updateSize(win.id, size)}
        />
      ))}
    </div>
  );
}
