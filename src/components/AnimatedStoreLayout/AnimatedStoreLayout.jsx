import { useOutlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? "-100%" : "100%",
  }),
  center: {
    x: 0,
  },
  exit: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
  }),
};

const useFreezedOutlet = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const outletCache = useRef(new Map());

  if (!outletCache.current.has(location.pathname)) {
    outletCache.current.set(location.pathname, outlet);
  }

  if (outletCache.current.size > 2) {
    const keys = [...outletCache.current.keys()];
    for (let i = 0; i < keys.length - 2; i++) {
      outletCache.current.delete(keys[i]);
    }
  }

  return { outlet: outletCache.current.get(location.pathname), location };
};

const AnimatedStoreLayout = () => {
  const { outlet, location } = useFreezedOutlet();
  const direction = location.state?.slideDirection || 0;
  const [height, setHeight] = useState("auto");
  const containerRef = useRef(null);
  const activePageRef = useRef(null);
  const observerRef = useRef(null);

  // Track the active (entering/centered) page's height via ResizeObserver
  const attachObserver = useCallback((node) => {
    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!node) return;

    activePageRef.current = node;

    observerRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = entry.borderBoxSize
          ? entry.borderBoxSize[0].blockSize
          : entry.target.offsetHeight;

        if (newHeight > 0) {
          setHeight(newHeight);
        }
      }
    });

    observerRef.current.observe(node);

    // Also set initial height
    if (node.offsetHeight > 0) {
      setHeight(node.offsetHeight);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        minHeight: height,
        transition: "min-height 0.3s ease",
      }}
    >
      <AnimatePresence custom={direction} initial={false} mode="sync">
        <motion.div
          key={location.pathname}
          data-animated-page
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            position: "absolute",
            width: "100%",
            top: 0,
            left: 0,
          }}
          ref={attachObserver}
        >
          {outlet}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedStoreLayout;