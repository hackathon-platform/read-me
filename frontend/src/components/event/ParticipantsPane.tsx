"use client";

import * as React from "react";
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
import { ProfileLoader } from "@/components/me/ProfileLoader";

type ProfileRow = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
};

export type ParticipantWithProfile = {
  id: string;
  role: string | null;
  joined_at: string | null;
  profile: ProfileRow;
};

/* -------- role helpers -------- */
function getRoleBadgeVariant(
  role?: string | null,
): "default" | "secondary" | "destructive" | "outline" {
  switch ((role ?? "").toLowerCase()) {
    case "owner":
      return "destructive";
    case "admin":
    case "judge":
      return "default";
    case "mentor":
    case "member":
    case "participant":
    case "guest":
      return "secondary";
    default:
      return "outline";
  }
}
function getRoleDisplay(role?: string | null) {
  const r = (role ?? "").toLowerCase();
  if (r === "owner") return "オーナー";
  if (r === "admin") return "管理者";
  if (r === "judge") return "審査員";
  if (r === "mentor") return "メンター";
  if (r === "participant" || r === "member") return "参加者";
  if (r === "guest") return "ゲスト";
  return role ?? "未設定";
}

/* -------- small utils -------- */
function fullName(p: ProfileRow) {
  const name = `${p.last_name ?? ""} ${p.first_name ?? ""}`.trim();
  return name || p.username || "User";
}
function initials(p: ProfileRow) {
  const a = p.last_name?.[0] ?? "";
  const b = p.first_name?.[0] ?? "";
  return a + b || "U";
}

/* -------- reusable table -------- */
function ParticipantsTable({
  participants,
  onSelect,
}: {
  participants: ParticipantWithProfile[];
  onSelect: (row: ParticipantWithProfile) => void;
}) {
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
          {participants.map((row) => {
            const p = row.profile;
            return (
              <TableRow
                key={p.id}
                className="cursor-pointer"
                onClick={() => onSelect(row)}
              >
                <TableCell>
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={p.image_url ?? undefined}
                      alt={p.username ?? ""}
                    />
                    <AvatarFallback>{initials(p)}</AvatarFallback>
                  </Avatar>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <div className="font-medium">{fullName(p)}</div>
                    {p.username && (
                      <div className="text-xs text-muted-foreground">
                        @{p.username}
                      </div>
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
                      e.stopPropagation(); // 行クリックと分離
                      onSelect(row);
                    }}
                  >
                    表示
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/* -------- right pane -------- */
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
      <ProfileLoader username={username} />
    </div>
  );
}

/* -------- main component -------- */
type Props = { participants: ParticipantWithProfile[] };

export function ParticipantsPane({ participants }: Props) {
  const [selected, setSelected] = React.useState<ParticipantWithProfile | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const selectDesktop = (row: ParticipantWithProfile) => setSelected(row);
  const selectMobile = (row: ParticipantWithProfile) => {
    setSelected(row);
    setDrawerOpen(true);
  };

  return (
    <>
      {/* Desktop (lg+): Resizable 2-pane */}
      <div className="hidden lg:block">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full overflow-hidden"
        >
          <ResizablePanel defaultSize={58} minSize={30}>
            <ParticipantsTable
              participants={participants}
              onSelect={selectDesktop}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={42} minSize={56}>
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
