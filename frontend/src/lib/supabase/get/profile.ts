import { supabase } from "@/lib/supabase/supabaseClient";
import type { Profile } from "@/lib/types";

export async function getProfileByUsername(username: string): Promise<{
  data: Profile | null;
  error?: string;
}> {
  // 1) Profile row
  const { data: profileRow, error: profileErr } = await supabase
    .from("profile")
    .select(
      "id, username, first_name, last_name, first_name_kana, last_name_kana, image_url, description, resume_url",
    )
    .eq("username", username)
    .single();

  if (profileErr || !profileRow) {
    return { data: null, error: profileErr?.message ?? "profile not found" };
  }

  // 2) Related tables in parallel
  const [
    { data: socialData, error: socialErr },
    { data: educationData, error: eduErr },
    { data: experienceData, error: expErr },
    { data: projectData, error: projErr },
    { data: qualificationData, error: qualErr },
  ] = await Promise.all([
    supabase
      .from("social")
      .select("id, profile_id, platform, url, created_at")
      .eq("profile_id", profileRow.id),

    supabase
      .from("education")
      .select(
        "id, profile_id, institution, degree, field_of_study, start_month, end_month, description",
      )
      .eq("profile_id", profileRow.id),

    supabase
      .from("experience")
      .select(
        "id, profile_id, title, organization, start_month, end_month, description, icon_url, url, updated_at",
      )
      .eq("profile_id", profileRow.id)
      .order("start_month", { ascending: false }),

    supabase
      .from("project")
      .select(
        "id, slug, profile_id, title, summary, thumbnail_url, content, event_slug, created_at, updated_at",
      )
      .eq("profile_id", profileRow.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("qualification")
      .select("id, profile_id, name, acquisition_date")
      .eq("profile_id", profileRow.id)
      .order("acquisition_date", { ascending: false }),
  ]);

  logIfError("[getProfileByUsername] social", socialErr);
  logIfError("[getProfileByUsername] education", eduErr);
  logIfError("[getProfileByUsername] experience", expErr);
  logIfError("[getProfileByUsername] project", projErr);
  logIfError("[getProfileByUsername] qualification", qualErr);

  const expIds = (experienceData ?? []).map((e: any) => e.id);
  const projIds = (projectData ?? []).map((p: any) => p.id);

  const [
    { data: expTags, error: expTagsErr },
    { data: projTags, error: projTagsErr },
  ] = await Promise.all([
    expIds.length
      ? supabase
          .from("tech")
          .select("ref, key")
          .eq("kind", "experience")
          .in("ref", expIds)
      : Promise.resolve({ data: [], error: null } as any),
    projIds.length
      ? supabase
          .from("tech")
          .select("ref, key")
          .eq("kind", "project")
          .in("ref", projIds)
      : Promise.resolve({ data: [], error: null } as any),
  ]);

  logIfError("[getProfileByUsername] tech(exp)", expTagsErr);
  logIfError("[getProfileByUsername] tech(proj)", projTagsErr);

  // ref → key[] へまとめる（重複除去）
  function toKeyMap(rows: Array<{ ref: string; key: string }>) {
    const map: Record<string, string[]> = {};
    for (const r of rows ?? []) {
      const arr = (map[r.ref] ??= []);
      if (!arr.includes(r.key)) arr.push(r.key);
    }
    return map;
  }

  const expTechKeysByRef = toKeyMap(expTags ?? []);
  const projTechKeysByRef = toKeyMap(projTags ?? []);

  const profile: Profile = {
    id: profileRow.id,

    basic: {
      username: profileRow.username,
      firstName: profileRow.first_name,
      lastName: profileRow.last_name,
      firstNameKana: profileRow.first_name_kana,
      lastNameKana: profileRow.last_name_kana,
      imageUrl: profileRow.image_url ?? "",
      description: profileRow.description,
      resumeUrl: profileRow.resume_url ?? "",
      socials: socialData ?? [],
    },

    education: (educationData ?? []).map((edu: any) => ({
      id: edu.id,
      institution: edu.institution,
      fieldOfStudy: edu.field_of_study,
      startMonth: safeYYYYMM(edu.start_month) ?? "",
      endMonth: safeYYYYMM(edu.end_month) ?? undefined,
      description: edu.description,
    })),

    experiences: (experienceData ?? []).map((exp: any) => ({
      id: exp.id,
      title: exp.title,
      organization: exp.organization,
      startMonth: safeYYYYMM(exp.start_month) ?? "",
      endMonth: safeYYYYMM(exp.end_month) ?? "現在",
      description: exp.description,
      iconUrl: exp.icon_url,
      url: exp.url,
      techKeys: expTechKeysByRef[exp.id] ?? [],
    })),

    projects: (projectData ?? []).map((proj: any) => ({
      id: proj.id,
      profileId: proj.profile_id,
      title: proj.title,
      summary: proj.summary ?? "",
      url: null,
      media: [],
      createdAt: proj.created_at,
      updatedAt: proj.updated_at,
      thumbnailUrl: proj.thumbnail_url ?? null,
      content: proj.content ?? null,
      eventSlug: proj.event_slug ?? null,
      slug: proj.slug,
      techKeys: projTechKeysByRef[proj.id] ?? [],
    })),

    qualifications: (qualificationData ?? []).map((q: any) => ({
      id: q.id,
      name: q.name,
      acquisitionDate: safeYYYYMM(q.acquisition_date) ?? "",
    })),
  };

  return { data: profile };
}

/* ---------------- helpers ---------------- */

function safeYYYYMM(v?: string | null): string | undefined {
  if (!v) return undefined;
  try {
    const s = typeof v === "string" ? v : new Date(v).toISOString();
    return s.slice(0, 7);
  } catch {
    return undefined;
  }
}

function logIfError(prefix: string, error?: { message?: string } | null) {
  if (error) console.error(prefix, error);
}
