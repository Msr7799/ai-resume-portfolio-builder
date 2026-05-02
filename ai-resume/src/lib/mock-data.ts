import type { Portfolio, Resume, Template, UserProfile } from "@/types";

const now = new Date().toISOString();

export const mockUser: UserProfile = {
  id: "user-1",
  username: "sara-dev",
  name: "Sara Ahmed",
  email: "sara@example.com",
  role: "Junior Frontend Developer",
  locale: "en",
  createdAt: now,
};

export const resumeTemplates: Template[] = [
  {
    id: "modern-developer",
    name: "Modern Developer",
    type: "resume",
    description: "Sharp two-column resume for engineers and technical roles.",
    tags: ["ATS", "Developer", "Modern"],
    previewClassName: "from-sky-500 to-indigo-600",
  },
  {
    id: "clean-student",
    name: "Clean Student",
    type: "resume",
    description: "Clear academic layout for students, interns, and fresh grads.",
    tags: ["Student", "Simple", "Academic"],
    previewClassName: "from-emerald-500 to-teal-600",
  },
  {
    id: "professional-minimal",
    name: "Professional Minimal",
    type: "resume",
    description: "Minimal executive structure with strong readability.",
    tags: ["Minimal", "Professional", "Print"],
    previewClassName: "from-zinc-700 to-zinc-950",
  },
];

export const portfolioTemplates: Template[] = [
  {
    id: "dark-developer",
    name: "Dark Developer",
    type: "portfolio",
    description: "Immersive dark profile for software engineers.",
    tags: ["Dark", "Code", "Personal"],
    previewClassName: "from-slate-950 to-cyan-700",
  },
  {
    id: "minimal-white",
    name: "Minimal White",
    type: "portfolio",
    description: "Editorial white portfolio for clean personal branding.",
    tags: ["Clean", "Readable", "Elegant"],
    previewClassName: "from-stone-100 to-slate-300",
  },
  {
    id: "startup-freelancer",
    name: "Startup Freelancer",
    type: "portfolio",
    description: "Conversion-focused profile for freelancers and builders.",
    tags: ["Freelance", "Startup", "CTA"],
    previewClassName: "from-amber-400 to-rose-500",
  },
];

