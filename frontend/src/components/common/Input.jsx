import React from "react";
import clsx from "clsx";

export default function Input({
  label,
  error,
  helperText,
  fullWidth = true,
  className,
  ...props
}) {
  return (
    <div className={clsx(fullWidth && "w-full")}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={clsx(
          "px-4 py-3 border rounded-lg transition-all outline-none",
          "focus:ring-2 focus:ring-purple-600 focus:border-transparent",
          error ? "border-red-500 focus:ring-red-500" : "border-gray-300",
          fullWidth && "w-full",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
