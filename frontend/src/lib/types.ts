export interface Profile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  firstNameKana: string;
  lastNameKana: string;
  imageUrl: string;
  description: string;
  resumeUrl: string;
  socials: Social[];
  education: Education[];
  experiences: Experience[];
  qualifications: Qualification[];
  projects: Project[];
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
  description?: string; // make this like a list of string
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
  skills: Skill[];
}

export interface Qualification {
  id: string;
  name: string;
  acquisitionDate: string; // YYYY-MM
}

export interface Skill {
  name: string;
  type: "language" | "framework" | "tool" | "other";
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
}

export interface Event {
  id: string;
  title: string;
  titleJa: string;
  description: string;
  theme: string;
  themeJa: string;
  startDate: string;
  endDate: string;
  location: "online" | "in-person";
  locationDetails?: string;
  url?: string;
  image: string;
  status: "upcoming" | "open" | "ended";
  participants: {
    current: number;
    max: number;
  };
  tags: string[];
  organizationId: string;
  organizerJa: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerUrl?: string;
  iconUrl?: string;
  website?: string;
  email?: string;
  createdAt: string;
  createdBy: string;
}

export interface Organizer {
  id: string;
  profileId: string;
  organizationId: string;
  role: "owner" | "admin" | "member" | "guest";
  joinedAt: string;
}
