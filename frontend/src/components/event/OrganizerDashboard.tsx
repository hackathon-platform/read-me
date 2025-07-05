"use client";

import React, { useState } from "react";
import {
  Calendar,
  Building2,
  Plus,
  Users,
  Settings,
  Eye,
  Edit,
  Trash2,
  Crown,
  Shield,
  User,
  MapPin,
  Code,
  Clock,
  ExternalLink,
  Mail,
  Globe,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { type Event, type Organization, type Organizer } from "@/lib/types";

import {
  mockOrganizations,
  mockOrgEvents,
  mockOrganizers,
  mockCurrentUser,
} from "@/lib/mockData";

export default function OrganizerDashboard() {
  // Filter data for current user
  const userOrganizations = mockOrganizers
    .filter((org) => org.userId === mockCurrentUser.id)
    .map((orgMember) => {
      const org = mockOrganizations.find(
        (o) => o.id === orgMember.organizationId,
      );
      return { ...org!, ...orgMember };
    });

  const userEvents = mockOrgEvents.filter((event) =>
    userOrganizations.some((org) => org.id === event.organizationId),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500 text-white";
      case "open":
        return "bg-green-500 text-white";
      case "ended":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "開催予定";
      case "open":
        return "募集中";
      case "ended":
        return "受付終了";
      default:
        return status;
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getLocationIcon = (location: string) => {
    return location === "online" ? (
      <Code className="w-4 h-4" />
    ) : (
      <MapPin className="w-4 h-4" />
    );
  };

  const getLocationText = (location: string) => {
    return location === "online" ? "オンライン" : "会場開催";
  };

  // Recent events (last 5)
  const recentEvents = userEvents
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen md:px-4">
      <div className="py-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">運営ダッシュボード</h1>
          <p className="text-muted-foreground">
            イベントと組織を管理しましょう
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新しい組織
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="events">最近のイベント</TabsTrigger>
          <TabsTrigger value="organizations">組織</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  最近のイベント
                </span>
                <Button variant="outline" size="sm">
                  <Link href="/events" className="flex items-center">
                    すべて見る
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardTitle>
              <CardDescription>最新のイベントとその状況</CardDescription>
            </CardHeader>
            <CardContent>
              {recentEvents.length > 0 ? (
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden">
                          <Image
                            src={event.image}
                            alt={event.titleJa}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm line-clamp-1">
                              {event.titleJa}
                            </h3>
                            <Badge
                              className={`${getStatusColor(event.status)} text-xs`}
                            >
                              {getStatusText(event.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDate(event.startDate)}
                            </div>
                            <div className="flex items-center gap-1">
                              {getLocationIcon(event.location)}
                              {getLocationText(event.location)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {event.participants.current}/
                              {event.participants.max}
                            </div>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            詳細を見る
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            編集
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  まだイベントがありません
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                所属している組織
              </CardTitle>
              <CardDescription>あなたが所属している組織一覧</CardDescription>
            </CardHeader>
            <CardContent>
              {userOrganizations.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {userOrganizations.map((org) => (
                    <Card key={org.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                              <Image
                                src={org.imageUrl}
                                alt={org.nameJa}
                                fill
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {org.nameJa}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                {getRoleIcon(org.role)}
                                <span className="text-sm text-muted-foreground">
                                  {getRoleText(org.role)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                詳細を見る
                              </DropdownMenuItem>
                              {org.role === "owner" && (
                                <>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    編集
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Users className="w-4 h-4 mr-2" />
                                    メンバー管理
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                {org.role === "owner" ? "組織を削除" : "脱退"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {org.descriptionJa}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {org.memberCount}人
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {org.eventCount}イベント
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {org.website && (
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={org.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Globe className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                            {org.email && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={`mailto:${org.email}`}>
                                  <Mail className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  まだ組織に所属していません
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
