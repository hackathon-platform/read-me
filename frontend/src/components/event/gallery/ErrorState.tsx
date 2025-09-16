"use client";

import { Card } from "@/components/ui/card";

export default function ErrorState({ message }: { message: string }) {
  return (
    <Card className="p-10 text-center">
      <p className="text-sm text-destructive">{message}</p>
    </Card>
  );
}
