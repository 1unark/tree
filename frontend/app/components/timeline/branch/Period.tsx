import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { TimelinePeriod, TimelineBranch } from '../../types/timeline.types';
import BranchEntry from './Branch';
import { calculateBranchY } from '../../utils/timelineHelpers';

interface BranchPeriodProps {
  period: TimelinePeriod;
  branch: TimelineBranch;
  mainTimeline: TimelinePeriod[];
  positions: Map<string, number>;
  expandedEntry: string | number | null;
  onTogglePeriod: () => void;
  onToggleEntry: (entryId: string | number) => void;
}

export default function BranchPeriod({
  period,
  branch,
  mainTimeline,
  positions,
  expandedEntry,
  onTogglePeriod,
  onToggleEntry
}: BranchPeriodProps) {
  const periodStartY = calculateBranchY(branch, period, mainTimeline, positions);

  return (
    <g>
      <circle cx={branch.x} cy={periodStartY + 8} r="5" fill={branch.color} />
      
      <rect
        x={branch.x + 20}
        y={periodStartY - 10}
        width={260}
        height={50}
        fill="transparent"
        style={{ cursor: 'pointer' }}
        onClick={onTogglePeriod}
      />
      
      <g style={{ pointerEvents: 'none' }}>
        {period.collapsed ? 
          <ChevronRight x={branch.x + 28} y={periodStartY - 2} size={16} color={branch.color} opacity={0.7} strokeWidth={2.5} /> : 
          <ChevronDown x={branch.x + 28} y={periodStartY - 2} size={16} color={branch.color} opacity={0.7} strokeWidth={2.5} />
        }
        
        <text
          x={branch.x + 52}
          y={periodStartY + 5}
          fontSize="13"
          fontWeight="600"
          fill="#000000"
          letterSpacing="-0.01em"
        >
          {period.title}
        </text>
        
        <text
          x={branch.x + 52}
          y={periodStartY + 22}
          fontSize="11"
          fill="#6b6b6b"
          fontWeight="500"
        >
          {period.dateRange}
        </text>
      </g>

      {!period.collapsed && period.entries.map((entry, eIdx) => {
        const entryY = calculateBranchY(branch, period, mainTimeline, positions, eIdx);
        
        return (
          <BranchEntry
            key={entry.id}
            entry={entry}
            entryY={entryY}
            branchX={branch.x}
            branchColor={branch.color}
            isExpanded={expandedEntry === entry.id}
            onToggleExpand={() => onToggleEntry(entry.id)}
          />
        );
      })}
    </g>
  );
}