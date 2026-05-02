export type Locale = "en" | "ar";

export type UserProfile = {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  locale: Locale;
  createdAt: string;
};

export type PersonalInfo = {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  summary: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
  technologies: string[];
};

export type Education = {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
  imageUrl: string;
  highlights: string[];
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
};

export type Certificate = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
};

export type Language = {
  id: string;
  language: string;
  proficiency: string;
};

export type SocialLink = {
  id: string;
  label: string;
  url: string;
  type: "github" | "linkedin" | "website" | "email" | "other";
};

export type Resume = {
  id: string;
  ownerId: string;
  title: string;
  templateId: string;
  status: "Draft" | "Ready" | "Published";
  updatedAt: string;
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
  certificates: Certificate[];
  languages: Language[];
  links: SocialLink[];
  templateData?: import("@/types/template").CanvaTemplateData;
};

export type PortfolioSection = {
  id: string;
  title: string;
  type: "about" | "projects" | "experience" | "education" | "contact" | "custom";
  enabled: boolean;
  content: string;
};

export type Portfolio = {
  id: string;
  ownerId: string;
  username: string;
  templateId: string;
  headline: string;
  subheadline: string;
  about: string;
  featuredProjectIds: string[];
  sections: PortfolioSection[];
  published: boolean;
  updatedAt: string;
};

export type Template = {
  id: string;
  name: string;
  type: "resume" | "portfolio";
  description: string;
  tags: string[];
  previewClassName: string;
};

export type GitHubRepository = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  topics?: string[];
};

export type GitHubProfile = {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  publicRepos: number;
  profileUrl: string;
  topRepositories: GitHubRepository[];
};

export type DashboardStats = {
  profileCompletion: number;
  projectsCount: number;
  skillsCount: number;
  resumeStatus: Resume["status"];
  portfolioStatus: "Draft" | "Published";
  recentActivity: string[];
};

export type AIImproveIntent =
  | "improve-summary"
  | "rewrite-bullet"
  | "professional"
  | "shorter"
  | "ats"
  | "project-description"
  | "fit-template-space";

export type AIImproveRequest = {
  input: string;
  intent: AIImproveIntent;
  language?: Locale;
  fieldLabel?: string;
  maxChars?: number;
  maxLines?: number;
  templateName?: string;
};
