import React, {useRef, useState} from "react";
import ImageWindow from "./image-window";

type ImageWindowState = {
  id: string;
  x: number;
  y: number;
  z: number;
  imageUrl: string;
  imageName: string;
};

export default function DragArea() {
  const [windows, setWindows] = useState<ImageWindowState[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const offset = useRef({x: 0, y: 0});
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const bringToFront = (id: string) => {
    const maxZ = Math.max(...windows.map(w => w.z));

    setWindows(prev =>
      prev.map(w =>
        w.id === id ? {...w, z: maxZ + 1} : w
      )
    );
  };

  // -------- START DRAG --------
  const onStartDrag = (
    id: string,
    e: React.MouseEvent
  ) => {
    setDraggingId(id);

    const win = windows.find(w => w.id === id);
    if (!win) return;

    offset.current = {
      x: e.clientX - win.x,
      y: e.clientY - win.y,
    };
  };

  // -------- MOVE --------
  const onMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;

    setWindows(prev =>
      prev.map(win =>
        win.id === draggingId
          ? {
            ...win,
            x: e.clientX - offset.current.x,
            y: e.clientY - offset.current.y,
          }
          : win
      )
    );
  };

  // -------- END DRAG --------
  const onMouseUp = () => {
    setDraggingId(null);
  };

  // -------- ADD WINDOW --------
  const addWindow = (file: File) => {
    setWindows(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        x: 150,
        y: 150,
        z: 1,
        imageUrl: URL.createObjectURL(file),
        imageName: file.name,
      },
    ]);
  };

  const removeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    addWindow(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="relative w-screen h-screen bg-gray-100"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <div className="flex flex-col items-center">
      <span className="text-black">Arraste uma imagem, ou: </span>
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
          if (files) {
            for (let i = 0; i < files.length; i++) {
              addWindow(files[i]);
            }
            e.target.value = "";
          }
        }}
      />

      {windows.map(win => (
        <ImageWindow
          key={win.id}
          left={win.x}
          top={win.y}
          zIndex={win.z}
          imageUrl={win.imageUrl}
          imageName={win.imageName}
          onStartDrag={(e) => onStartDrag(win.id, e)}
          onBringToFront={() => bringToFront(win.id)}
          onClose={() => removeWindow(win.id)}
        />
      ))}
    </div>
  );
}
