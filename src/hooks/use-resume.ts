"use client";

import { useEffect, useState } from "react";
import { mockResume } from "@/lib/mock-data";
import { storageService } from "@/lib/storage";
import type { Resume } from "@/types";

/**
 * Hydration-safe resume state.
 *
 * The server cannot read localStorage, so rendering localStorage-backed data during
 * the first client render causes a hydration mismatch when the saved resume differs
 * from the mock server snapshot. Start with the same mock value on server and first
 * client render, then load the real saved resume after hydration.
 */
export function useResume() {
  const [resume, setResumeState] = useState<Resume>(mockResume);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setResumeState(storageService.getResume());
    setReady(true);
  }, []);

  function setResume(nextResume: Resume) {
    setResumeState(nextResume);
    storageService.saveResume(nextResume);
  }

  return { resume, setResume, ready };
}
