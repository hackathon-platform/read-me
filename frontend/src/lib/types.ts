export interface Portfolio {
  firstName: string;
  lastName: string;
  firstNameKana: string;
  lastNameKana: string;
  imageUrl: string;
  socials: Social[];
  education: string;
  experience: Experience[];
  qualifications: Qualification[];
  resumeUrl: string;
  projects: Project[];
}

export interface Project {
  title: string;
  description: string;
  imageUrl: string;
  url?: string;
  media: ProjectMedia[];
  skills: Skill[];
}

export interface ProjectMedia {
  type: 'image' | 'video';
  url: string;
}

export interface Social {
  platform: 'linkedin' | 'instagram' | 'github' | 'facebook' | 'other';
  url: string;
  label?: string; // For "other" platform
}

export interface Experience {
  company: string;
  position: string;
  startDate: string; // YYYY-MM format
  endDate: string; // YYYY-MM format or "present"
  description: string;
  iconUrl?: string;
  url?: string;
  skills: Skill[];
}

export interface Qualification {
  name: string;
  acquisitionDate: string; // YYYY-MM format
  description?: string;
  score?: string;
}

export interface Skill {
  name: string;
  type: 'language' | 'framework' | 'tool' | 'other';
}
