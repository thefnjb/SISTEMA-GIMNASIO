// src/components/Alert/CustomAlert.js
import React from "react";

export default function CustomAlert({ visible, message, onClose }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        minWidth: "320px",
        transition: "all 0.3s ease-in-out",
        transform: visible ? "translateX(0)" : "translateX(100%)"
      }}
    >
      <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
            ✓
          </div>
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">¡Éxito!</p>
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-green-700 hover:text-green-900 text-lg font-bold px-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}
