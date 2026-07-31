/**
 * Toast.jsx — Fixed-position toast notification stack.
 *
 * Renders a stack of dismissible toasts in the top-right corner.
 * Each toast auto-dismisses after a timeout set by the hook.
 */

import React, { useState, useEffect } from "react";

const TOAST_STYLES = {
  success: { border: "#bbf7d0", bg: "#f0fdf4", text: "#15803d", icon: "✓" },
  error:   { border: "#fca5a5", bg: "#fef2f2", text: "#b91c1c", icon: "✕" },
  warning: { border: "#fde68a", bg: "#fffbeb", text: "#b45309", icon: "!" },
  info:    { border: "#cbd5e1", bg: "#ffffff", text: "#0f172a", icon: "i" },
};

/** Individual toast item with exit animation */
function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

  useEffect(() => {
    // Mount animation
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display:       "flex",
        alignItems:    "flex-start",
        gap:           "10px",
        padding:       "12px 16px",
        borderRadius:  "var(--radius-md)",
        background:    style.bg,
        border:        `1px solid ${style.border}`,
        boxShadow:     "0 4px 12px rgba(0, 0, 0, 0.08)",
        maxWidth:      "380px",
        animation:     exiting
          ? "toastOut 0.3s ease forwards"
          : visible
          ? "toastIn 0.25s ease forwards"
          : "none",
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Icon badge */}
      <span
        style={{
          flexShrink:  0,
          width:       "20px",
          height:      "20px",
          borderRadius: "50%",
          background:  style.text,
          color:       "#ffffff",
          display:     "flex",
          alignItems:  "center",
          justifyContent: "center",
          fontSize:    "11px",
          fontWeight:  800,
          marginTop:   "1px",
        }}
      >
        {style.icon}
      </span>

      {/* Message */}
      <p
        style={{
          flex:       1,
          fontSize:   "0.85rem",
          fontWeight: 500,
          lineHeight: 1.4,
          color:      style.text,
          margin:     0,
        }}
      >
        {toast.message}
      </p>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        style={{
          flexShrink:  0,
          background:  "none",
          border:      "none",
          cursor:      "pointer",
          color:       "var(--clr-text-muted)",
          fontSize:    "16px",
          lineHeight:  1,
          padding:     "0 2px",
          marginTop:   "1px",
          transition:  "color 0.15s",
        }}
        onMouseEnter={(e) => (e.target.style.color = "var(--clr-text-primary)")}
        onMouseLeave={(e) => (e.target.style.color = "var(--clr-text-muted)")}
      >
        ✕
      </button>
    </div>
  );
}

/** Toast container — fixed top-right stack */
export function ToastContainer({ toasts, onRemove }) {
  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        top:      "24px",
        right:    "24px",
        zIndex:   9999,
        display:  "flex",
        flexDirection: "column",
        gap:      "10px",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: "all" }}>
          <ToastItem toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}
