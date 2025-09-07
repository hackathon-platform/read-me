"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";

// Dummy recommended users — replace with Supabase query later
const recommendedUsers = [
  { username: "alice", name: "Alice Tanaka", imageUrl: "/avatars/alice.png" },
  { username: "bob", name: "Bob Suzuki", imageUrl: "/avatars/bob.png" },
  { username: "carol", name: "Carol Yamada", imageUrl: "/avatars/carol.png" },
  { username: "alice2", name: "Alice Tanaka", imageUrl: "/avatars/alice.png" },
  { username: "bob2", name: "Bob Suzuki", imageUrl: "/avatars/bob.png" },
  { username: "carol2", name: "Carol Yamada", imageUrl: "/avatars/carol.png" },
  { username: "alice3", name: "Alice Tanaka", imageUrl: "/avatars/alice.png" },
  { username: "bob3", name: "Bob Suzuki", imageUrl: "/avatars/bob.png" },
  { username: "carol3", name: "Carol Yamada", imageUrl: "/avatars/carol.png" },
];

export default function RecommendedUsers() {
  const [query, setQuery] = useState("");

  const filteredUsers = recommendedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.username.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Card className="sticky top-5 h-[calc(100vh-8rem)] flex flex-col">
      <CardHeader>
        <CardTitle>おすすめユーザー</CardTitle>
        <Input
          placeholder="検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-4"
        />
      </CardHeader>

      {/* Scrollable user list */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4 py-2 space-y-2">
          {filteredUsers.map((user) => (
            <Link
              key={user.username}
              href={`/me/${user.username}`}
              className="flex items-center gap-3 hover:bg-muted rounded-lg p-2 transition"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.imageUrl} alt={user.name} />
                <AvatarFallback>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </Link>
          ))}

          {filteredUsers.length === 0 && (
            <p className="text-xs text-muted-foreground px-2">
              該当ユーザーがいません
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
