// components/branch/BranchTimeline.tsx - Add this to the component
import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, ChevronRight, ChevronDown, Plus, Edit2, Trash2 } from 'lucide-react';
import { TimelineBranch, TimelinePeriod, DragState } from '../../types/timeline.types';
import BranchPeriod from './Period';
import { findMainPeriodForDate } from '../../utils/timelineHelpers';
import { LAYOUT_CONSTANTS } from '../../utils/layoutCalculations';

interface BranchTimelineProps {
  branch: TimelineBranch;
  mainTimeline: TimelinePeriod[];
  positions: Map<string, number>;
  totalHeight: number;
  expandedEntry: string | number | null;
  dragState: DragState;
  onStartDrag: (branchId: number, offsetX: number) => void;
  onToggleBranch: () => void;
  onTogglePeriod: (periodId: string | number) => void;
  onToggleEntry: (entryId: string | number) => void;
  onStartBranchDrag: (entryId: string | number, x: number, y: number) => void;
  onUpdateBranchName?: (branchId: number, newName: string) => void;
  onDeleteBranch?: (branchId: number) => void;
  onAddBranchEntry?: (branchId: number, y: number) => void;
  onUpdateChapterName?: (chapterId: number, newName: string) => void;
  onDeleteChapter?: (chapterId: number) => void;
}

