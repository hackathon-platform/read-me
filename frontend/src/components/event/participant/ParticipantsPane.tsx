"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileLoader } from "@/components/event/participant/ProfileLoader";
import { getRoleBadgeVariant, getRoleDisplay } from "@/lib/supabase/get/event";
import type { ParticipantWithProfile } from "@/lib/types";

/* ---------- helpers ---------- */
function fullName(p: ParticipantWithProfile["profile"]) {
  const name = `${p.lastName ?? ""} ${p.firstName ?? ""}`.trim();
  return name || p.username || "User";
}
function initials(p: ParticipantWithProfile["profile"]) {
  const a = p.lastName?.[0] ?? "";
  const b = p.firstName?.[0] ?? "";
  return a + b || (p.username?.slice(0, 2).toUpperCase() ?? "U");
}

/* ---------- row ---------- */
const ParticipantsRow = React.memo(function ParticipantsRow({
  row,
  onSelect,
}: {
  row: ParticipantWithProfile;
  onSelect: (row: ParticipantWithProfile) => void;
}) {
  const p = row.profile;

  const handleClick = useCallback(() => onSelect(row), [onSelect, row]);
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTableRowElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(row);
      }
    },
    [onSelect, row],
  );

  return (
    <TableRow
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={onKeyDown}
      aria-label={`Open profile of ${fullName(p)}`}
    >
      <TableCell>
        <Avatar className="h-9 w-9">
          <AvatarImage src={p.imageUrl ?? undefined} alt={p.username ?? ""} />
          <AvatarFallback>{initials(p)}</AvatarFallback>
        </Avatar>
      </TableCell>

      <TableCell>
        <div className="flex flex-col">
          <div className="font-medium">{fullName(p)}</div>
          {p.username && (
            <div className="text-xs text-muted-foreground">@{p.username}</div>
          )}
        </div>
      </TableCell>

      <TableCell>
        <Badge variant={getRoleBadgeVariant(row.role)}>
          {getRoleDisplay(row.role)}
        </Badge>
      </TableCell>

      <TableCell>
        <Button
          size="sm"
          variant="ghost"
          className="w-[64px] justify-center"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(row);
          }}
          aria-label={`Show details for ${fullName(p)}`}
        >
          表示
        </Button>
      </TableCell>
    </TableRow>
  );
});

/* ---------- table ---------- */
function ParticipantsTable({
  participants,
  onSelect,
}: {
  participants: ReadonlyArray<ParticipantWithProfile>;
  onSelect: (row: ParticipantWithProfile) => void;
}) {
  const items = useMemo(() => participants, [participants]);
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[56px]" />
            <TableHead>名前 / ユーザー名</TableHead>
            <TableHead>役割</TableHead>
            <TableHead className="w-[70px] text-center whitespace-nowrap">
              詳細
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => (
            <ParticipantsRow key={row.id} row={row} onSelect={onSelect} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ---------- right pane (client, not async) ---------- */
function RightPane({ selected }: { selected: ParticipantWithProfile | null }) {
  if (!selected) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        左のリストからプロフィールを選択してください。
      </div>
    );
  }
  const username = selected.profile.username;
  if (!username) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        このユーザーはユーザー名が未設定です。
      </div>
    );
  }
  return (
    <div className="h-full overflow-auto px-6">
      <ProfileLoader key={username} username={username} />
    </div>
  );
}

/* ---------- main ---------- */
type ParticipantsPaneProps = { participants: ParticipantWithProfile[] };

export function ParticipantsPane({ participants }: ParticipantsPaneProps) {
  const [selected, setSelected] = useState<ParticipantWithProfile | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectDesktop = useCallback(
    (row: ParticipantWithProfile) => setSelected(row),
    [],
  );
  const selectMobile = useCallback((row: ParticipantWithProfile) => {
    setSelected(row);
    setDrawerOpen(true);
  }, []);

  return (
    <>
      {/* Desktop (lg+): Resizable 2-pane */}
      <div className="hidden lg:block">
        <ResizablePanelGroup direction="horizontal" className="w-full">
          <ResizablePanel defaultSize={50} minSize={30}>
            <ParticipantsTable
              participants={participants}
              onSelect={selectDesktop}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={40}>
            <div className="h-full">
              <RightPane selected={selected} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile (<lg): Drawer */}
      <div className="lg:hidden">
        <ParticipantsTable
          participants={participants}
          onSelect={selectMobile}
        />
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>プロフィール</DrawerTitle>
            </DrawerHeader>
            <RightPane selected={selected} />
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
