import { GitHubConnectCard } from "@/components/github/github-connect-card";
import { SectionHeader } from "@/components/ui/section-header";

export default function GitHubPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="التكاملات"
        title="ربط GitHub"
        description="أدخل اسم مستخدم GitHub عام لجلب بيانات الملف واقتراحات المستودعات."
      />
      <GitHubConnectCard />
    </div>
  );
}
