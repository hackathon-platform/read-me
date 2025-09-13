"use client";

import * as React from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/supabaseClient";
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
import formatJPDate from "@/lib/utils/date";
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

type Props = {
  participants: ParticipantWithProfile[];
};

export function ParticipantsPane({ participants }: Props) {
  const [selected, setSelected] = React.useState<ParticipantWithProfile | null>(
    null,
  );
  const [detail, setDetail] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // 詳細を lazy 取得（選択時）
  React.useEffect(() => {
    let active = true;
    const run = async () => {
      if (!selected?.profile?.id) {
        setDetail(null);
        return;
      }
      setLoading(true);
      try {
        const { data: profile } = await supabase
          .from("profile")
          .select("*")
          .eq("id", selected.profile.id)
          .maybeSingle();
        if (!active) return;
        setDetail(profile ?? null);
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [selected?.profile?.id]);

  // lg+ 用
  const handleSelectDesktop = (row: ParticipantWithProfile) => {
    setSelected(row);
  };

  // モバイル用（Drawer を開く）
  const handleSelectMobile = (row: ParticipantWithProfile) => {
    setSelected(row);
    setDrawerOpen(true);
  };

  const RightPane = (
    <div className="h-full overflow-auto">
      {!selected ? (
        <div className="p-6 text-sm text-muted-foreground">
          左のリストからプロフィールを選択してください。
        </div>
      ) : (
        <div className="px-6">
          <ProfileLoader username={selected.profile.username!} />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop (lg+): Resizable 2-pane */}
      <div className="hidden lg:block">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full overflow-hidden"
        >
          <ResizablePanel defaultSize={58} minSize={30}>
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
                    const name =
                      `${p.last_name ?? ""} ${p.first_name ?? ""}`.trim() ||
                      (p.username ?? "User");
                    const initials =
                      (p.last_name?.[0] ?? "") + (p.first_name?.[0] ?? "");
                    const isActive = selected?.profile?.id === p.id;
                    return (
                      <TableRow
                        key={p.id}
                        className={isActive ? "bg-accent/50" : "cursor-pointer"}
                        onClick={() => handleSelectDesktop(row)}
                      >
                        <TableCell>
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={p.image_url ?? undefined}
                              alt={p.username ?? ""}
                            />
                            <AvatarFallback>{initials || "U"}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium">{name}</div>
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
                              e.stopPropagation();
                              handleSelectDesktop(row);
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
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={42} minSize={56}>
            {RightPane}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile (<lg): Drawer に切替 */}
      <div className="lg:hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[56px]"> </TableHead>
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
                const name =
                  `${p.last_name ?? ""} ${p.first_name ?? ""}`.trim() ||
                  (p.username ?? "User");
                const initials =
                  (p.last_name?.[0] ?? "") + (p.first_name?.[0] ?? "");
                return (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer"
                    onClick={() => handleSelectMobile(row)}
                  >
                    <TableCell>
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={p.image_url ?? undefined}
                          alt={p.username ?? ""}
                        />
                        <AvatarFallback>{initials || "U"}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium">{name}</div>
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
                          e.stopPropagation();
                          handleSelectMobile(row);
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

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>プロフィール</DrawerTitle>
            </DrawerHeader>
            {RightPane}
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
