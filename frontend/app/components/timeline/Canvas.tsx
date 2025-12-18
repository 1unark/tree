import React from 'react';
import { Plus } from 'lucide-react';
import { TimelineData } from '../types/timeline.types';
import { LAYOUT_CONSTANTS } from '../utils/layoutCalculations';
import MainTimelinePeriod from './main/Period';
import BranchTimeline from './branch/Entry';

interface TimelineCanvasProps {
  data: TimelineData;
  positions: Map<string, number>;
  totalHeight: number;
  expandedEntry: string | number | null;
  dragging: number | null;
  svgRef: React.RefObject<SVGSVGElement>;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onTimelineClick: (e: React.MouseEvent<SVGSVGElement>) => void; // Keep original prop
  onToggleMainPeriod: (periodId: string | number) => void;
  onToggleBranchPeriod: (branchId: string | number, periodId: string | number) => void;
  onToggleBranch: (branchId: string | number) => void;
  onToggleEntry: (entryId: string | number) => void;
  onStartDragBranch: (branchId: number) => void;
}

export default function TimelineCanvas({
  data,
  positions,
  totalHeight,
  expandedEntry,
  dragging,
  svgRef,
  onMouseMove,
  onMouseUp,
  onTimelineClick,
  onToggleMainPeriod,
  onToggleBranchPeriod,
  onToggleBranch,
  onToggleEntry,
  onStartDragBranch
}: TimelineCanvasProps) {
  const { spineX } = LAYOUT_CONSTANTS;
  const infiniteHeight = 999999;
  const paddingOffset = 506;
  
  // Get the last position from the positions map to find where content ends
  const allPositions = Array.from(positions.values());
  const lastContentY = allPositions.length > 0 ? Math.max(...allPositions) : 0;
  
  // Add standard entry spacing (from Entry component, entries are 72px tall)
  const plusButtonY = lastContentY + 72 + 18; // +18 to align with dot position in entries

  return (
    <svg 
      ref={svgRef}
      width="100%" 
      height={infiniteHeight + paddingOffset}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{ 
        cursor: dragging ? 'grabbing' : 'default', 
        display: 'block', 
        minHeight: '100vh',
        marginTop: `-${paddingOffset}px`
      }}
    >
      {/* Main timeline spine */}
      <line
        x1={spineX}
        y1={0}
        x2={spineX}
        y2={infiniteHeight + paddingOffset}
        stroke="#e0e0e0"
        strokeWidth="2"
      />

      {/* Shift all content down by padding amount */}
      <g transform={`translate(0, ${paddingOffset})`}>
        {/* Main timeline periods */}
        {data.mainTimeline.map(period => {
          const periodY = positions.get(`period-${period.id}`);
          if (!periodY) return null;
          
          return (
            <MainTimelinePeriod
              key={period.id}
              period={period}
              periodY={periodY}
              spineX={spineX}
              positions={positions}
              expandedEntry={expandedEntry}
              onTogglePeriod={() => onToggleMainPeriod(period.id)}
              onToggleEntry={onToggleEntry}
            />
          );
        })}

        {/* Branch timelines */}
        {data.branches.map(branch => (
          <BranchTimeline
            key={branch.id}
            branch={branch}
            mainTimeline={data.mainTimeline}
            positions={positions}
            totalHeight={totalHeight}
            expandedEntry={expandedEntry}
            onStartDrag={() => onStartDragBranch(branch.id as number)}
            onToggleBranch={() => onToggleBranch(branch.id)}
            onTogglePeriod={(periodId) => onToggleBranchPeriod(branch.id, periodId)}
            onToggleEntry={onToggleEntry}
          />
        ))}

        {/* Plus button - positioned right after last entry */}
        <g 
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onTimelineClick(e as any); // Use existing handler
          }}
        >
          {/* Larger clickable area */}
          <circle
            cx={spineX}
            cy={plusButtonY}
            r="16"
            fill="transparent"
          />
          
          {/* Grey circle background */}
          <circle
            cx={spineX}
            cy={plusButtonY}
            r="8"
            fill="#d0d0d0"
            className="plus-button"
            style={{ pointerEvents: 'none' }}
          />
          
          {/* Plus icon */}
          <g transform={`translate(${spineX - 5}, ${plusButtonY - 5})`} style={{ pointerEvents: 'none' }}>
            <Plus size={10} color="#666666" strokeWidth={2.5} />
          </g>
        </g>
      </g>
    </svg>
  );
}