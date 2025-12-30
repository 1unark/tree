// components/branch/Period.tsx
import React from 'react';
import { TimelinePeriod, TimelineBranch, DragState } from '../../types/timeline.types';
import BranchEntry from './Branch';
import ChapterHeader from '../../shared/ChapterHeader';
import { calculateBranchPositions, LAYOUT_CONSTANTS } from '../../utils/layoutCalculations';

interface BranchPeriodProps {
  period: TimelinePeriod;
  branch: TimelineBranch;
  mainTimeline: TimelinePeriod[];
  positions: Map<string, number>;
  expandedEntry: string | number | null;
  dragState: DragState;
  onTogglePeriod: () => void;
  onToggleEntry: (entryId: string | number) => void;
  onStartBranchDrag: (entryId: string | number, x: number, y: number) => void;
  onUpdateChapterName?: (chapterId: number, newName: string) => void;
  onUpdateChapterDates?: (chapterId: number, startDate: string, endDate: string) => void;
  onDeleteChapter?: (chapterId: number) => void;
}

export default function BranchPeriod({
  period,
  branch,
  mainTimeline,
  positions,
  expandedEntry,
  dragState,
  onTogglePeriod,
  onToggleEntry,
  onStartBranchDrag,
  onUpdateChapterName,
  onUpdateChapterDates,
  onDeleteChapter
}: BranchPeriodProps) {
  // USE THE CENTRALIZED CALCULATION FUNCTION
  const branchPositions = calculateBranchPositions(branch, mainTimeline, positions);
  
  // Get this period's Y position from the calculated positions
  const periodPos = branchPositions.get(`branch-${branch.id}-period-${period.id}`);
  const periodY = periodPos?.y ?? LAYOUT_CONSTANTS.startY;

  const handleUpdateName = (newName: string) => {
    if (onUpdateChapterName && typeof period.id === 'number') {
      onUpdateChapterName(period.id, newName);
    }
  };

  const handleUpdateDates = (startDate: string, endDate: string) => {
    if (onUpdateChapterDates && typeof period.id === 'number') {
      onUpdateChapterDates(period.id, startDate, endDate);
    }
  };

  const handleDelete = () => {
    if (onDeleteChapter && typeof period.id === 'number') {
      onDeleteChapter(period.id);
    }
  };

  return (
    <g>
      {/* Connection dot to branch line */}
      <circle
        cx={branch.x}
        cy={periodY + LAYOUT_CONSTANTS.periodDotOffset}
        r="4"
        fill={branch.color}
        opacity="0.6"
        style={{ pointerEvents: 'none' }}
      />

      {/* Chapter Header */}
      <ChapterHeader
        x={branch.x + 10}
        y={periodY}
        title={period.title}
        dateRange={period.dateRange}
        startDate={period.startDate instanceof Date ? period.startDate.toISOString() : period.startDate}
        endDate={period.endDate instanceof Date ? period.endDate.toISOString() : period.endDate}
        entryCount={period.entries.length}
        collapsed={period.collapsed}
        onToggle={onTogglePeriod}
        onUpdateName={onUpdateChapterName ? handleUpdateName : undefined}
        onDelete={onDeleteChapter ? handleDelete : undefined}
        color="#000000"
        periodId={period.id}
        onStartBranchDrag={onStartBranchDrag} 
      />

      {/* Entries */}
      {!period.collapsed && period.entries.map((entry) => {
        // Get entry Y position from calculated positions
        const entryPos = branchPositions.get(`branch-${branch.id}-entry-${entry.id}`);
        const entryY = entryPos?.y ?? periodY + LAYOUT_CONSTANTS.periodHeaderHeight;
        const isExpanded = expandedEntry === entry.id;
        
        return (
          <BranchEntry
            key={entry.id}
            entry={entry}
            entryY={entryY}
            branchX={branch.x}
            branchColor={branch.color}
            isExpanded={isExpanded}
            dragState={dragState}
            onToggleExpand={() => onToggleEntry(entry.id)}
            onStartBranchDrag={onStartBranchDrag}
          />
        );
      })}
    </g>
  );
}