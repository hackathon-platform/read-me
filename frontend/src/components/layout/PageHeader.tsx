"use client";

import { Fragment } from "react";
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

type BreadcrumbType =
  | { label: string; href?: string }
  | { label: string; current?: true };

interface PageHeaderProps {
  breadcrumbs: BreadcrumbType[];
}

export default function PageHeader({ breadcrumbs }: PageHeaderProps) {
  return (
    <header className={"fixed top-0 z-40 h-[2.7rem]"}>
      <div className="flex h-full items-center gap-2 px-4">
        {/* LEFT: trigger + divider + scrollable breadcrumb, occupies all remaining space */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <SidebarTrigger className="-ml-1 shrink-0" />
          <Separator orientation="vertical" className="h-4 shrink-0" />
          <div
            className={[
              "relative min-w-0 flex-1 overflow-x-auto",
              "whitespace-nowrap",
            ].join(" ")}
          >
            <Breadcrumb className="w-full">
              <BreadcrumbList className="inline-flex min-w-max flex-nowrap pr-2">
                {breadcrumbs.map((item, idx) => (
                  <Fragment key={`${item.label}-${idx}`}>
                    {"href" in item ? (
                      <BreadcrumbItem>
                        <BreadcrumbLink href={item.href}>
                          {item.label}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    ) : (
                      <BreadcrumbItem>
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      </BreadcrumbItem>
                    )}
                    {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </div>
    </header>
  );
}
