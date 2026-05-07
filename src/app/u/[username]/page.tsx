import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortfolioPreview } from "@/components/portfolio/portfolio-preview";
import { usersCollection, portfoliosCollection, resumesCollection } from "@/lib/server/mongodb";

type PageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const users = await usersCollection();
  const user = await users.findOne({ username });

  if (!user) {
    return { title: "User not found" };
  }

  return {
    title: `${user.name} — Portfolio`,
    description: `${user.name}'s professional portfolio and resume.`,
  };
}

export default async function PublicPortfolioPage({ params }: PageProps) {
  const { username } = await params;

  // Find user by username
  const users = await usersCollection();
  const user = await users.findOne({ username });
  if (!user) return notFound();

  const userId = String(user._id);

  // Fetch portfolio
  const portfolios = await portfoliosCollection();
  const portfolioDoc = await portfolios.findOne({ userId });

  // Only show if portfolio is published
  if (!portfolioDoc?.portfolio?.published) return notFound();

  // Fetch latest resume for supplementary data (skills, experience displayed on portfolio)
  const resumes = await resumesCollection();
  const resumeDoc = await resumes.findOne(
    { userId },
    { sort: { updatedAt: -1 } },
  );

  const portfolio = {
    ...portfolioDoc.portfolio,
    username,
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 md:p-8">
      <div className="mx-auto max-w-6xl">
        <PortfolioPreview
          portfolio={portfolio}
          resume={resumeDoc?.resume}
          publicMode
        />
      </div>
    </main>
  );
}
