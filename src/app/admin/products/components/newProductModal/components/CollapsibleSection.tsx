"use client";

import React from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

type CollapsibleSectionProps = {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  titleTestId?: string;
  /** Step id used to build the section's DOM id, so nav buttons can scroll to it. */
  sectionId?: string;
  children: React.ReactNode;
};

export function CollapsibleSection({
  isOpen,
  onToggle,
  title,
  titleTestId,
  sectionId,
  children,
}: CollapsibleSectionProps) {
  return (
    <div
      id={sectionId ? `wizard-section-${sectionId}` : undefined}
      className="mb-4 scroll-mt-20 overflow-hidden rounded-lg border border-slate-600 bg-slate-900"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between p-4 text-right transition-colors hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none focus-visible:ring-inset"
        aria-expanded={isOpen}
        aria-controls={sectionId ? `wizard-section-${sectionId}-content` : undefined}
      >
        <span className="text-lg font-semibold" data-testid={titleTestId}>
          {title}
        </span>
        {isOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
      </button>
      <div
        id={sectionId ? `wizard-section-${sectionId}-content` : undefined}
        className={isOpen ? "block" : "hidden"}
      >
        {children}
      </div>
    </div>
  );
}
