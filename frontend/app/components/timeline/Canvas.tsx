// components/Canvas.tsx - COMPLETE REWRITE
import React from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { TimelineData, DragState, TimelinePeriod } from '../types/timeline.types';
import { LAYOUT_CONSTANTS, calculatePlusButtonY } from '../utils/layoutCalculations';
import MainTimelinePeriod from './main/Period';
import BranchTimeline from './branch/BranchTimeline';
import AddButton from '../shared/AddButton';
import InlineChapterCreator from './ChapterCreator';

interface TimelineCanvasProps {
  data: TimelineData;
  positions: Map<string, number>;
  totalHeight: number;
  expandedEntry: string | number | null;
  dragState: DragState;
  svgRef: React.RefObject<SVGSVGElement>;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onTimelineClick: (e: React.MouseEvent<SVGSVGElement>) => void;
  onToggleMainPeriod: (periodId: string | number) => void;
  onToggleBranchPeriod: (branchId: string | number, periodId: string | number) => void;
  onToggleBranch: (branchId: string | number) => void;
  onToggleEntry: (entryId: string | number) => void;
  onStartDragBranch: (branchId: number, offsetX: number) => void;
  onStartBranchCreation: (entryId: string | number, x: number, y: number) => void;
  onUpdateBranchName?: (branchId: number, newName: string) => void;
  onDeleteBranch?: (branchId: number) => void;
  onUpdateChapterName?: (chapterId: number, newName: string) => void;
  onDeleteChapter?: (chapterId: number) => void;
  onAddBranchEntry?: (branchId: number, y: number) => void;
  onCreateChapter?: (chapterData: any) => Promise<void>;
  onCreateEntryInChapter?: (chapterId: number) => void; 
}

