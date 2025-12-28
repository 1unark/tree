// components/branch/BranchTimeline.tsx
import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, ChevronRight, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import ChapterHeader from '../../shared/ChapterHeader';
import { TimelineBranch, TimelinePeriod, DragState } from '../../types/timeline.types';
import BranchPeriod from './Period';
import { findMainPeriodForDate } from '../../utils/timelineHelpers';
import { LAYOUT_CONSTANTS } from '../../utils/layoutCalculations';
import AddButton from '@/components/shared/AddButton';
import InlineChapterCreator from '../ChapterCreator';

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
  onCreateChapter?: (chapterData: any) => Promise<void>;
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
  onDeleteChapter,
  onCreateChapter
}: BranchTimelineProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(branch.name);
  const [showActions, setShowActions] = useState(false);
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
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
  
  // Allow rendering even with empty periods - the branch can still be created
  const hasContent = branch.periods && branch.periods.length > 0;
  
  // Calculate branchStartY based on the actual source
  const getBranchStartY = (): number => {
    if (branch.sourceEntryId) {
      if (typeof branch.sourceEntryId === 'string' && branch.sourceEntryId.startsWith('period-')) {
        const periodId = branch.sourceEntryId.replace('period-', '');
        const periodY = positions.get(`period-${periodId}`);
        if (periodY !== undefined) {
          return periodY + 8;
        }
      } else {
        for (const period of mainTimeline) {
          const entry = period.entries.find(e => e.id === branch.sourceEntryId);
          if (entry) {
            const entryY = positions.get(`entry-${entry.id}`);
            if (entryY !== undefined) {
              return entryY + 18;
            }
          }
        }
      }
    }
    
    // Use branch start_date or first period if available
    if (hasContent && branch.periods.length > 0) {
      const firstPeriod = branch.periods[0];
      const matchingMainPeriod = findMainPeriodForDate(mainTimeline, firstPeriod.startDate);
      return matchingMainPeriod 
        ? (positions.get(`period-${matchingMainPeriod.id}`) ?? LAYOUT_CONSTANTS.startY)
        : LAYOUT_CONSTANTS.startY;
    }
    
    return LAYOUT_CONSTANTS.startY;
  };

  const branchStartY = getBranchStartY();

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

  const handleSaveChapter = async (title: string) => {
    if (!onCreateChapter) return;
    
    const today = new Date();
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    
    try {
      await onCreateChapter({
        title: title,
        start_date: today.toISOString().split('T')[0],
        end_date: nextYear.toISOString().split('T')[0],
        collapsed: false,
        branch_id: branch.id
      });
      
      setIsCreatingChapter(false);
    } catch (error) {
      console.error('Error creating chapter in branch:', error);
    }
  };

  const handleCancelChapter = () => {
    setIsCreatingChapter(false);
  };

  // Calculate plus button Y position
  const getPlusButtonY = (): number => {
    if (!hasContent) {
      // Empty branch - plus button right after header
      return branchStartY + 20;
    }
    
    let currentY = branchStartY;
    
    branch.periods.forEach((period) => {
      // Add period header height
      currentY += LAYOUT_CONSTANTS.periodHeaderHeight;
      
      // Add entries height if not collapsed
      if (!period.collapsed && period.entries.length > 0) {
        currentY += period.entries.length * LAYOUT_CONSTANTS.entryHeight;
      }
    });
    
    return currentY + 18;
  };

  const plusButtonY = getPlusButtonY();

  return (
    <g
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Connection line from source to branch */}
      <line
        x1={LAYOUT_CONSTANTS.spineX}
        y1={branchStartY}
        x2={branch.x - 20}
        y2={branchStartY}
        stroke={branch.color}
        strokeWidth="2"
        opacity="0.3"
        strokeDasharray="4 4"
      />

      {/* Vertical branch line */}
      <line
        x1={branch.x}
        y1={branchStartY - 53}
        x2={branch.x}
        y2={plusButtonY - 10}  // Stop before the plus button
        stroke={branch.color}
        strokeWidth="2"
        opacity="0.12"
      />

      {/* Branch name header */}
      <rect
        x={branch.x - 10}
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
          x={branch.x} 
          y={branchStartY - 41} 
          size={14} 
          color={branch.color} 
          opacity={0.5} 
        />
      </g>
      
      {/* Collapse/expand button */}
      <rect
        x={branch.x + 25}
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
            x={branch.x + 29} 
            y={branchStartY - 42} 
            size={16} 
            color={branch.color} 
            strokeWidth={2.5} 
          /> : 
          <ChevronDown 
            x={branch.x + 29} 
            y={branchStartY - 42} 
            size={16} 
            color={branch.color} 
            strokeWidth={2.5} 
          />
        }
      </g>

      {/* Branch name text */}
      {isEditingName ? (
        <foreignObject
          x={branch.x + 52}
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
          x={branch.x + 52}
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
              cx={branch.x + 155}
              cy={branchStartY - 35}
              r="10"
              fill="#f0f0f0"
              stroke="#d0d0d0"
              strokeWidth="1"
            />
            <Edit2
              x={branch.x + 150}
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
              cx={branch.x + 175}
              cy={branchStartY - 35}
              r="10"
              fill="#fee"
              stroke="#fcc"
              strokeWidth="1"
            />
            <Trash2
              x={branch.x + 170}
              y={branchStartY - 40}
              size={10}
              color="#e11d48"
              strokeWidth={2}
            />
          </g>
        </>
      )}

      {/* Periods */}
      {!branch.collapsed && hasContent && branch.periods.map((period) => {
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

      {/* Inline Chapter Creator */}
      {isCreatingChapter && (
        <InlineChapterCreator
          x={branch.x - 40}
          y={plusButtonY + 5}
          onSave={handleSaveChapter}
          onCancel={handleCancelChapter}
        />
      )}

      {/* Add entry button */}
      {!branch.collapsed && !isCreatingChapter && (
        <AddButton
          x={branch.x}
          y={plusButtonY}
          onAddEntry={() => {
            if (onAddBranchEntry) {
              onAddBranchEntry(branch.id as number, plusButtonY);
            }
          }}
          onAddChapter={() => {
            setIsCreatingChapter(true);
          }}
        />
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