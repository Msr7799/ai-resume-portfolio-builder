"use client";

import { useEffect, useState } from "react";
import { mockPortfolio } from "@/lib/mock-data";
import { storageService } from "@/lib/storage";
import type { Portfolio } from "@/types";

/**
 * Hydration-safe portfolio state. Mirrors the server snapshot first, then loads
 * the saved localStorage value on the client after hydration.
 */
export function usePortfolio() {
  const [portfolio, setPortfolioState] = useState<Portfolio>(mockPortfolio);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPortfolioState(storageService.getPortfolio());
    setReady(true);
  }, []);

  function setPortfolio(nextPortfolio: Portfolio) {
    setPortfolioState(nextPortfolio);
    storageService.savePortfolio(nextPortfolio);
  }

  return { portfolio, setPortfolio, ready };
}
