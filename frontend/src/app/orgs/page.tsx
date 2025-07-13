"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { getOrganizationsByUser } from "@/lib/api/organization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layout/PageHeader";
import { ImageOff } from "lucide-react"; // fallback icon

export default function OrganizationsPage() {
  const { user } = useSupabaseAuth();
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setLoading(true);
      try {
        const orgData = await getOrganizationsByUser(user.id);
        setOrgs(orgData || []);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "運営", href: "/orgs", current: true }]}
      />
      <div className="animate-in fade-in duration-500 lg:mt-4 mt-2 max-w-7xl mx-auto w-full md:px-4 py-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">参加中の組織</h1>
        </div>
        {loading ? (
          <div>読み込み中...</div>
        ) : (
          <section className="space-y-6">

            {orgs.length === 0 ? (
              <p className="text-muted-foreground">参加中の組織はありません。</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {orgs.map((org) => (
                  <Card key={org.id} className="hover:shadow-md transition">
                    <Link href={`/orgs/${org.org_name}`} className="block">
                      <CardHeader className="flex items-center space-x-3 pb-3">
                        {org.icon_url ? (
                          <img
                            src={org.icon_url}
                            alt={org.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <ImageOff className="w-8 h-8 text-muted-foreground" />
                        )}
                        <CardTitle className="text-lg">{org.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        {org.description || "説明がありません。"}
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            )}

            <div className="mt-4">
              <Button asChild>
                <Link href="/orgs/create">+ 新しい組織</Link>
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
