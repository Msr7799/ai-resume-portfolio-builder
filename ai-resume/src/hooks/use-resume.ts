"use client";

import { useState } from "react";
import { mockResume } from "@/lib/mock-data";
import { storageService } from "@/lib/storage";
import type { Resume } from "@/types";

export function useResume() {
  const [resume, setResumeState] = useState<Resume>(() =>
    typeof window === "undefined" ? mockResume : storageService.getResume(),
  );

  function setResume(nextResume: Resume) {
    setResumeState(nextResume);
    storageService.saveResume(nextResume);
  }

  return { resume, setResume, ready: true };
}
