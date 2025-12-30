// components/branch/Period.tsx
import React from 'react';
import { TimelinePeriod, TimelineBranch, DragState } from '../../types/timeline.types';
import BranchEntry from './Branch';
import ChapterHeader from '../../shared/ChapterHeader';
import { findMainPeriodForDate } from '../../utils/timelineHelpers';
import { LAYOUT_CONSTANTS } from '../../utils/layoutCalculations';

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
  // Calculate the starting Y position for the branch
  const getBranchSourceY = (): number => {
    // If sourceEntryId is set, find that entry's position
    if (branch.sourceEntryId) {
      // Check if it's a period reference (starts with 'period-')
      if (typeof branch.sourceEntryId === 'string' && branch.sourceEntryId.startsWith('period-')) {
        const periodId = branch.sourceEntryId.replace('period-', '');
        const periodY = positions.get(`period-${periodId}`);
        if (periodY !== undefined) {
          return periodY + LAYOUT_CONSTANTS.periodDotOffset;
        }
      } else {
        // It's an entry - find it in the main timeline
        for (const mainPeriod of mainTimeline) {
          const entry = mainPeriod.entries.find(e => e.id === branch.sourceEntryId);
          if (entry) {
            const entryY = positions.get(`entry-${entry.id}`);
            if (entryY !== undefined) {
              return entryY + LAYOUT_CONSTANTS.entryDotOffset;
            }
          }
        }
      }
    }
    
    // Fallback: use the first period's date to find a matching main period
    const firstPeriod = branch.periods[0];
    const matchingMainPeriod = findMainPeriodForDate(mainTimeline, firstPeriod.startDate);
    return matchingMainPeriod 
      ? (positions.get(`period-${matchingMainPeriod.id}`) ?? LAYOUT_CONSTANTS.startY)
      : LAYOUT_CONSTANTS.startY;
  };

  const branchSourceY = getBranchSourceY();
  
  // Find which index this period is in the branch
  const branchIndex = branch.periods.findIndex(p => p.id === period.id);
  
  // Calculate offset from previous periods in this branch using proper spacing constants
  let offset = 0;
  for (let i = 0; i < branchIndex; i++) {
    const prevPeriod = branch.periods[i];
    
    // Add space for the period header
    offset += LAYOUT_CONSTANTS.periodHeaderHeight;
    
    if (!prevPeriod.collapsed && prevPeriod.entries.length > 0) {
      // Add space for all entry cards
      offset += prevPeriod.entries.length * LAYOUT_CONSTANTS.entryCardHeight;
      
      // Add spacing between entries (n-1 gaps for n entries)
      offset += (prevPeriod.entries.length - 1) * LAYOUT_CONSTANTS.branchEntrySpacing;
      
      // Add gap between last entry and next chapter
      offset += LAYOUT_CONSTANTS.branchEntryToChapterGap;
    } else {
      // No entries - add chapter-to-chapter gap
      offset += LAYOUT_CONSTANTS.branchChapterToChapterGap;
    }
  }

  // Calculate this period's Y position
  const periodY = branchIndex === 0 ? branchSourceY : branchSourceY + offset;

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
        // onUpdateDates is not a valid prop for ChapterHeader
        onDelete={onDeleteChapter ? handleDelete : undefined}
        color="#000000"
        periodId={period.id}
        onStartBranchDrag={onStartBranchDrag} 
      />

      {/* Entries */}
      {!period.collapsed && period.entries.map((entry, idx) => {
        // Calculate entry Y position using proper spacing
        const entryY = periodY + LAYOUT_CONSTANTS.periodHeaderHeight + 
                       (idx * LAYOUT_CONSTANTS.entryCardHeight) + 
                       (idx * LAYOUT_CONSTANTS.branchEntrySpacing);
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