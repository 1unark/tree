// components/main/Entry.tsx
import React from 'react';
import { TimelineEntry, DragState } from '../../types/timeline.types';

interface MainEntryProps {
  entry: TimelineEntry;
  entryY: number;
  spineX: number;
  isExpanded: boolean;
  dragState: DragState;
  onToggleExpand: () => void;
  onStartBranchDrag: (entryId: string | number, x: number, y: number) => void;
}

export default function MainEntry({
  entry,
  entryY,
  spineX,
  isExpanded,
  dragState,
  onToggleExpand,
  onStartBranchDrag
}: MainEntryProps) {
  const dotY = entryY + 18;
  const isDragging = dragState?.type === 'creating-branch';

  const handleDotMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onStartBranchDrag(entry.id, spineX, dotY);
  };

  return (
    <g>
      {!isDragging && (
        <circle 
          cx={spineX} 
          cy={dotY} 
          r="2.5" 
          fill="#666666" 
          opacity="0.4"
          style={{ pointerEvents: 'none' }}
        />
      )}

      <circle
        cx={spineX}
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

      <circle
        cx={spineX}
        cy={dotY}
        r="7"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="1.5"
        opacity="0"
        style={{ pointerEvents: 'none', transition: 'opacity 0.2s' }}
      />

      <rect
        x={spineX - 276}
        y={entryY}
        width={276}
        height={64}
        fill={isExpanded ? '#3b82f60a' : 'transparent'}
        stroke="transparent"
        strokeWidth="1"
        rx="8"
        style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
        onClick={onToggleExpand}
        onMouseOver={(e) => {
          if (!isExpanded) e.currentTarget.setAttribute('fill', '#3b82f605');
        }}
        onMouseOut={(e) => {
          if (!isExpanded) e.currentTarget.setAttribute('fill', 'transparent');
        }}
      />

      <text
        x={spineX - 44}
        y={entryY + 20}
        fontSize="12"
        fontWeight="600"
        fill="#000000"
        textAnchor="end"
        letterSpacing="-0.01em"
        style={{ pointerEvents: 'none' }}
      >
        {entry.title}
      </text>

      <text
        x={spineX - 44}
        y={entryY + 36}
        fontSize="10"
        fill="#6b6b6b"
        fontWeight="500"
        textAnchor="end"
        style={{ pointerEvents: 'none' }}
      >
        {entry.date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}
      </text>

      <text
        x={spineX - 44}
        y={entryY + 52}
        fontSize="11"
        fill="#8a8a8a"
        textAnchor="end"
        style={{ pointerEvents: 'none' }}
      >
        {entry.preview.substring(0, 36)}...
      </text>
    </g>
  );
}