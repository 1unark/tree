// components/branch/Entry.tsx
import React from 'react';
import { TimelineEntry, DragState } from '../../types/timeline.types';

interface BranchEntryProps {
  entry: TimelineEntry;
  entryY: number;
  branchX: number;
  branchColor: string;
  isExpanded: boolean;
  dragState: DragState;
  onToggleExpand: () => void;
  onStartBranchDrag: (entryId: string | number, x: number, y: number) => void;
}

export default function BranchEntry({
  entry,
  entryY,
  branchX,
  branchColor,
  isExpanded,
  dragState,
  onToggleExpand,
  onStartBranchDrag
}: BranchEntryProps) {
  const dotY = entryY + 18;
  const isDragging = dragState?.type === 'creating-branch';

  const handleDotMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onStartBranchDrag(entry.id, branchX, dotY);
  };

  return (
    <g>
      {/* Dot on the branch line */}
      {!isDragging && (
        <circle 
          cx={branchX}
          cy={dotY}
          r="2.5"
          fill={branchColor}
          opacity="0.4"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Invisible larger circle for easier interaction */}
      <circle
        cx={branchX}
        cy={dotY}
        r="10"
        fill="transparent"
        style={{
          cursor: 'grab',
          pointerEvents: 'all'
        }}
        onMouseDown={handleDotMouseDown}
        onMouseEnter={(e) => {
          if (!isDragging) {
            const nextSibling = e.currentTarget.nextElementSibling as SVGCircleElement | null;
            nextSibling?.setAttribute('opacity', '1');
          }
        }}
        onMouseLeave={(e) => {
          const nextSibling = e.currentTarget.nextElementSibling as SVGCircleElement | null;
          nextSibling?.setAttribute('opacity', '0');
        }}
      />

      {/* Hover highlight */}
      <circle
        cx={branchX}
        cy={dotY}
        r="7"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="1.5"
        opacity="0"
        style={{ pointerEvents: 'none', transition: 'opacity 0.2s' }}
      />

      {/* Entry card - positioned to the right of the line */}
      <rect
        x={branchX + 24}
        y={entryY}
        width={276}
        height={64}
        fill={isExpanded ? `${branchColor}0a` : 'transparent'}
        stroke="transparent"
        strokeWidth="1"
        rx="8"
        style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
        onClick={onToggleExpand}
        onMouseOver={(e) => {
          if (!isExpanded) e.currentTarget.setAttribute('fill', `${branchColor}05`);
        }}
        onMouseOut={(e) => {
          if (!isExpanded) e.currentTarget.setAttribute('fill', 'transparent');
        }}
      />

      {/* Entry title */}
      <text
        x={branchX + 44}
        y={entryY + 20}
        fontSize="12"
        fontWeight="600"
        fill="#000000"
        letterSpacing="-0.01em"
        style={{ pointerEvents: 'none' }}
      >
        {entry.title}
      </text>

      {/* Entry date */}
      <text
        x={branchX + 44}
        y={entryY + 36}
        fontSize="10"
        fill="#6b6b6b"
        fontWeight="500"
        style={{ pointerEvents: 'none' }}
      >
        {entry.date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}
      </text>

      {/* Entry preview */}
      <text
        x={branchX + 44}
        y={entryY + 52}
        fontSize="11"
        fill="#8a8a8a"
        style={{ pointerEvents: 'none' }}
      >
        {entry.preview.substring(0, 36)}...
      </text>
    </g>
  );
}