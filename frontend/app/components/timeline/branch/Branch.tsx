import React from 'react';
import { TimelineEntry } from '../../types/timeline.types';

interface BranchEntryProps {
  entry: TimelineEntry;
  entryY: number;
  branchX: number;
  branchColor: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function BranchEntry({
  entry,
  entryY,
  branchX,
  branchColor,
  isExpanded,
  onToggleExpand
}: BranchEntryProps) {
  return (
    <g>
      <circle cx={branchX} cy={entryY + 18} r="2.5" fill={branchColor} opacity="0.4" />
      
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