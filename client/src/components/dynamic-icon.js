"use client";

import * as LucideIcons from "lucide-react";
import { ClientOnly } from "./client-only";

// A component that dynamically loads Lucide icons with client-side only rendering
export function DynamicIcon({ name, className, ...props }) {
  // Get the icon component from Lucide
  const IconComponent = LucideIcons[name];

  // Return the icon wrapped in ClientOnly to prevent hydration errors
  return (
    <ClientOnly fallback={<div className={className} />}>
      {IconComponent ? (
        <IconComponent className={className} {...props} />
      ) : (
        <div className={className} />
      )}
    </ClientOnly>
  );
}
