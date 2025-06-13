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
