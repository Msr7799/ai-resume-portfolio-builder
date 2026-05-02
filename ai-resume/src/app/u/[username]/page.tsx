import { PortfolioPreview } from "@/components/portfolio/portfolio-preview";
import { mockPortfolio, mockResume } from "@/lib/mock-data";

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const portfolio = { ...mockPortfolio, username };

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 md:p-8">
      <div className="mx-auto max-w-6xl">
        <PortfolioPreview portfolio={portfolio} resume={mockResume} publicMode />
      </div>
    </main>
  );
}
