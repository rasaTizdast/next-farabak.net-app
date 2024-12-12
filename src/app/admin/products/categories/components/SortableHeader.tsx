import React from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

type SortableHeaderProps = {
  children: React.ReactNode;
  sortKey: string;
  sortConfig: {
    key: string;
    direction: "ascending" | "descending";
  };
  onSort: (key: string) => void;
};

const SortableHeader: React.FC<SortableHeaderProps> = ({
  children,
  sortKey,
  sortConfig,
  onSort,
}) => (
  <th
    className="px-6 py-3 text-gray-300 hover:text-gray-100 transition-colors cursor-pointer"
    onClick={() => onSort(sortKey)}
  >
    <div className="flex items-center justify-center gap-2">
      {children}
      {sortConfig.key === sortKey &&
        (sortConfig.direction === "ascending" ? (
          <FaSortUp aria-label="Sort ascending" />
        ) : (
          <FaSortDown aria-label="Sort descending" />
        ))}
      {sortConfig.key !== sortKey && <FaSort className="text-gray-400" />}
    </div>
  </th>
);

export default SortableHeader;
