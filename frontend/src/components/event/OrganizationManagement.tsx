"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Building2,
  Users,
  Crown,
  Shield,
  User,
  Mail,
  Globe,
  Calendar,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Settings,
  Activity,
  Clock,
  X,
  GripVertical,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import type { Organization, OrgMember } from "@/lib/mockData";

import { mockOrgMembers } from "@/lib/mockData";

// Mock data for the organization
const mockOrganizations: Organization[] = [
  {
    id: "org-1",
    name: "Tokyo Tech Innovators",
    nameJa: "東京テックイノベーターズ",
    description:
      "Promoting innovation through technology events and hackathons in Tokyo.",
    descriptionJa:
      "東京でテクノロジーイベントやハッカソンを通じてイノベーションを推進する組織です。",
    imageUrl:
      "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
    website: "https://tokyotechinnovators.com",
    email: "contact@tokyotechinnovators.com",
    createdAt: "2023-01-15T09:00:00Z",
    ownerId: "user-1",
    memberCount: 6,
    eventCount: 8,
  },
];

// Resizable Detail Panel Component
interface MemberDetailPanelProps {
  member: OrgMember | null;
  onClose: () => void;
  currentUserRole?: "owner" | "admin" | "member";
}

function MemberDetailPanel({
  member,
  onClose,
  currentUserRole = "member",
}: MemberDetailPanelProps) {
  if (!member) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-5 h-5 text-yellow-600" />;
      case "admin":
        return <Shield className="w-5 h-5 text-blue-600" />;
      case "member":
        return <User className="w-5 h-5 text-gray-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleText = (role: string) => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 text-white">アクティブ</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500 text-white">非アクティブ</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 text-white">承認待ち</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canManageMember = () => {
    if (member.role === "owner") return false;
    if (currentUserRole === "owner") return true;
    if (currentUserRole === "admin" && member.role === "member") return true;
    return false;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-lg font-semibold">メンバー詳細</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Profile Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden">
                <Image
                  src={member.imageUrl}
                  alt={`${member.firstName} ${member.lastName}`}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {member.firstName} {member.lastName}
                </h3>
                <p className="text-muted-foreground">@{member.username}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getRoleIcon(member.role)}
                  <span className="text-sm font-medium">
                    {getRoleText(member.role)}
                  </span>
                </div>
                {getStatusBadge(member.status)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">連絡先情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{member.email}</span>
            </div>
            {member.description && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">自己紹介</p>
                  <p className="text-sm">{member.description}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Activity Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">アクティビティ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">参加日</span>
              </div>
              <span className="text-sm font-medium">
                {formatDate(member.joinedAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">最終アクティブ</span>
              </div>
              <span className="text-sm font-medium">
                {member.lastActive
                  ? formatDateTime(member.lastActive)
                  : "未記録"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">イベント作成数</span>
              </div>
              <span className="text-sm font-medium">
                {member.eventsCreated || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        {member.permissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">権限</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {member.permissions.map((permission) => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions Footer */}
      <div className="border-t p-6 space-y-3">
        <div className="space-y-2">
          <Button className="w-full" variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            プロフィールを表示
          </Button>
          <Button className="w-full" variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            メッセージを送信
          </Button>
        </div>

        {canManageMember() && (
          <>
            <Separator />
            <div className="space-y-2">
              {member.status === "pending" && (
                <Button className="w-full" variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  承認する
                </Button>
              )}
              <Button className="w-full" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                役割を変更
              </Button>
              <Button className="w-full" variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                組織から削除
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface OrganizationManagementProps {
  organizationId: string;
}

export default function OrganizationManagement({
  organizationId = "org-1",
}: OrganizationManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // State for the detail panel
  const [selectedMember, setSelectedMember] = useState<OrgMember | null>(null);
  const [rightPanelWidth, setRightPanelWidth] = useState(400); // Default width
  const [isResizing, setIsResizing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Get organization data
  const organization = mockOrganizations.find(
    (org) => org.id === organizationId,
  );
  const members = mockOrgMembers.filter(
    (member) => member.organizationId === organizationId,
  );

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.firstName.includes(searchTerm) ||
      member.lastName.includes(searchTerm) ||
      member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle member click
  const handleMemberClick = (member: OrgMember) => {
    setSelectedMember(member);
  };

  // Handle panel close
  const handlePanelClose = () => {
    setSelectedMember(null);
  };

  // Resizing logic
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;
      const minWidth = 300;
      const maxWidth = containerRect.width * 0.6;

      setRightPanelWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
    },
    [isResizing],
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case "admin":
        return <Shield className="w-4 h-4 text-blue-600" />;
      case "member":
        return <User className="w-4 h-4 text-gray-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get role text
  const getRoleText = (role: string) => {
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

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 text-white">アクティブ</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500 text-white">非アクティブ</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 text-white">承認待ち</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Get member stats
  const stats = {
    total: members.length,
    owners: members.filter((m) => m.role === "owner").length,
    admins: members.filter((m) => m.role === "admin").length,
    members: members.filter((m) => m.role === "member").length,
    active: members.filter((m) => m.status === "active").length,
    pending: members.filter((m) => m.status === "pending").length,
    inactive: members.filter((m) => m.status === "inactive").length,
  };

  if (!organization) {
    return <div>組織が見つかりません</div>;
  }

  return (
    <div ref={containerRef} className="flex relative">
      {/* Left Panel - Main Content */}
      <div
        className="flex-1 space-y-6"
        style={{
          marginRight: selectedMember ? rightPanelWidth + 16 : 0,
          transition: isResizing ? "none" : "margin-right 0.3s ease",
        }}
      >
        {/* Organization Header */}
        <div className="flex flex-col lg:flex-row gap-6">
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <Image
                      src={organization.imageUrl}
                      alt={organization.nameJa}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {organization.nameJa}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {organization.descriptionJa}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      組織設定
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      組織情報を編集
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Globe className="w-4 h-4 mr-2" />
                      公開ページを表示
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      組織を削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  作成日: {formatDate(organization.createdAt)}
                </div>
                {organization.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      ウェブサイト
                    </a>
                  </div>
                )}
                {organization.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <a
                      href={`mailto:${organization.email}`}
                      className="hover:underline"
                    >
                      {organization.email}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  メンバー管理
                </CardTitle>
                <CardDescription>
                  組織のメンバーを管理し、権限を設定できます
                </CardDescription>
              </div>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                メンバーを招待
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="名前、ユーザー名、メールで検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="役割" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての役割</SelectItem>
                  <SelectItem value="owner">オーナー</SelectItem>
                  <SelectItem value="admin">管理者</SelectItem>
                  <SelectItem value="member">メンバー</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="active">アクティブ</SelectItem>
                  <SelectItem value="pending">承認待ち</SelectItem>
                  <SelectItem value="inactive">非アクティブ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Members Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>メンバー</TableHead>
                    <TableHead>役割</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>参加日</TableHead>
                    <TableHead>最終アクティブ</TableHead>
                    <TableHead>イベント作成数</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow
                      key={member.id}
                      className={`cursor-pointer hover:bg-muted/50 ${
                        selectedMember?.id === member.id ? "bg-muted" : ""
                      }`}
                      onClick={() => handleMemberClick(member)}
                    >
                      <TableCell>
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={member.imageUrl}
                            alt={`${member.firstName} ${member.lastName}`}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @{member.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(member.role)}
                          <span className="text-sm">
                            {getRoleText(member.role)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(member.joinedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {member.lastActive
                            ? formatDate(member.lastActive)
                            : "未記録"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {member.eventsCreated || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMemberClick(member);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              詳細を表示
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              メッセージを送信
                            </DropdownMenuItem>
                            {member.role !== "owner" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  役割を変更
                                </DropdownMenuItem>
                                {member.status === "pending" && (
                                  <DropdownMenuItem
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Users className="w-4 h-4 mr-2" />
                                    承認する
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  メンバーを削除
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                条件に一致するメンバーが見つかりません
              </div>
            )}

            {/* Pagination or Load More */}
            {filteredMembers.length > 0 && (
              <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                <div>
                  {filteredMembers.length} / {members.length} メンバーを表示中
                </div>
                {members.length > 10 && (
                  <Button variant="outline" size="sm">
                    さらに読み込む
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resizer */}
      {selectedMember && (
        <div
          className="w-2 bg-border hover:bg-border/80 cursor-col-resize flex items-center justify-center group absolute z-10"
          onMouseDown={handleMouseDown}
          style={{
            right: rightPanelWidth,
            top: 0,
            height: "100%",
          }}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
        </div>
      )}

      {/* Right Panel - Member Detail */}
      {selectedMember && (
        <div
          className="absolute top-0 right-0 bg-background border-l shadow-lg overflow-hidden z-10"
          style={{
            width: rightPanelWidth,
            height: "100%",
            transition: isResizing ? "none" : "width 0.3s ease",
          }}
        >
          <MemberDetailPanel
            member={selectedMember}
            onClose={handlePanelClose}
            currentUserRole="owner"
          />
        </div>
      )}
    </div>
  );
}
