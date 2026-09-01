import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Photo {
  src: string;
  label: string;
}

interface PhotoLightboxProps {
  photos: Photo[];
}

/* Calm, silky-smooth spring curve */
const smoothSpring = {
  type: "spring" as const,
  stiffness: 175,
  damping: 22,
  mass: 0.85,
};

export default function PhotoLightbox({ photos }: PhotoLightboxProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hasFannedOut, setHasFannedOut] = useState(false);
  const isOpen = selectedIndex !== null;

  /* Fan-out on load after brief delay */
  useEffect(() => {
    const timer = setTimeout(() => setHasFannedOut(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const close = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  /* Keyboard: Escape to close */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  const middle = (photos.length - 1) / 2;
  // Card width 160px - margin 22px = 138px step
  const cardStep = 138;

  return (
    <>
      {/* Light transparent background blur when a photo is clicked */}
      <AnimatePresence >
        {isOpen && (
          <motion.div
            
            // className="photo-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            
            // exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 45,
              backgroundColor: "white",
              opacity: 0.3,
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              // border: "1px solid red",
              // width : "1000px",
              cursor: "pointer",
              backgroundImage: "linear-gradient(45deg, #ffffffff, #f1edefff)"
            }}
          />
        )}
      </AnimatePresence>

      <div
        className="photo-stack"
        id="photo-stack"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {photos.map(({ src, label }, index) => {
          const offset = index - middle;
          const isCenter = index === Math.round(middle);
          const rotation = offset * 5;
          const arcY = Math.pow(offset, 2) * 1.5;
          const isSelected = selectedIndex === index;
          const isHovered = hoveredIndex === index;
          const diff = hoveredIndex !== null ? index - hoveredIndex : null;

          /* Rotation */
          let targetRotation = rotation;
          if (!hasFannedOut || isSelected) {
            targetRotation = 0;
          } else if (isHovered) {
            targetRotation = rotation * 0.35;
          } else if (diff === -1) {
            targetRotation = rotation - 2;
          } else if (diff === 1) {
            targetRotation = rotation + 2;
          }

          /* Y translation */
          let targetY = arcY;
          if (!hasFannedOut) {
            targetY = 0;
          } else if (isSelected) {
            targetY = -30;
          } else if (isHovered) {
            targetY = arcY - 14;
          }

          /* Scale */
          let targetScale = 1;
          if (!hasFannedOut) {
            targetScale = isCenter ? 1 : 0.96;
          } else if (isSelected) {
            targetScale = 1.38;
          } else if (isHovered) {
            targetScale = 1.06;
          }

          /* X translation (push neighbors away when adjacent photo is hovered) */
          let targetX = 0;
          if (!hasFannedOut) {
            targetX = -offset * cardStep;
          } else if (diff !== null && !isSelected) {
            if (diff === -1) targetX = -32;
            else if (diff === 1) targetX = 32;
            else if (diff === -2) targetX = -12;
            else if (diff === 2) targetX = 12;
          }

          /* Fixed stack order:
             - Hover never changes z-index, preserving each card's natural stack position
             - Selected card elevates to 50 when active (above the backdrop blur at zIndex: 45)
          */
          const zIndex = isSelected
            ? 50
            : (isCenter ? photos.length + 2 : photos.length - Math.abs(offset) + 2);

          return (
            <motion.figure
              key={index}
              className={`photo-figure${isHovered ? " is-hovered" : ""}${isSelected ? " is-selected" : ""}`}
              initial={{
                rotate: 0,
                x: -offset * cardStep,
                y: 0,
                scale: isCenter ? 1 : 0.96,
              }}
              animate={{
                rotate: targetRotation,
                x: targetX,
                y: targetY,
                scale: targetScale,
              }}
              transition={{
                ...smoothSpring,
                delay: !hasFannedOut ? 0 : Math.abs(offset) * 0.03,
              }}
              style={{
                zIndex,
                transformOrigin: "50% 100%",
              }}
              tabIndex={0}
              onPointerEnter={() => setHoveredIndex(index)}
              onClick={(e) => {
                e.stopPropagation();
                if (isSelected) {
                  close();
                } else {
                  setSelectedIndex(index);
                }
              }}
            >
              <img
                src={src}
                alt={label}
                loading="lazy"
              />
              {/* Label tooltip */}
              <AnimatePresence>
                {isSelected && (
                  <motion.figcaption
                    className="photo-label-inline"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  // style={{
                  //   border: "1px solid red",
                  //   width : "100%"
                  // }}
                  >
                    {label}
                  </motion.figcaption>
                )}
              </AnimatePresence>
            </motion.figure>
          );
        })}
      </div>
    </>
  );
}






