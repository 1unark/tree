import React from 'react';
import { GripVertical, ChevronRight, ChevronDown } from 'lucide-react';
import { TimelineBranch, TimelinePeriod } from '../../types/timeline.types';
import BranchPeriod from './Period';
import { findMainPeriodForDate } from '../../utils/timelineHelpers';
import { LAYOUT_CONSTANTS } from '../../utils/layoutCalculations';

interface BranchTimelineProps {
  branch: TimelineBranch;
  mainTimeline: TimelinePeriod[];
  positions: Map<string, number>;
  totalHeight: number;
  expandedEntry: string | number | null;
  onStartDrag: () => void;
  onToggleBranch: () => void;
  onTogglePeriod: (periodId: string | number) => void;
  onToggleEntry: (entryId: string | number) => void;
}

export default function BranchTimeline({
  branch,
  mainTimeline,
  positions,
  totalHeight,
  expandedEntry,
  onStartDrag,
  onToggleBranch,
  onTogglePeriod,
  onToggleEntry
}: BranchTimelineProps) {
  if (!branch.periods || branch.periods.length === 0) return null;
  
  const firstPeriod = branch.periods[0];
  const matchingMainPeriod = findMainPeriodForDate(mainTimeline, firstPeriod.startDate);
  const branchStartY = matchingMainPeriod 
    ? positions.get(`period-${matchingMainPeriod.id}`)
    : LAYOUT_CONSTANTS.startY;

  return (
    <g>
      <line
        x1={LAYOUT_CONSTANTS.spineX + 20}
        y1={branchStartY + 8}
        x2={branch.x - 20}
        y2={branchStartY + 8}
        stroke={branch.color}
        strokeWidth="2"
        opacity="0.2"
        strokeDasharray="4 4"
      />

      <line
        x1={branch.x}
        y1={branchStartY}
        x2={branch.x}
        y2={totalHeight - 40}
        stroke={branch.color}
        strokeWidth="2"
        opacity="0.12"
      />

      <rect
        x={branch.x - 100}
        y={branchStartY - 53}
        width="200"
        height="36"
        fill="#ffffff"
        stroke={branch.color}
        strokeWidth="1.5"
        rx="8"
        style={{ cursor: 'grab' }}
        onMouseDown={onStartDrag}
      />
      
      <g
        onMouseDown={onStartDrag}
        style={{ cursor: 'grab', pointerEvents: 'none' }}
      >
        <GripVertical x={branch.x - 90} y={branchStartY - 41} size={14} color={branch.color} opacity={0.5} />
      </g>
      
      <rect
        x={branch.x - 65}
        y={branchStartY - 32}
        width={24}
        height={24}
        fill="transparent"
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          onToggleBranch();
        }}
      />
      
      <g style={{ pointerEvents: 'none' }}>
        {branch.collapsed ? 
          <ChevronRight x={branch.x - 61} y={branchStartY - 42} size={16} color={branch.color} strokeWidth={2.5} /> : 
          <ChevronDown x={branch.x - 61} y={branchStartY - 42} size={16} color={branch.color} strokeWidth={2.5} />
        }
        
        <text
          x={branch.x - 38}
          y={branchStartY - 30}
          fontSize="13"
          fontWeight="600"
          fill={branch.color}
          letterSpacing="-0.01em"
        >
          {branch.name}
        </text>
      </g>

      {!branch.collapsed && branch.periods.map((period) => {
        const matchingMainPeriod = findMainPeriodForDate(mainTimeline, period.startDate);
        const mainPeriodCollapsed = matchingMainPeriod?.collapsed || false;
        
        if (mainPeriodCollapsed) return null;
        
        return (
          <BranchPeriod
            key={period.id}
            period={period}
            branch={branch}
            mainTimeline={mainTimeline}
            positions={positions}
            expandedEntry={expandedEntry}
            onTogglePeriod={() => onTogglePeriod(period.id)}
            onToggleEntry={onToggleEntry}
          />
        );
      })}
    </g>
  );
}