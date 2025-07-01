"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

type BreadcrumbType =
  | { label: string; href?: string }
  | { label: string; current?: true };

interface PageHeaderProps {
  breadcrumbs: BreadcrumbType[];
  className?: string;
}

export default function PageHeader({
  breadcrumbs,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={`flex shrink-0 items-center gap-2 border-b pb-2.5 ${className}`}>
      <div className="flex items-center gap-2 px-1">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, idx) => (
              <React.Fragment key={item.label}>
                {"href" in item ? (
                  <BreadcrumbItem
                    className={idx === 0 ? "hidden md:block" : ""}
                  >
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                ) : (
                  <BreadcrumbItem>
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  </BreadcrumbItem>
                )}
                {idx < breadcrumbs.length - 1 && (
                  <BreadcrumbSeparator
                    className={idx === 0 ? "hidden md:block" : ""}
                  />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        
      </div>
    </header>
  );
}
