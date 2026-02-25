"use client";

import type { TimeBlock } from "@/types";

interface TimeBlockChipProps {
  block: TimeBlock;
  style?: React.CSSProperties;
  onClick: (block: TimeBlock) => void;
}

export function TimeBlockChip({ block, style, onClick }: TimeBlockChipProps) {
  return (
    <button
      onClick={() => onClick(block)}
      className="block w-full rounded-md p-1.5 text-xs text-left bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/60 transition-all border border-dashed border-red-300 dark:border-red-800 overflow-hidden"
      style={style}
    >
      <p className="font-medium truncate text-red-700 dark:text-red-400">
        {block.title}
      </p>
    </button>
  );
}
