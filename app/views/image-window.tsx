import React, {useRef, useState} from "react";

type Props = {
  left: number;
  top: number;
  zIndex: number;
  imageUrl: string;
  imageName: string;
  onStartDrag: (e: React.MouseEvent) => void;
  onBringToFront: () => void;
  onClose: () => void;
};

export default function ImageWindow(
  {
    onStartDrag,
    left,
    top,
    onClose,
    onBringToFront,
    zIndex,
    imageUrl,
    imageName,
  }: Props) {
  const [opacity, setOpacity] = useState(1);

  const [size, setSize] = useState({
    width: 240,
    height: 260,
  });

  const resizing = useRef(false);
  const resizeStart = useRef({
    mouseX: 0,
    mouseY: 0,
    width: 0,
    height: 0,
  });

  const onResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    resizing.current = true;

    resizeStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: size.width,
      height: size.height,
    };

    window.addEventListener("mousemove", onResizeMove);
    window.addEventListener("mouseup", onResizeEnd);
  };

  const onResizeMove = (e: MouseEvent) => {
    if (!resizing.current) return;

    const dx = e.clientX - resizeStart.current.mouseX;
    const dy = e.clientY - resizeStart.current.mouseY;

    setSize({
      width: Math.max(180, resizeStart.current.width + dx),
      height: Math.max(200, resizeStart.current.height + dy),
    });
  };

  const onResizeEnd = () => {
    resizing.current = false;
    window.removeEventListener("mousemove", onResizeMove);
    window.removeEventListener("mouseup", onResizeEnd);
  };

  return (
    <div
      className="
        absolute
        rounded-lg
        shadow-lg
        select-none
      "
      style={{
        left,
        top,
        width: size.width,
        height: size.height,
        zIndex
      }}
    >
      <div
        onMouseDown={event => {
          onStartDrag(event)
          onBringToFront()
        }}
        className="
    h-8 bg-blue-500 text-white px-2
    flex flex-row items-center justify-between
    cursor-grab active:cursor-grabbing
    rounded-t-lg
  "
      >
        <span className="flex-1 min-w-0 truncate">{imageName}</span>

        <div className="flex gap-1">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onClose}
            className="text-xs bg-red-500 px-2 rounded"
          >
            ✕
          </button>
        </div>
      </div>
      <div
        className="p-2 bg-gray-500"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <label className="text-xs block mb-1">Opacidade</label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e) =>
            setOpacity(Number(e.currentTarget.value))
          }
          className="w-full"
        />
      </div>

      <div className="relative flex-1 p-2">
          <img
            src={imageUrl}
            alt="Imagem"
            className="w-full h-full object-cover rounded pointer-events-none"
            style={{opacity}}
          />
      </div>

      <div
        onMouseDown={onResizeStart}
        className="
          absolute
          bottom-1
          right-1
          w-4
          h-4
          bg-gray-400
          rounded
          cursor-se-resize
        "
      />
    </div>
  );
}
