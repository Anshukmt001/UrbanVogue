"use client";

import { useState } from "react";
import { ReactLenis } from "lenis/react";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [prefersReduced] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  if (prefersReduced) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}