export default function TimelineCanvas({
  data,
  positions,
  totalHeight,
  expandedEntry,
  dragState,
  svgRef,
  onMouseMove,
  onMouseUp,
  onTimelineClick,
  onToggleMainPeriod,
  onToggleBranchPeriod,
  onToggleBranch,
  onToggleEntry,
  onStartDragBranch,
  onStartBranchCreation,
  onUpdateBranchName,
  onDeleteBranch,
  onUpdateChapterName,
  onDeleteChapter,
  onAddBranchEntry,
  onCreateChapter,
  onCreateEntryInChapter 
}: TimelineCanvasProps) {
  const { spineX } = LAYOUT_CONSTANTS;
  const infiniteHeight = 999999;
  const paddingOffset = 506;
  
  const allPositions = Array.from(positions.values());
  const lastContentY = allPositions.length > 0 ? Math.max(...allPositions) : 0;
  const plusButtonY = calculatePlusButtonY(positions);

  const [showMenu, setShowMenu] = React.useState(false);
  const [isCreatingChapter, setIsCreatingChapter] = React.useState(false);

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMenuSelect = (type: 'entry' | 'chapter') => {
    setShowMenu(false);
    if (type === 'entry') {
      onTimelineClick({ clientX: spineX, clientY: plusButtonY } as any);
    } else {
      setIsCreatingChapter(true);
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
        collapsed: false
      });
      
      setIsCreatingChapter(false);
    } catch (error) {
      console.error('Error creating chapter:', error);
    }
  };

  const handleCancelChapter = () => {
    setIsCreatingChapter(false);
  };

  return (
    <svg 
      ref={svgRef}
      width="100%" 
      height={infiniteHeight + paddingOffset}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClick={(e) => {
        if (!isCreatingChapter) {
          setShowMenu(false);
        }
      }}
      style={{ 
        cursor: dragState.type === 'branch' ? 'grabbing' : dragState.type === 'creating-branch' ? 'crosshair' : 'default',
        display: 'block', 
        minHeight: '100vh',
        marginTop: `-${paddingOffset}px`
      }}
    >
      <line
        x1={spineX}
        y1={0}
        x2={spineX}
        y2={infiniteHeight + paddingOffset}
        stroke="#e0e0e0"
        strokeWidth="2"
      />

      <g transform={`translate(0, ${paddingOffset})`}>
        {dragState.type === 'creating-branch' && dragState.startX && dragState.startY && dragState.currentX && dragState.currentY && (
          <g>
            <line
              x1={dragState.startX}
              y1={dragState.startY}
              x2={dragState.currentX}
              y2={dragState.startY}
              stroke="#3b82f6"
              strokeWidth="2"
              opacity="0.4"
              strokeDasharray="4 4"
              style={{ pointerEvents: 'none' }}
            />
            <circle
              cx={dragState.currentX}
              cy={dragState.startY}
              r="4"
              fill="#3b82f6"
              opacity="0.6"
              style={{ pointerEvents: 'none' }}
            />
          </g>
        )}

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
              dragState={dragState}
              onTogglePeriod={() => onToggleMainPeriod(period.id)}
              onToggleEntry={onToggleEntry}
              onStartBranchDrag={onStartBranchCreation}
              onUpdateChapterName={onUpdateChapterName}
              onDeleteChapter={onDeleteChapter}
              onCreateEntryInChapter={onCreateEntryInChapter}
            />
          );
        })}

        {/* Inline Chapter Creator */}
        {isCreatingChapter && (
          <InlineChapterCreator
            x={80}
            y={plusButtonY +0}
            onSave={handleSaveChapter}
            onCancel={handleCancelChapter}
          />
        )}

        {data.branches.map(branch => (
          <BranchTimeline
            key={branch.id}
            branch={branch}
            mainTimeline={data.mainTimeline}
            positions={positions}
            totalHeight={totalHeight}
            expandedEntry={expandedEntry}
            dragState={dragState}
            onStartDrag={onStartDragBranch}
            onToggleBranch={() => onToggleBranch(branch.id)}
            onTogglePeriod={(periodId) => onToggleBranchPeriod(branch.id, periodId)}
            onToggleEntry={onToggleEntry}
            onStartBranchDrag={onStartBranchCreation}
            onUpdateBranchName={onUpdateBranchName}
            onDeleteBranch={onDeleteBranch}
            onUpdateChapterName={onUpdateChapterName}
            onDeleteChapter={onDeleteChapter}
            onAddBranchEntry={onAddBranchEntry}
            onCreateChapter={onCreateChapter}
          />
        ))}

        {!isCreatingChapter && (
          <AddButton
            x={spineX}
            y={plusButtonY}
            onAddEntry={() => handleMenuSelect('entry')}
            onAddChapter={() => handleMenuSelect('chapter')}
          />
        )}
                
        {showMenu && !isCreatingChapter && (
          <g transform={`translate(${spineX + 20}, ${plusButtonY - 30})`}>
            <rect
              width="100"
              height="60"
              fill="white"
              stroke="#d0d0d0"
              strokeWidth="1"
              rx="6"
              filter="drop-shadow(0 2px 8px rgba(0,0,0,0.1))"
            />
            <rect
              y="0"
              width="100"
              height="30"
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                handleMenuSelect('entry');
              }}
              onMouseEnter={(e) => e.currentTarget.setAttribute('fill', '#f5f5f5')}
              onMouseLeave={(e) => e.currentTarget.setAttribute('fill', 'transparent')}
            />
            <text
              x="10"
              y="18"
              fontSize="11"
              fontWeight="500"
              fill="#333"
              style={{ pointerEvents: 'none' }}
            >
              + Entry
            </text>
            <line
              x1="10"
              y1="30"
              x2="90"
              y2="30"
              stroke="#e5e5e5"
              strokeWidth="1"
            />
            <rect
              y="30"
              width="100"
              height="30"
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                handleMenuSelect('chapter');
              }}
              onMouseEnter={(e) => e.currentTarget.setAttribute('fill', '#f5f5f5')}
              onMouseLeave={(e) => e.currentTarget.setAttribute('fill', 'transparent')}
            />
            <text
              x="10"
              y="48"
              fontSize="11"
              fontWeight="500"
              fill="#333"
              style={{ pointerEvents: 'none' }}
            >
              + Chapter
            </text>
          </g>
        )}
      </g>

      <style>
        {`
          .plus-button:hover {
            fill: #e0e0e0 !important;
            stroke: #b0b0b0 !important;
          }
        `}
      </style>
    </svg>
  );
}