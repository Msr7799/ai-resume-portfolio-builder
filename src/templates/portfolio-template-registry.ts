import type { Template } from "@/types";

/**
 * Portfolio template definitions with actual visual theme configuration.
 * Each template defines colors, gradients, and layout style for the portfolio page.
 */
export type PortfolioTheme = {
  /** CSS class for the page background */
  pageBg: string;
  /** CSS class for card/section backgrounds */
  cardBg: string;
  /** CSS class for primary text */
  textPrimary: string;
  /** CSS class for secondary text */
  textSecondary: string;
  /** CSS class for accent/badge elements */
  accentBg: string;
  accentText: string;
  /** CSS class for the hero gradient overlay */
  heroGradient: string;
  /** CSS class for buttons */
  buttonPrimary: string;
  buttonSecondary: string;
  /** CSS class for section borders */
  borderColor: string;
};

export type PortfolioTemplateDefinition = Template & {
  theme: PortfolioTheme;
};

export const portfolioTemplateRegistry: PortfolioTemplateDefinition[] = [
  {
    id: "dark-developer",
    name: "Dark Developer",
    type: "portfolio",
    description: "Immersive dark profile for software engineers.",
    tags: ["Dark", "Code", "Personal"],
    previewClassName: "from-slate-950 to-cyan-700",
    theme: {
      pageBg: "bg-slate-950 text-white",
      cardBg: "bg-slate-900/80 border-slate-800",
      textPrimary: "text-white",
      textSecondary: "text-slate-400",
      accentBg: "bg-cyan-500/15 border-cyan-500/30",
      accentText: "text-cyan-300",
      heroGradient:
        "bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.25),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.15),transparent_40%)]",
      buttonPrimary: "bg-cyan-600 hover:bg-cyan-500 text-white",
      buttonSecondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
      borderColor: "border-slate-800",
    },
  },
  {
    id: "minimal-white",
    name: "Minimal White",
    type: "portfolio",
    description: "Editorial white portfolio for clean personal branding.",
    tags: ["Clean", "Readable", "Elegant"],
    previewClassName: "from-stone-100 to-slate-300",
    theme: {
      pageBg: "bg-white text-slate-900",
      cardBg: "bg-stone-50 border-stone-200",
      textPrimary: "text-slate-900",
      textSecondary: "text-slate-500",
      accentBg: "bg-stone-100 border-stone-300",
      accentText: "text-slate-700",
      heroGradient:
        "bg-[radial-gradient(circle_at_top_left,rgba(120,113,108,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(168,162,158,0.06),transparent_40%)]",
      buttonPrimary: "bg-slate-900 hover:bg-slate-800 text-white",
      buttonSecondary: "bg-white hover:bg-stone-50 text-slate-800 border border-stone-300",
      borderColor: "border-stone-200",
    },
  },
  {
    id: "startup-freelancer",
    name: "Startup Freelancer",
    type: "portfolio",
    description: "Conversion-focused profile for freelancers and builders.",
    tags: ["Freelance", "Startup", "CTA"],
    previewClassName: "from-amber-400 to-rose-500",
    theme: {
      pageBg: "bg-slate-950 text-white",
      cardBg: "bg-slate-900/60 border-amber-500/20",
      textPrimary: "text-white",
      textSecondary: "text-slate-300",
      accentBg: "bg-amber-500/15 border-amber-500/30",
      accentText: "text-amber-300",
      heroGradient:
        "bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.2),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.15),transparent_40%)]",
      buttonPrimary: "bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white",
      buttonSecondary: "bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30",
      borderColor: "border-amber-500/20",
    },
  },
];

export function getPortfolioTheme(templateId: string): PortfolioTheme {
  const found = portfolioTemplateRegistry.find((t) => t.id === templateId);
  return found?.theme ?? portfolioTemplateRegistry[0].theme;
}
