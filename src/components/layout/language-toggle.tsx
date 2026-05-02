"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/layout/language-provider";

export function LanguageToggle() {
  const { t, toggleLocale } = useLanguage();

  return (
    <Button size="sm" variant="secondary" onClick={toggleLocale}>
      <Languages className="size-4" />
      {t("language")}
    </Button>
  );
}
