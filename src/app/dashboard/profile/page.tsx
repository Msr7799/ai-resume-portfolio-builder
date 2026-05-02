import { LibraryManager } from "@/components/library/library-manager";
import { ProfileManager } from "@/components/profile/profile-manager";
import { SectionHeader } from "@/components/ui/section-header";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="الحساب"
        title="بروفايل المستخدم"
        description="تحديث بيانات المستخدم، الصورة، الدور، وحفظ نسخ السيرة والبورتفوليو في MongoDB."
      />
      <ProfileManager />
      <LibraryManager />
    </div>
  );
}
