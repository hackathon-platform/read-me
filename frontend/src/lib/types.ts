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
  description: string;
  startDate: string; // Date & Time in ISO format
  endDate?: string; // Date & Time in ISO format
  location?: string;
  url?: string;
  imageUrl?: string;
  organizerId: string;
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  createdAt: string; // Date & Time in ISO format
  ownerId: string;
}

export interface Organizer {
  id: string;
  userId: string;
  organizationId: string;
  role: "owner" | "admin" | "member";
  joinedAt: string; // Date & Time in ISO format
}
