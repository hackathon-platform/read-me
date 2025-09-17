export interface Profile {
  id: string;
  basic: Basic;
  education: Education[];
  experiences: Experience[];
  qualifications: Qualification[];
  projects: Project[];
}

export interface Basic {
  username: string;
  firstName: string;
  lastName: string;
  firstNameKana: string;
  lastNameKana: string;
  imageUrl: string;
  description: string;
  resumeUrl: string;
  socials: Social[];
}

export interface Social {
  id: string;
  profile_id: string;
  platform: "linkedin" | "instagram" | "github" | "facebook" | "other";
  url: string;
  label?: string;
}

export interface Education {
  id: string;
  institution: string;
  fieldOfStudy?: string;
  startMonth: string; // YYYY-MM
  endMonth?: string; // YYYY-MM
  description?: string;
}

export interface Experience {
  id: string;
  title: string;
  organization: string;
  startMonth: string; // YYYY-MM
  endMonth?: string; // YYYY-MM
  description?: string;
  iconUrl?: string;
  url?: string;
  techKeys?: string[];
}

export interface Qualification {
  id: string;
  name: string;
  acquisitionDate: string; // YYYY-MM
}

export interface Project {
  id: string;
  profileId: string;
  title: string;
  summary: string;
  thumbnailUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  eventSlug?: string | null;
  content?: string | null;
  slug?: string;
  techKeys?: string[];
}

export interface Event {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  bannerUrl: string | null;
  websiteUrl: string | null;
  endAt: string | null;
}

export type ParticipantWithProfile = {
  id: string;
  role: "owner" | "admin" | "member" | "guest";
  joinedAt: string;
  profile: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
};

export type ProfileMini = { id: string } & Pick<
  Basic,
  "username" | "firstName" | "lastName" | "imageUrl"
>;

export type ProjectWithPeople = Project & {
  owner?: ProfileMini | null;
  members?: Array<{ profile: ProfileMini }> | null;
};

// --- Tech taxonomy -----------------------------------------------------------
export type TechKind =
  | "language"
  | "framework"
  | "tool"
  | "database"
  | "cloud"
  | "ml"
  | "other";

export interface Tech {
  id: string; // UUID
  kind: TechKind; // experience or project
  key: string; // 識別用の短いキー（例: "react", "python", "docker"）
  ref: string; // UUID
}
