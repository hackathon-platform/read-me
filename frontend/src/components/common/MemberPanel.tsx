"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Mail,
  Calendar,
  Award,
  Clock,
  X,
  UserCheck,
  UserX,
  Settings,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  mockOrgMembers,
  getMembersByOrganization,
  getOrgMemberStats,
  type OrgMember,
} from "@/lib/mockData";
import React from "react";

export default function MemberPanel() {
  const [selectedMember, setSelectedMember] = useState<OrgMember | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Get members for organization (using org-1 as example)
  const members = getMembersByOrganization("org-1");
  const stats = getOrgMemberStats("org-1");

  const toggleRowExpansion = (memberId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId);
    } else {
      newExpanded.add(memberId);
    }
    setExpandedRows(newExpanded);
  };

  const handleStatusChange = (memberId: string, newStatus: string) => {
    // In a real app, this would update the member status
    console.log(`Updating member ${memberId} status to ${newStatus}`);
  };

  const getRoleBadgeVariant = (
    role: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case "owner":
        return "destructive";
      case "admin":
        return "default";
      case "member":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (
    status: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "inactive":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "owner":
        return "オーナー";
      case "admin":
        return "管理者";
      case "member":
        return "メンバー";
      default:
        return role;
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "active":
        return "アクティブ";
      case "pending":
        return "承認待ち";
      case "inactive":
        return "非アクティブ";
      default:
        return status;
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
      <ResizablePanel defaultSize={selectedMember ? 65 : 100} minSize={50}>
        <Card className="rounded-none border-0 shadow-none h-full gap-0 py-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="pb-1">メンバー管理</CardTitle>
                <CardDescription>
                  組織のメンバーと権限を管理します
                </CardDescription>
              </div>
              <div className="flex gap-2 text-sm">
                <Badge variant="outline">合計: {stats.total}名</Badge>
                <Badge variant="default">アクティブ: {stats.active}名</Badge>
                {stats.pending > 0 && (
                  <Badge variant="secondary">承認待ち: {stats.pending}名</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <Table>
                <TableHeader className="sticky top-0 bg-accent z-10">
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>メンバー</TableHead>
                    <TableHead>役割</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>参加日</TableHead>
                    <TableHead className="text-center">作成イベント</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <React.Fragment key={member.id}>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() => setSelectedMember(member)}
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpansion(member.id);
                            }}
                          >
                            {expandedRows.has(member.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={member.imageUrl}
                                alt={member.username}
                              />
                              <AvatarFallback>
                                {member.firstName[0]}
                                {member.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {member.lastName} {member.firstName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                @{member.username}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(member.role)}>
                            {getRoleDisplay(member.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(member.status)}>
                            {getStatusDisplay(member.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(member.joinedAt)}
                        </TableCell>
                        <TableCell className="text-center">
                          {member.eventsCreated || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMember(member);
                            }}
                          >
                            詳細
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(member.id) && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0">
                            <div className="bg-muted/50 p-4">
                              <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-4 text-sm">
                                    <span className="text-muted-foreground">
                                      メールアドレス:
                                    </span>
                                    <span>{member.email}</span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm">
                                    <span className="text-muted-foreground">
                                      最終アクティブ:
                                    </span>
                                    <span>
                                      {member.lastActive
                                        ? formatDate(member.lastActive)
                                        : "不明"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Select
                                    defaultValue={member.status}
                                    onValueChange={(value) =>
                                      handleStatusChange(member.id, value)
                                    }
                                  >
                                    <SelectTrigger
                                      className="w-[140px]"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">
                                        <div className="flex items-center gap-2">
                                          <UserCheck className="h-4 w-4" />
                                          アクティブ
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="inactive">
                                        <div className="flex items-center gap-2">
                                          <UserX className="h-4 w-4" />
                                          非アクティブ
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="pending">
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4" />
                                          承認待ち
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Settings className="h-4 w-4 mr-2" />
                                    権限設定
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </ResizablePanel>

      {selectedMember && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
            <Card className="rounded-none border-0 shadow-none h-full gap-3 py-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg">メンバー詳細</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSelectedMember(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="px-2 md:px-4">
                <ScrollArea className="h-[calc(100vh-12rem)]">
                  <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="flex flex-col items-center text-center space-y-3">
                      <Avatar className="h-24 w-24">
                        <AvatarImage
                          src={selectedMember.imageUrl}
                          alt={selectedMember.username}
                        />
                        <AvatarFallback className="text-2xl">
                          {selectedMember.firstName[0]}
                          {selectedMember.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {selectedMember.lastName} {selectedMember.firstName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          @{selectedMember.username}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          variant={getRoleBadgeVariant(selectedMember.role)}
                        >
                          {getRoleDisplay(selectedMember.role)}
                        </Badge>
                        <Badge
                          variant={getStatusBadgeVariant(selectedMember.status)}
                        >
                          {getStatusDisplay(selectedMember.status)}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    {/* Bio Section */}
                    {selectedMember.description && (
                      <>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">自己紹介</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedMember.description}
                          </p>
                        </div>
                        <Separator />
                      </>
                    )}

                    {/* Contact & Activity */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">連絡先・活動情報</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedMember.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            参加日: {formatDate(selectedMember.joinedAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            最終活動:{" "}
                            {selectedMember.lastActive
                              ? formatDate(selectedMember.lastActive)
                              : "不明"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span>
                            作成イベント数: {selectedMember.eventsCreated || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Permissions */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">権限</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.permissions.length > 0 ? (
                          selectedMember.permissions.map((permission) => (
                            <Badge key={permission} variant="outline">
                              {permission}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            権限が設定されていません
                          </p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        権限を編集
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        メッセージを送信
                      </Button>
                      {selectedMember.role !== "owner" && (
                        <Button
                          variant="outline"
                          className="w-full justify-start text-destructive hover:text-destructive"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          メンバーから削除
                        </Button>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