export const mockResume: Resume = {
  id: "resume-1",
  ownerId: mockUser.id,
  title: "Frontend Developer Resume",
  templateId: "modern-developer",
  status: "Ready",
  updatedAt: now,
  personalInfo: {
    fullName: "Sara Ahmed",
    jobTitle: "Junior Frontend Developer",
    email: "sara@example.com",
    phone: "+973 3333 0000",
    location: "Manama, Bahrain",
    website: "https://sara.dev",
    github: "https://github.com/sara-dev",
    linkedin: "https://linkedin.com/in/sara-dev",
    summary:
      "Frontend developer focused on accessible React interfaces, design systems, and reliable product experiences for SaaS teams.",
  },
  experience: [
    {
      id: "exp-1",
      company: "Bright Labs",
      role: "Frontend Developer Intern",
      location: "Remote",
      startDate: "2025-02",
      endDate: "2025-08",
      current: false,
      bullets: [
        "Built reusable React components that reduced dashboard implementation time by 30%.",
        "Improved mobile layouts and accessibility states across customer-facing screens.",
      ],
      technologies: ["React", "TypeScript", "Tailwind CSS", "REST APIs"],
    },
  ],
  education: [
    {
      id: "edu-1",
      school: "University of Bahrain",
      degree: "Bachelor",
      field: "Computer Science",
      startDate: "2021",
      endDate: "2025",
      description: "Focused on web engineering, databases, and human-computer interaction.",
    },
  ],
  projects: [
    {
      id: "project-1",
      name: "Campus Task Manager",
      description:
        "A productivity app for student teams with task boards, reminders, and analytics.",
      techStack: ["Next.js", "TypeScript", "Supabase"],
      githubUrl: "https://github.com/sara-dev/campus-task-manager",
      liveUrl: "https://campus-tasks.example.com",
      imageUrl:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      highlights: ["Role-based boards", "Responsive UI", "Realtime updates"],
    },
    {
      id: "project-2",
      name: "Developer Portfolio Kit",
      description:
        "A portfolio starter that helps junior developers publish projects and case studies quickly.",
      techStack: ["React", "Tailwind CSS", "MDX"],
      githubUrl: "https://github.com/sara-dev/portfolio-kit",
      liveUrl: "https://portfolio-kit.example.com",
      imageUrl:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      highlights: ["Template system", "SEO metadata", "Contact forms"],
    },
  ],
  skills: [
    { id: "skill-1", name: "React", category: "Frontend", level: "Advanced" },
    { id: "skill-2", name: "TypeScript", category: "Language", level: "Intermediate" },
    { id: "skill-3", name: "UI Design", category: "Design", level: "Intermediate" },
    { id: "skill-4", name: "Git", category: "Tools", level: "Advanced" },
  ],
  certificates: [
    {
      id: "cert-1",
      name: "Responsive Web Design",
      issuer: "freeCodeCamp",
      date: "2024-09",
      url: "https://freecodecamp.org",
    },
  ],
  languages: [
    { id: "lang-1", language: "Arabic", proficiency: "Native" },
    { id: "lang-2", language: "English", proficiency: "Professional" },
  ],
  links: [
    { id: "link-1", label: "GitHub", type: "github", url: "https://github.com/sara-dev" },
    {
      id: "link-2",
      label: "LinkedIn",
      type: "linkedin",
      url: "https://linkedin.com/in/sara-dev",
    },
  ],
  templateData: {
    profileImage: "",
    fullName: "Sara Ahmed",
    jobTitle: "Junior Frontend Developer",
    phone: "+973 3333 0000",
    email: "sara@example.com",
    location: "Manama, Bahrain",
    about:
      "Frontend developer focused on accessible React interfaces, design systems, and reliable product experiences for SaaS teams.",
    workExperience: [
      "Bright Labs - Frontend Developer Intern: Built reusable React components and improved mobile accessibility across customer-facing screens.",
    ],
    developerExperience:
      "Comfortable with React, TypeScript, Tailwind CSS, API integration, Git workflows, and component-based product interfaces.",
    education: ["University of Bahrain - Bachelor in Computer Science, 2021-2025"],
    expertise: ["Frontend Engineering", "Responsive UI", "Accessibility"],
    skills: ["React", "TypeScript", "Tailwind CSS", "Git", "UI Design"],
    languages: ["Arabic - Native", "English - Professional"],
    deployments: [
      "Campus Task Manager - student productivity dashboard with realtime updates.",
      "Developer Portfolio Kit - reusable portfolio starter with SEO metadata.",
    ],
    portfolioUrl: "https://sara.dev",
    githubUrl: "https://github.com/sara-dev",
    linkedinUrl: "https://linkedin.com/in/sara-dev",
    qr: "https://sara.dev",
  },
};

export const mockPortfolio: Portfolio = {
  id: "portfolio-1",
  ownerId: mockUser.id,
  username: mockUser.username,
  templateId: "dark-developer",
  headline: "I build clean interfaces for useful software.",
  subheadline:
    "Junior frontend developer blending React engineering, thoughtful UX, and practical product thinking.",
  about:
    "I enjoy turning fuzzy requirements into polished, accessible web experiences. My work focuses on dashboards, portfolios, and tools that help people move faster.",
  featuredProjectIds: ["project-1", "project-2"],
  published: true,
  updatedAt: now,
  sections: [
    {
      id: "section-about",
      title: "About",
      type: "about",
      enabled: true,
      content: "A concise introduction, technical focus, and career story.",
    },
    {
      id: "section-contact",
      title: "Contact",
      type: "contact",
      enabled: true,
      content: "Email, GitHub, LinkedIn, and personal website links.",
    },
  ],
};
