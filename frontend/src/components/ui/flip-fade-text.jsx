/**
 * flip-fade-text.jsx — Animated text flipper with 3D rotate + fade transition.
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function FlipFadeText({
  words = [],
  duration = 3000,
  className = "",
  style = {},
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!words || words.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);
    return () => clearInterval(interval);
  }, [words, duration]);

  if (!words || words.length === 0) return null;

  return (
    <span
      style={{
        display: "inline-block",
        position: "relative",
        perspective: "1000px",
        perspectiveOrigin: "center",
        ...style,
      }}
      className={className}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ rotateX: -90, opacity: 0, y: 10 }}
          animate={{ rotateX: 0, opacity: 1, y: 0 }}
          exit={{ rotateX: 90, opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          style={{ display: "inline-block", transformOrigin: "50% 50%" }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
