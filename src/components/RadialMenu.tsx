import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

export type RadialMenuItem = {
  id: string;
  icon: ReactNode;
  action?: () => void;
  angle?: number; // degrees, 0 = right, 90 = down
  radius?: number;
  style?: CSSProperties;
  children?: RadialMenuItem[];
};

interface Props {
  center: { x: number; y: number };
  items: RadialMenuItem[];
  onClose?: () => void;
  radius?: number;
  submenuRadius?: number;
  itemSize?: number;
  className?: string;
}

/** RadialMenu renders circular menu items around a center point.
 *  Supports an optional second submenu stage.
 */
export default function RadialMenu({
  center,
  items,
  onClose,
  radius = 80,
  submenuRadius = 50,
  itemSize = 40,
  className,
}: Props) {
  const [menuStage, setMenuStage] = useState<"root" | "submenu">("root");
  const [submenuItems, setSubmenuItems] = useState<RadialMenuItem[]>([]);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // trigger scale/opacity transition on mount
    requestAnimationFrame(() => setShown(true));
  }, []);

  const stageItems = menuStage === "root" ? items : submenuItems;
  const baseRadius = menuStage === "root" ? radius : submenuRadius;

  function handleSelect(item: RadialMenuItem) {
    if (item.children && item.children.length) {
      setSubmenuItems(item.children);
      setMenuStage("submenu");
      return;
    }
    item.action?.();
    onClose?.();
    setMenuStage("root");
    setSubmenuItems([]);
  }

  return (
    <div className={className} style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
      {stageItems.map((item, i) => {
        const deg = typeof item.angle === "number" ? item.angle : (i / stageItems.length) * 360 - 90;
        const r = item.radius ?? baseRadius;
        const rad = (deg * Math.PI) / 180;
        const x = center.x + r * Math.cos(rad) - itemSize / 2;
        const y = center.y + r * Math.sin(rad) - itemSize / 2;
        return (
          <button
            key={`${menuStage}-${item.id}`}
            onClick={() => handleSelect(item)}
            style={{
              position: "fixed",
              left: x,
              top: y,
              width: itemSize,
              height: itemSize,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "var(--rm-bg, rgba(14,16,22,.7))",
              border: "1px solid var(--rm-border, rgba(255,255,255,.15))",
              color: "var(--rm-color, #fff)",
              cursor: "pointer",
              pointerEvents: "auto",
              transition: "transform .2s ease, opacity .2s ease",
              transform: `scale(${shown ? 1 : 0.5})`,
              opacity: shown ? 1 : 0,
              ...item.style,
            }}
          >
            {item.icon}
          </button>
        );
      })}
    </div>
  );
}

