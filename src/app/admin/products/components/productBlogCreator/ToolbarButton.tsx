// src/components/ui/ToolbarButton.tsx

import { LucideIcon } from "lucide-react";

interface ToolbarButtonProps {
  active?: boolean;
  onClick: () => void;
  icon: LucideIcon;
  title: string;
}

export const ToolbarButton = ({
  active,
  onClick,
  icon: Icon,
  title,
}: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 hover:bg-gray-600 rounded-md ${
      active ? "bg-gray-600 text-white" : "text-gray-300"
    }`}
  >
    <Icon className="w-5 h-5" />
  </button>
);