export default function BranchTimeline({
  branch,
  mainTimeline,
  positions,
  totalHeight,
  expandedEntry,
  dragState,
  onStartDrag,
  onToggleBranch,
  onTogglePeriod,
  onToggleEntry,
  onStartBranchDrag,
  onUpdateBranchName,
  onDeleteBranch,
  onAddBranchEntry,
  onUpdateChapterName,
  onDeleteChapter
}: BranchTimelineProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(branch.name);
  const [showActions, setShowActions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    setEditedName(branch.name);
  }, [branch.name]);
  
  if (!branch.periods || branch.periods.length === 0) return null;
  
  const firstPeriod = branch.periods[0];
  const matchingMainPeriod = findMainPeriodForDate(mainTimeline, firstPeriod.startDate);
  const branchStartY = matchingMainPeriod 
    ? (positions.get(`period-${matchingMainPeriod.id}`) ?? LAYOUT_CONSTANTS.startY)
    : LAYOUT_CONSTANTS.startY;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditingName) return;
    e.stopPropagation();
    e.preventDefault();
    
    const svg = (e.target as SVGElement).ownerSVGElement;
    if (!svg) return;
    
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    const offsetX = svgP.x - branch.x;
    
    onStartDrag(branch.id as number, offsetX);
  };

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditingName) {
      setIsEditingName(true);
    }
  };

  const handleNameSubmit = () => {
    const trimmedName = editedName.trim();
    
    if (trimmedName && trimmedName !== branch.name && onUpdateBranchName) {
      onUpdateBranchName(branch.id as number, trimmedName);
    } else {
      setEditedName(branch.name);
    }
    
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditedName(branch.name);
      setIsEditingName(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteBranch && typeof branch.id === 'number') {
      if (confirm(`Delete branch "${branch.name}"?`)) {
        onDeleteBranch(branch.id);
      }
    }
  };

  let maxEntryY = branchStartY;
  
  branch.periods.forEach((period, periodIndex) => {
    const matchingMainPeriod = findMainPeriodForDate(mainTimeline, period.startDate);
    const mainPeriodCollapsed = matchingMainPeriod?.collapsed ?? false;
    
    if (!mainPeriodCollapsed && !branch.collapsed) {
      const mainPeriodY = matchingMainPeriod 
        ? positions.get(`period-${matchingMainPeriod.id}`)
        : LAYOUT_CONSTANTS.startY;
      
      if (mainPeriodY !== undefined) {
        let offset = 0;
        for (let i = 0; i < periodIndex; i++) {
          const prevPeriod = branch.periods[i];
          const prevMainPeriod = findMainPeriodForDate(mainTimeline, prevPeriod.startDate);
          
          if (prevMainPeriod?.id === matchingMainPeriod.id && !prevPeriod.collapsed) {
            offset += LAYOUT_CONSTANTS.periodHeaderHeight;
            offset += prevPeriod.entries.length * LAYOUT_CONSTANTS.entryHeight;
          } else if (prevMainPeriod?.id === matchingMainPeriod.id) {
            offset += LAYOUT_CONSTANTS.periodHeaderHeight;
          }
        }
        
        if (!period.collapsed && period.entries && period.entries.length > 0) {
          const lastEntryIndex = period.entries.length - 1;
          const entryY = mainPeriodY + offset + LAYOUT_CONSTANTS.periodHeaderHeight + (lastEntryIndex * LAYOUT_CONSTANTS.entryHeight);
          
          if (entryY > maxEntryY) {
            maxEntryY = entryY;
          }
        }
      }
    }
  });
  
  const plusButtonY = maxEntryY + 72 + 18;

  return (
    <g
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
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
        style={{ cursor: isEditingName ? 'default' : 'grab' }}
        onMouseDown={!isEditingName ? handleMouseDown : undefined}
      />
      
      <g
        onMouseDown={!isEditingName ? handleMouseDown : undefined}
        style={{ 
          cursor: isEditingName ? 'default' : 'grab', 
          pointerEvents: isEditingName ? 'none' : 'auto' 
        }}
      >
        <GripVertical 
          x={branch.x - 90} 
          y={branchStartY - 41} 
          size={14} 
          color={branch.color} 
          opacity={0.5} 
        />
      </g>
      
      <rect
        x={branch.x - 65}
        y={branchStartY - 43}
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
          <ChevronRight 
            x={branch.x - 61} 
            y={branchStartY - 42} 
            size={16} 
            color={branch.color} 
            strokeWidth={2.5} 
          /> : 
          <ChevronDown 
            x={branch.x - 61} 
            y={branchStartY - 42} 
            size={16} 
            color={branch.color} 
            strokeWidth={2.5} 
          />
        }
      </g>

      {isEditingName ? (
        <foreignObject
          x={branch.x - 38}
          y={branchStartY - 43}
          width="130"
          height="26"
        >
          <input
            ref={inputRef}
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            maxLength={30}
            style={{
              width: '100%',
              fontSize: '13px',
              fontWeight: '600',
              color: branch.color,
              letterSpacing: '-0.01em',
              border: `1.5px solid ${branch.color}`,
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
          x={branch.x - 38}
          y={branchStartY - 30}
          fontSize="13"
          fontWeight="600"
          fill={branch.color}
          letterSpacing="-0.01em"
          style={{ cursor: 'text', pointerEvents: 'all' }}
          onClick={handleNameClick}
        >
          {branch.name}
        </text>
      )}

      {/* Edit and Delete icons on hover */}
      {showActions && !isEditingName && (
        <>
          <g
            style={{ cursor: 'pointer' }}
            onClick={handleNameClick}
          >
            <circle
              cx={branch.x + 65}
              cy={branchStartY - 35}
              r="10"
              fill="#f0f0f0"
              stroke="#d0d0d0"
              strokeWidth="1"
            />
            <Edit2
              x={branch.x + 60}
              y={branchStartY - 40}
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
              cx={branch.x + 85}
              cy={branchStartY - 35}
              r="10"
              fill="#fee"
              stroke="#fcc"
              strokeWidth="1"
            />
            <Trash2
              x={branch.x + 80}
              y={branchStartY - 40}
              size={10}
              color="#e11d48"
              strokeWidth={2}
            />
          </g>
        </>
      )}

      {!branch.collapsed && branch.periods.map((period) => {
        const matchingMainPeriod = findMainPeriodForDate(mainTimeline, period.startDate);
        const mainPeriodCollapsed = matchingMainPeriod?.collapsed ?? false;
        
        if (mainPeriodCollapsed) return null;
        
        return (
          <BranchPeriod
            key={`branch-${branch.id}-period-${period.id}`}
            period={period}
            branch={branch}
            mainTimeline={mainTimeline}
            positions={positions}
            expandedEntry={expandedEntry}
            dragState={dragState}
            onTogglePeriod={() => onTogglePeriod(period.id)}
            onToggleEntry={onToggleEntry}
            onStartBranchDrag={onStartBranchDrag}
            onUpdateChapterName={onUpdateChapterName}
            onDeleteChapter={onDeleteChapter}
          />
        );
      })}

      {!branch.collapsed && onAddBranchEntry && (
        <g 
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onAddBranchEntry(branch.id as number, plusButtonY);
          }}
        >
          <circle
            cx={branch.x}
            cy={plusButtonY}
            r="16"
            fill="transparent"
          />
          
          <circle
            cx={branch.x}
            cy={plusButtonY}
            r="10"
            fill="#f0f0f0"
            stroke="#d0d0d0"
            strokeWidth="1"
            className="plus-button"
          />
          
          <g 
            transform={`translate(${branch.x - 5}, ${plusButtonY - 5})`} 
            style={{ pointerEvents: 'none' }}
          >
            <Plus size={10} color="#666666" strokeWidth={3} />
          </g>
        </g>
      )}

      <style>
        {`
          .plus-button:hover {
            fill: #e0e0e0 !important;
            stroke: #b0b0b0 !important;
          }
        `}
      </style>
    </g>
  );
}