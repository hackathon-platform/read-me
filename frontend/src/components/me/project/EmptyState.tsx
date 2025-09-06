"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  isOwner: boolean;
  onStart: () => void;
}

export default function EmptyState({ isOwner, onStart }: Props) {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <Code2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-sm text-muted-foreground mb-4">
          まだプロジェクトがありません
        </p>
        {isOwner && (
          <Button variant="outline" onClick={onStart}>
            最初のプロジェクトを投稿
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
