import React from "react";

const base =
  "inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const styles = {
  primary: `${base} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600`,
  danger:  `${base} bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600`,
  ghost:   `${base} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400`,
  outline: `${base} border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-50 focus:ring-blue-600`,
  default: `${base} bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-600`,
};

export default function Button({ variant = "default", children, ...props }) {
  return (
    <button className={styles[variant] || styles.default} {...props}>
      {children}
    </button>
  );
}
