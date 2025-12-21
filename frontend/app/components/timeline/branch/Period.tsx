// components/branch/Period.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { TimelinePeriod, TimelineBranch, DragState } from '../../types/timeline.types';
import BranchEntry from './Branch';
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
  onDeleteChapter
}: BranchPeriodProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(period.title);
  const [showActions, setShowActions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    setEditedName(period.title);
  }, [period.title]);

  const matchingMainPeriod = findMainPeriodForDate(mainTimeline, period.startDate);
  if (!matchingMainPeriod) return null;

  const mainPeriodY = positions.get(`period-${matchingMainPeriod.id}`);
  if (mainPeriodY === undefined) return null;

  const branchIndex = branch.periods.findIndex(p => p.id === period.id);
  let offset = 0;
  
  for (let i = 0; i < branchIndex; i++) {
    const prevPeriod = branch.periods[i];
    const prevMainPeriod = findMainPeriodForDate(mainTimeline, prevPeriod.startDate);
    
    if (prevMainPeriod?.id === matchingMainPeriod.id) {
      if (!prevPeriod.collapsed) {
        offset += LAYOUT_CONSTANTS.periodHeaderHeight;
        offset += prevPeriod.entries.length * LAYOUT_CONSTANTS.entryHeight;
      } else {
        offset += LAYOUT_CONSTANTS.periodHeaderHeight;
      }
    }
  }

  const periodY = mainPeriodY + offset;

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditingName) {
      setIsEditingName(true);
    }
  };

  const handleNameSubmit = () => {
    const trimmedName = editedName.trim();
    
    if (trimmedName && trimmedName !== period.title && onUpdateChapterName && typeof period.id === 'number') {
      onUpdateChapterName(period.id, trimmedName);
    } else {
      setEditedName(period.title);
    }
    
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditedName(period.title);
      setIsEditingName(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteChapter && typeof period.id === 'number') {
      if (confirm(`Delete chapter "${period.title}"?`)) {
        onDeleteChapter(period.id);
      }
    }
  };

  return (
    <g
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Collapse/Expand chevron */}
      <g
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePeriod();
        }}
      >
        <rect
          x={branch.x - 150}
          y={periodY}
          width={20}
          height={20}
          fill="transparent"
        />
        
        {period.collapsed ? 
          <ChevronRight 
            x={branch.x - 146} 
            y={periodY + 2} 
            size={16} 
            color="#000000" 
            strokeWidth={2}
          /> : 
          <ChevronDown 
            x={branch.x - 146} 
            y={periodY + 2} 
            size={16} 
            color="#000000" 
            strokeWidth={2}
          />
        }
      </g>

      {/* Chapter title - editable */}
      {isEditingName ? (
        <foreignObject
          x={branch.x - 120}
          y={periodY - 2}
          width="200"
          height="26"
        >
          <input
            ref={inputRef}
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            maxLength={40}
            style={{
              width: '100%',
              fontSize: '15px',
              fontWeight: '600',
              color: '#000000',
              border: '1px solid #999',
              borderRadius: '3px',
              padding: '2px 6px',
              outline: 'none',
              background: 'white',
              boxSizing: 'border-box'
            }}
          />
        </foreignObject>
      ) : (
        <text
          x={branch.x - 120}
          y={periodY + 15}
          fontSize="15"
          fontWeight="600"
          fill="#000000"
          style={{ cursor: 'text', pointerEvents: 'all' }}
          onClick={handleNameClick}
        >
          {period.title}
        </text>
      )}

      {/* Edit and Delete icons - shown on hover */}
      {showActions && !isEditingName && (
        <>
          <g
            style={{ cursor: 'pointer' }}
            onClick={handleNameClick}
          >
            <circle
              cx={branch.x + 80}
              cy={periodY + 10}
              r="10"
              fill="#f0f0f0"
              stroke="#d0d0d0"
              strokeWidth="1"
            />
            <Edit2
              x={branch.x + 75}
              y={periodY + 5}
              size={10}
              color="#666666"
              strokeWidth={2}
            />
          </g>

          <g
            style={{ cursor: 'pointer' }}
            onClick={handleDelete}
          >
            <circle
              cx={branch.x + 100}
              cy={periodY + 10}
              r="10"
              fill="#fee"
              stroke="#fcc"
              strokeWidth="1"
            />
            <Trash2
              x={branch.x + 95}
              y={periodY + 5}
              size={10}
              color="#e11d48"
              strokeWidth={2}
            />
          </g>
        </>
      )}

      {/* Date range and entry count */}
      <text
        x={branch.x - 120}
        y={periodY + 32}
        fontSize="11"
        fill="#666666"
        style={{ pointerEvents: 'none' }}
      >
        {period.dateRange} • {period.entries.length} {period.entries.length === 1 ? 'entry' : 'entries'}
      </text>

      {!period.collapsed && period.entries.map((entry, idx) => {
        const entryY = periodY + LAYOUT_CONSTANTS.periodHeaderHeight + (idx * LAYOUT_CONSTANTS.entryHeight);
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

      {/* Connection dot to main timeline */}
      <circle
        cx={branch.x}
        cy={periodY + 15}
        r="4"
        fill="#000000"
        style={{ pointerEvents: 'none' }}
      />
    </g>
  );
}