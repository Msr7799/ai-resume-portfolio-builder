import { mockPortfolio, mockResume, mockUser } from "@/lib/mock-data";
import type { Portfolio, Resume, UserProfile } from "@/types";

const KEYS = {
  user: "airpb:user",
  resume: "airpb:resume",
  portfolio: "airpb:portfolio",
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function read<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  const value = window.localStorage.getItem(key);
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const storageService = {
  getUser(): UserProfile {
    return read<UserProfile>(KEYS.user, mockUser);
  },
  saveUser(user: UserProfile) {
    write(KEYS.user, user);
  },
  getResume(): Resume {
    return read<Resume>(KEYS.resume, mockResume);
  },
  saveResume(resume: Resume) {
    write(KEYS.resume, { ...resume, updatedAt: new Date().toISOString() });
  },
  getPortfolio(): Portfolio {
    return read<Portfolio>(KEYS.portfolio, mockPortfolio);
  },
  savePortfolio(portfolio: Portfolio) {
    write(KEYS.portfolio, { ...portfolio, updatedAt: new Date().toISOString() });
  },
  resetDemoData() {
    write(KEYS.user, mockUser);
    write(KEYS.resume, mockResume);
    write(KEYS.portfolio, mockPortfolio);
  },
};
