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
  degree?: string;
  fieldOfStudy?: string;
  startMonth: string; // YYYY-MM
  endMonth?: string; // YYYY-MM
  description?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startMonth: string; // YYYY-MM
  endMonth: string; // YYYY-MM
  description: string;
  iconUrl?: string;
  url?: string;
  skills: Skill[];
}

export interface Qualification {
  profileId: string;
  name: string;
  acquisitionDate: string; // YYYY-MM
  description?: string;
  score?: string;
}

export interface Skill {
  name: string;
  type: "language" | "framework" | "tool" | "other";
}

export interface Project {
  id: string;
  profileId: string;
  title: string;
  description: string;
  imageUrl: string;
  url?: string;
  media: ProjectMedia[];
  skills: Skill[];
}

export interface ProjectMedia {
  id: string;
  projectId: string;
  type: "image" | "video";
  url: string;
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
  nameJa: string;
  description: string;
  descriptionJa: string;
  imageUrl: string;
  website?: string;
  email?: string;
  createdAt: string;
  ownerId: string;
  memberCount: number;
  eventCount: number;
}

export interface Organizer {
  id: string;
  userId: string;
  organizationId: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
  permissions: string[];
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
}
