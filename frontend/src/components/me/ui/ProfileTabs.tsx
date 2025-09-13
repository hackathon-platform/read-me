// components/ui/tabs-devpost.tsx
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root data-slot="tabs" className={cn(className)} {...props} />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        // Devpost-like: a simple bar with a bottom border; tabs sit on it
        "sticky top-0 z-20 -mb-px flex items-end overflow-x-auto bg-background/70 backdrop-blur",
        "border-b border-border",
        "shadow-[inset_0_-1px_0_var(--border)]",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // pill-ish top with its own border (except bottom), lifted 1px to merge with panel
        "inline-flex items-center px-3 py-2 text-sm font-medium place-content-center md:place-content-start",
        // default (inactive)
        "bg-background text-muted-foreground",
        // hover
        "hover:bg-background/60 hover:text-foreground hover:border-border  hover:underline-offset-4",
        // active state connects visually to panel
        "data-[state=active]:bg-popover data-[state=active]:text-foreground data-[state=active]:border-b",
        // remove the tiny seam to the content border
        // a11y focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-20",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        // panel looks like Devpost's “sheet” and connects to the active tab
        " bg-popover p-4 -mt-px",
        // no double radius on top
        "rounded-t-none",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
