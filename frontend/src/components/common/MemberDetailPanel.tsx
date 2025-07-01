"use client";

import React from "react";
import {
  X,
  Mail,
  Calendar,
  Clock,
  Crown,
  Shield,
  User,
  Activity,
  Globe,
  MessageCircle,
  UserCheck,
  UserX,
  Settings,
  ExternalLink
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
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import type { OrgMember } from "@/lib/mockData";

interface MemberDetailPanelProps {
  member: OrgMember | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: "owner" | "admin" | "member";
  context?: "organization" | "event"; // Different contexts may show different actions
}

export default function MemberDetailPanel({ 
  member, 
  isOpen, 
  onClose, 
  currentUserRole = "member",
  context = "organization" 
}: MemberDetailPanelProps) {
  if (!member) return null;

  // Get role icon
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
      month: "long",
      day: "numeric",
    });
  };

  // Format date with time
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if current user can manage this member
  const canManageMember = () => {
    if (member.role === "owner") return false; // Can't manage owners
    if (currentUserRole === "owner") return true;
    if (currentUserRole === "admin" && member.role === "member") return true;
    return false;
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-96 bg-background border-r shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
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
                      <span className="text-sm font-medium">{getRoleText(member.role)}</span>
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
                  <span className="text-sm font-medium">{formatDate(member.joinedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">最終アクティブ</span>
                  </div>
                  <span className="text-sm font-medium">
                    {member.lastActive ? formatDateTime(member.lastActive) : "未記録"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">イベント作成数</span>
                  </div>
                  <span className="text-sm font-medium">{member.eventsCreated || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            {context === "organization" && member.permissions.length > 0 && (
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
            {/* Primary Actions */}
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                プロフィールを表示
              </Button>
              <Button className="w-full" variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                メッセージを送信
              </Button>
            </div>

            {/* Management Actions (if user has permission) */}
            {canManageMember() && (
              <>
                <Separator />
                <div className="space-y-2">
                  {member.status === "pending" && (
                    <Button className="w-full" variant="outline">
                      <UserCheck className="w-4 h-4 mr-2" />
                      承認する
                    </Button>
                  )}
                  <Button className="w-full" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    役割を変更
                  </Button>
                  <Button className="w-full" variant="destructive">
                    <UserX className="w-4 h-4 mr-2" />
                    {context === "organization" ? "組織から削除" : "イベントから削除"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Participant Detail Panel (for events)
interface ParticipantDetailPanelProps {
  participant: any; // You can create a Participant type similar to OrgMember
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: "owner" | "admin" | "member";
}

export function ParticipantDetailPanel({ 
  participant, 
  isOpen, 
  onClose, 
  currentUserRole = "member" 
}: ParticipantDetailPanelProps) {
  if (!participant) return null;

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

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-96 bg-background border-r shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold">参加者詳細</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content - Similar structure to MemberDetailPanel but for participants */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Profile Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden">
                    <Image
                      src={participant.imageUrl || "https://via.placeholder.com/150x150/6366F1/FFFFFF?text=User"}
                      alt={`${participant.firstName || ""} ${participant.lastName || ""}`}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {participant.firstName} {participant.lastName}
                    </h3>
                    <p className="text-muted-foreground">@{participant.username}</p>
                  </div>
                  <Badge className="bg-blue-500 text-white">参加者</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Event-specific information would go here */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">イベント参加情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">参加登録日</span>
                  <span className="text-sm font-medium">
                    {participant.registeredAt ? formatDate(participant.registeredAt) : "未記録"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">参加ステータス</span>
                  <Badge variant="outline">{participant.status || "参加予定"}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Footer */}
          <div className="border-t p-6 space-y-3">
            <Button className="w-full" variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              プロフィールを表示
            </Button>
            <Button className="w-full" variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              メッセージを送信
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}