// components/main/Period.tsx - FIXED
import React from 'react';
import { TimelinePeriod, DragState } from '../../types/timeline.types';
import MainEntry from './Entry';
import ChapterHeader from '../../shared/ChapterHeader';

interface MainTimelinePeriodProps {
  period: TimelinePeriod;
  periodY: number;
  spineX: number;
  positions: Map<string, number>;
  expandedEntry: string | number | null;
  dragState: DragState;
  onTogglePeriod: () => void;
  onToggleEntry: (entryId: string | number) => void;
  onStartBranchDrag: (entryId: string | number, x: number, y: number) => void;
  onUpdateChapterName?: (chapterId: number, newName: string) => void;
  onUpdateChapterDates?: (chapterId: number, startDate: string, endDate: string) => void;
  onDeleteChapter?: (chapterId: number) => void;
  onCreateEntryInChapter?: (chapterId: number) => void;
}

export default function MainTimelinePeriod({
  period,
  periodY,
  spineX,
  positions,
  expandedEntry,
  dragState,
  onTogglePeriod,
  onToggleEntry,
  onStartBranchDrag,
  onUpdateChapterName,
  onUpdateChapterDates,
  onDeleteChapter,
  onCreateEntryInChapter
}: MainTimelinePeriodProps) {
  // Check if this is the uncategorized section
  const isUncategorized = 
    (typeof period.id === 'string' && period.id === 'uncategorized') || 
    period.title === 'Uncategorized';

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

  const handleDotClick = () => {
    if (typeof period.id === 'number' && onCreateEntryInChapter) {
      onCreateEntryInChapter(period.id);
    }
  };

  // If uncategorized, render entries only without chapter header
  if (isUncategorized) {
    return (
      <g>
        {!period.collapsed && period.entries.map((entry, idx) => {
          const entryY = positions.get(`entry-${entry.id}`) || (periodY + idx * 72);
          const isExpanded = expandedEntry === entry.id;
          
          return (
            <MainEntry
              key={entry.id}
              entry={entry}
              entryY={entryY}
              spineX={spineX}
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

  // Regular chapter rendering
  return (
    <g>
      <ChapterHeader
        periodId={period.id}
        x={spineX - 160}
        y={periodY - 10}
        title={period.title || 'Untitled'}
        dateRange={period.dateRange}
        startDate={period.startDate?.toISOString()}
        endDate={period.endDate?.toISOString()}
        entryCount={period.entries.length}
        collapsed={period.collapsed}
        onToggle={onTogglePeriod}
        onUpdateName={onUpdateChapterName ? handleUpdateName : undefined}
        // Removed onUpdateDates as it is not a valid prop for ChapterHeader
        onDelete={onDeleteChapter ? handleDelete : undefined}
        onDotClick={handleDotClick}
        onStartBranchDrag={onStartBranchDrag}
        dotX={spineX}
        color="#000000"
        isUncategorized={isUncategorized}
      />

      {!period.collapsed && period.entries.map((entry, idx) => {
        const entryY = positions.get(`entry-${entry.id}`) || (periodY + 48 + idx * 72);
        const isExpanded = expandedEntry === entry.id;
        
        return (
          <MainEntry
            key={entry.id}
            entry={entry}
            entryY={entryY}
            spineX={spineX}
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