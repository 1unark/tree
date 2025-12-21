// components/main/Period.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { TimelinePeriod, DragState } from '../../types/timeline.types';
import MainEntry from './Entry';

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
  onUpdateChapterName
}: MainTimelinePeriodProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(period.title);
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

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditingName && period.id !== 'uncategorized') {
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

  return (
    <g>
      <rect
        x={spineX - 120}
        y={periodY - 20}
        width={240}
        height={48}
        fill="#f8f8f8"
        stroke="#e0e0e0"
        strokeWidth="1"
        rx="8"
      />

      <rect
        x={spineX - 105}
        y={periodY - 10}
        width={24}
        height={24}
        fill="transparent"
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePeriod();
        }}
      />
      
      <g style={{ pointerEvents: 'none' }}>
        {period.collapsed ? 
          <ChevronRight 
            x={spineX - 101} 
            y={periodY - 9} 
            size={16} 
            color="#666666" 
            strokeWidth={2.5}
          /> : 
          <ChevronDown 
            x={spineX - 101} 
            y={periodY - 9} 
            size={16} 
            color="#666666" 
            strokeWidth={2.5}
          />
        }
      </g>

      {isEditingName ? (
        <foreignObject
          x={spineX - 75}
          y={periodY - 10}
          width="150"
          height="26"
        >
          <input
            ref={inputRef}
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            maxLength={50}
            style={{
              width: '100%',
              fontSize: '14px',
              fontWeight: '600',
              color: '#000000',
              letterSpacing: '-0.01em',
              border: '1.5px solid #3b82f6',
              borderRadius: '4px',
              padding: '2px 4px',
              outline: 'none',
              background: 'white',
              boxSizing: 'border-box'
            }}
          />
        </foreignObject>
      ) : (
        <text
          x={spineX - 75}
          y={periodY + 7}
          fontSize="14"
          fontWeight="600"
          fill="#000000"
          letterSpacing="-0.01em"
          style={{ 
            cursor: period.id === 'uncategorized' ? 'default' : 'text', 
            pointerEvents: 'all' 
          }}
          onClick={period.id !== 'uncategorized' ? handleNameClick : undefined}
        >
          {period.title}
        </text>
      )}

      <text
        x={spineX + 80}
        y={periodY + 7}
        fontSize="11"
        fill="#8a8a8a"
        textAnchor="end"
        style={{ pointerEvents: 'none' }}
      >
        {period.dateRange}
      </text>

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

      <circle
        cx={spineX}
        cy={periodY + 8}
        r="6"
        fill="#e0e0e0"
        stroke="#d0d0d0"
        strokeWidth="1.5"
        style={{ 
          cursor: 'grab',
          pointerEvents: 'all'
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onStartBranchDrag(`period-${period.id}`, spineX, periodY + 8);
        }}
      />
    </g>
  );
}