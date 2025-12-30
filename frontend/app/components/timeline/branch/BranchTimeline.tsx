// components/branch/BranchTimeline.tsx
import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, ChevronRight, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { TimelineBranch, TimelinePeriod, DragState } from '../../types/timeline.types';
import BranchPeriod from './Period';
import { calculateBranchPositions, LAYOUT_CONSTANTS } from '../../utils/layoutCalculations';
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
  onUpdateChapterDates?: (chapterId: number, startDate: string, endDate: string) => void;
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
  onUpdateChapterDates,
  onDeleteChapter,
  onCreateChapter
}: BranchTimelineProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(branch.name);
  const [showActions, setShowActions] = useState(false);
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Calculate all branch positions from the centralized function
  const branchPositions = calculateBranchPositions(branch, mainTimeline, positions);
  const branchSourcePos = branchPositions.get(`branch-${branch.id}-source`);

  // Always use the first period's position if it exists, otherwise use source
  const firstPeriodPos = branch.periods.length > 0 
    ? branchPositions.get(`branch-${branch.id}-period-${branch.periods[0].id}`)
    : null;

  const branchStartY = branchSourcePos?.dotY || LAYOUT_CONSTANTS.startY;

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    setEditedName(branch.name);
  }, [branch.name]);
  
  const hasContent = branch.periods && branch.periods.length > 0;

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
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);
    
    try {
      await onCreateChapter({
        title: title,
        start_date: startOfYear.toISOString().split('T')[0],
        end_date: endOfYear.toISOString().split('T')[0],
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

  // Calculate plus button Y from branchPositions instead of manually
  const getPlusButtonY = (): number => {
    if (!hasContent || branch.periods.length === 0) {
      return branchStartY + 20;
    }
    
    // Get the last period's position
    const lastPeriod = branch.periods[branch.periods.length - 1];
    const lastPeriodPos = branchPositions.get(`branch-${branch.id}-period-${lastPeriod.id}`);
    
    if (!lastPeriodPos) {
      return branchStartY + 20;
    }
    
    let lastY = lastPeriodPos.y + LAYOUT_CONSTANTS.periodHeaderHeight;
    
    // Add entries if not collapsed
    if (!lastPeriod.collapsed && lastPeriod.entries.length > 0) {
      const lastEntry = lastPeriod.entries[lastPeriod.entries.length - 1];
      const lastEntryPos = branchPositions.get(`branch-${branch.id}-entry-${lastEntry.id}`);
      if (lastEntryPos) {
        lastY = lastEntryPos.y + LAYOUT_CONSTANTS.entryHeight;
      }
    }
    
    return lastY + 18;
  };

  const plusButtonY = getPlusButtonY();

  return (
    <g>
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
        y2={plusButtonY - 10}
        stroke={branch.color}
        strokeWidth="2"
        opacity="0.12"
      />

      {/* Branch name header with hover */}
      <g       
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
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
              x={branch.x + 16} 
              y={branchStartY - 42} 
              size={16} 
              color={branch.color} 
              strokeWidth={2.5} 
            /> : 
            <ChevronDown 
              x={branch.x + 16} 
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
            x={branch.x + 37}
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
        )}
      </g>

      {/* Periods - using calculated positions */}
      {!branch.collapsed && hasContent && branch.periods.map((period) => {
        // Check if main period is collapsed
        const mainPeriod = mainTimeline.find(p => 
          p.startDate <= period.startDate && 
          (!p.endDate || p.endDate >= period.startDate)
        );
        
        if (mainPeriod?.collapsed) return null;
        
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
            onUpdateChapterDates={onUpdateChapterDates}
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
    </g>
  );
}