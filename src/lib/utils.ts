import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function formatList(items: string[]) {
  return items.filter(Boolean).join(", ");
}

export function profileCompletionScore(values: string[]) {
  const completed = values.filter((value) => value.trim().length > 0).length;
  return Math.round((completed / values.length) * 100);
}
