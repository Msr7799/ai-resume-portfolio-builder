"use client";

import { useEffect, useRef, useState } from "react";

type PromptModalProps = {
  open: boolean;
  title: string;
  placeholder?: string;
  defaultValue?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
};

export function PromptModal({
  open,
  title,
  placeholder,
  defaultValue = "",
  onSubmit,
  onCancel,
}: PromptModalProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      // Focus on next tick to let the dialog open first
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, defaultValue]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(value);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="mx-4 w-full max-w-md animate-[fadeIn_150ms_ease-out] rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
      >
        <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="mb-4 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-blue-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Hook that provides an async `prompt()` replacement using a modal dialog.
 * Usage:
 *   const { prompt, PromptDialog } = usePromptModal();
 *   const value = await prompt("Enter URL", "https://");
 *   // Render <PromptDialog /> in your JSX
 */
export function usePromptModal() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    placeholder?: string;
    defaultValue?: string;
    resolve: ((value: string | null) => void) | null;
  }>({ open: false, title: "", resolve: null });

  function prompt(title: string, defaultValue = "", placeholder?: string): Promise<string | null> {
    return new Promise((resolve) => {
      setState({ open: true, title, defaultValue, placeholder, resolve });
    });
  }

  function PromptDialog() {
    return (
      <PromptModal
        open={state.open}
        title={state.title}
        placeholder={state.placeholder}
        defaultValue={state.defaultValue}
        onSubmit={(value) => {
          state.resolve?.(value);
          setState((prev) => ({ ...prev, open: false, resolve: null }));
        }}
        onCancel={() => {
          state.resolve?.(null);
          setState((prev) => ({ ...prev, open: false, resolve: null }));
        }}
      />
    );
  }

  return { prompt, PromptDialog };
}
