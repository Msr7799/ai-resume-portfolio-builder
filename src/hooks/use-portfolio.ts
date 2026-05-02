"use client";

import { useState } from "react";
import { mockPortfolio } from "@/lib/mock-data";
import { storageService } from "@/lib/storage";
import type { Portfolio } from "@/types";

export function usePortfolio() {
  const [portfolio, setPortfolioState] = useState<Portfolio>(() =>
    typeof window === "undefined" ? mockPortfolio : storageService.getPortfolio(),
  );

  function setPortfolio(nextPortfolio: Portfolio) {
    setPortfolioState(nextPortfolio);
    storageService.savePortfolio(nextPortfolio);
  }

  return { portfolio, setPortfolio, ready: true };
}
