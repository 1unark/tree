import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { TimelinePeriod } from '../../types/timeline.types';
import MainTimelineEntry from './Entry';

interface MainTimelinePeriodProps {
  period: TimelinePeriod;
  periodY: number;
  spineX: number;
  positions: Map<string, number>;
  expandedEntry: string | number | null;
  onTogglePeriod: () => void;
  onToggleEntry: (entryId: string | number) => void;
}

export default function MainTimelinePeriod({
  period,
  periodY,
  spineX,
  positions,
  expandedEntry,
  onTogglePeriod,
  onToggleEntry
}: MainTimelinePeriodProps) {
  return (
    <g>
      <circle cx={spineX} cy={periodY + 8} r="6" fill="#000000" />
      
      <rect
        x={50}
        y={periodY - 10}
        width={280}
        height={62}
        fill="transparent"
        style={{ cursor: 'pointer' }}
        onClick={onTogglePeriod}
      />
      
      <g style={{ cursor: 'pointer', pointerEvents: 'none' }}>
        {period.collapsed ? 
          <ChevronRight x={60} y={periodY + 3} size={18} color="#6b6b6b" strokeWidth={2.5} /> : 
          <ChevronDown x={60} y={periodY + 3} size={18} color="#6b6b6b" strokeWidth={2.5} />
        }
        
        <text
          x={88}
          y={periodY + 9}
          fontSize="15"
          fontWeight="600"
          fill="#000000"
          letterSpacing="-0.01em"
        >
          {period.title}
        </text>
        
        <text
          x={88}
          y={periodY + 28}
          fontSize="12"
          fill="#6b6b6b"
          fontWeight="500"
        >
          {period.dateRange} • {period.entries.length} {period.entries.length === 1 ? 'entry' : 'entries'}
        </text>
      </g>

      {!period.collapsed && period.entries.map(entry => {
        const entryY = positions.get(`entry-${entry.id}`);
        if (!entryY) return null;
        
        return (
          <MainTimelineEntry
            key={entry.id}
            entry={entry}
            entryY={entryY}
            spineX={spineX}
            isExpanded={expandedEntry === entry.id}
            onToggleExpand={() => onToggleEntry(entry.id)}
          />
        );
      })}
    </g>
  );
}