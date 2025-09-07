"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { FeedPost } from "@/lib/types";

// Mock data for demonstration
const mockFeedPosts: FeedPost[] = [
  {
    id: "1",
    profileId: "user1",
    type: "project",
    title: "AIチャットボットの開発",
    description:
      "Next.jsとOpenAI APIを使用してカスタマーサポート用のチャットボットを開発しました。リアルタイムでの応答処理と多言語対応を実装。",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1555421689-d68471e189f2?w=500&h=300&fit=crop",
        caption: "チャットボットのUI",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
        caption: "管理画面",
      },
    ],
    profile: {
      username: "yamada_taro",
      firstName: "太郎",
      lastName: "山田",
      imageUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
    likes: 12,
    comments: 3,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    profileId: "user2",
    type: "activity",
    title: "ハッカソンで優勝しました！",
    description:
      "48時間のハッカソンで、環境問題解決のためのWebアプリケーションを開発し、優勝することができました。チームワークの重要性を再認識。",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
        caption: "表彰式の様子",
      },
    ],
    profile: {
      username: "sato_hanako",
      firstName: "花子",
      lastName: "佐藤",
      imageUrl:
        "https://images.unsplash.com/photo-1494790108755-2616b2e3ba0e?w=100&h=100&fit=crop&crop=face",
    },
    likes: 28,
    comments: 8,
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-14T14:20:00Z",
  },
];

export default function FeedList() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPosts(mockFeedPosts);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="aspect-video bg-gray-200 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <FeedPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function FeedPostCard({ post }: { post: FeedPost }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  const nextMedia = () => {
    if (post.media.length > 1) {
      setCurrentMediaIndex((prev) => (prev + 1) % post.media.length);
    }
  };

  const prevMedia = () => {
    if (post.media.length > 1) {
      setCurrentMediaIndex(
        (prev) => (prev - 1 + post.media.length) % post.media.length,
      );
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    // TODO: Implement like functionality
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 24) {
      return `${diffInHours}時間前`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}日前`;
    }
  };

  const currentMedia = post.media[currentMediaIndex];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={post.profile?.imageUrl} />
            <AvatarFallback>
              {post.profile?.firstName?.[0]}
              {post.profile?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <p className="font-medium">
                {post.profile?.firstName} {post.profile?.lastName}
              </p>
              <Badge
                variant={post.type === "project" ? "default" : "secondary"}
              >
                {post.type === "project" ? "プロジェクト" : "活動"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              @{post.profile?.username} • {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <h3 className="font-semibold mb-2">{post.title}</h3>
          <p className="text-sm text-muted-foreground">{post.description}</p>
        </div>

        {/* Media section */}
        {currentMedia && (
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {currentMedia.type === "image" ? (
              <img
                src={currentMedia.url}
                alt={currentMedia.caption || post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={currentMedia.url}
                className="w-full h-full object-cover"
                controls
                preload="metadata"
              />
            )}

            {/* Navigation for multiple media */}
            {post.media.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                  onClick={prevMedia}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                  onClick={nextMedia}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Media indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {post.media.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentMediaIndex ? "bg-white" : "bg-white/50"
                      }`}
                      onClick={() => setCurrentMediaIndex(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-4 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`gap-1 ${liked ? "text-red-500" : ""}`}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            {(post.likes || 0) + (liked ? 1 : 0)}
          </Button>

          <Button variant="ghost" size="sm" className="gap-1">
            <MessageCircle className="h-4 w-4" />
            {post.comments || 0}
          </Button>

          <Button variant="ghost" size="sm" className="gap-1">
            <Share2 className="h-4 w-4" />
            共有
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
