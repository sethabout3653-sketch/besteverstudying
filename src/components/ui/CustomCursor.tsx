import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const rippleIdRef = useRef(0);

  useEffect(() => {
    // Only enable on pointer-supported devices
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      positionRef.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicked(true);

      // Spawn a click ripple at the hot spot (cursor tip is at e.clientX, e.clientY)
      const newRipple = {
        id: rippleIdRef.current++,
        x: e.clientX,
        y: e.clientY,
      };
      setRipples((prev) => [...prev, newRipple]);
    };

    const handleMouseUp = () => {
      setIsClicked(false);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const interactive = target.closest(
        'a, button, input, select, textarea, [role="button"], .cursor-pointer, [data-interactive="true"]',
      );

      if (interactive) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeaveWindow = () => {
      setIsVisible(false);
    };

    const handleMouseEnterWindow = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", handleMouseLeaveWindow);
    document.addEventListener("mouseenter", handleMouseEnterWindow);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeaveWindow);
      document.removeEventListener("mouseenter", handleMouseEnterWindow);
    };
  }, []);

  // Clean up ripples after animation finishes
  const handleRippleComplete = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Absolute click ripples (anchored to viewport coords) */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ opacity: 0.6, scale: 0, x: ripple.x - 24, y: ripple.y - 24 }}
            animate={{ opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => handleRippleComplete(ripple.id)}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed pointer-events-none z-[10000] w-12 h-12 rounded-full border-2 border-primary/80 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
          />
        ))}
      </AnimatePresence>

      {/* Custom Mouse Cursor */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999] top-0 left-0"
        style={{
          transform: `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`,
          willChange: "transform",
          transition: "none",
        }}
      >
        {/* Halo Glow effect when hovering over interactive elements */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary/20 blur-md shadow-[0_0_15px_oklch(0.72_0.16_230_/_0.3)] pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* The Windows 11 Cursor Arrow */}
        <motion.div
          animate={{
            scale: isClicked ? 0.85 : isHovered ? 1.15 : 1,
            rotate: isHovered ? -5 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 450,
            damping: 20,
          }}
          className="relative pointer-events-none origin-top-left"
        >
          <svg
            width="42"
            height="42"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
          >
            {/* Windows 11 standard pointer shape */}
            <path
              d="M3 2V21.5L8.6 15.9L12.3 24.5L15.3 23.2L11.7 14.6H19.2L3 2Z"
              fill="oklch(0.72 0.16 230)"
              stroke="black"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>
    </>
  );
}
