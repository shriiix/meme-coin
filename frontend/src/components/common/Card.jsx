import React from "react";
import clsx from "clsx";

export default function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={clsx(
        "bg-white rounded-xl shadow-lg p-6 transition-all duration-300",
        hover && "hover:shadow-2xl hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
