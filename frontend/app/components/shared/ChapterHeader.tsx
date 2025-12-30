// components/chapter/ChapterHeader.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Trash2, Plus } from 'lucide-react';

interface ChapterHeaderProps {
  periodId?: string | number;
  x: number;
  y: number;
  title: string;
  dateRange: string;
  startDate?: string;
  endDate?: string;
  entryCount?: number;
  collapsed: boolean;
  onToggle: () => void;
  onUpdateName?: (newName: string) => void;
  onDelete?: () => void;
  onDotClick?: () => void;
  onStartBranchDrag?: (periodId: string | number, x: number, y: number) => void;
  onAddEntry?: () => void;
  dotX?: number;
  color?: string;
  isUncategorized?: boolean;
}

export default function ChapterHeader({
  periodId,
  x,
  y,
  title,
  dateRange,
  startDate,
  endDate,
  entryCount,
  collapsed,
  onToggle,
  onUpdateName,
  onDelete,
  onDotClick,
  onStartBranchDrag,
  onAddEntry,
  dotX,
  color = '#000000',
  isUncategorized = false
}: ChapterHeaderProps) {
  const isMainTimeline = dotX !== undefined && x < (dotX - 100);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(title);
  const [showActions, setShowActions] = useState(false);
  const [mouseDownPos, setMouseDownPos] = useState<{x: number, y: number} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const [wrappedLines, setWrappedLines] = useState<string[]>([title]);

  const maxWidth = dotX ? dotX - x - 40 : 200;

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    setEditedName(title);
  }, [title]);

  useEffect(() => {
    if (!textRef.current || isEditingName || !title) return;

    const words = title.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    const tempText = textRef.current.cloneNode(true) as SVGTextElement;
    tempText.textContent = '';
    textRef.current.parentNode?.appendChild(tempText);

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      tempText.textContent = testLine;
      const testWidth = tempText.getComputedTextLength();

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    tempText.remove();
    setWrappedLines(lines.length > 0 ? lines : [title]);
  }, [title, maxWidth, isEditingName]);

  const handleNameClick = (e: React.MouseEvent) => {
    if (isUncategorized || !onUpdateName) return;
    e.stopPropagation();
    setIsEditingName(true);
  };

  const handleNameSubmit = () => {
    const trimmedName = editedName.trim();
    
    if (trimmedName && trimmedName !== title && onUpdateName) {
      onUpdateName(trimmedName);
    } else {
      setEditedName(title);
    }
    
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditedName(title);
      setIsEditingName(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      const message = entryCount && entryCount > 0
        ? `Are you sure you want to delete "${title}"?\n\nAll ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'} in this chapter will be permanently deleted and cannot be recovered.`
        : `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`;
      
      if (confirm(message)) {
        onDelete();
      }
    }
  };

  const handleAddEntry = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddEntry) {
      onAddEntry();
    }
  };

  const handleDotMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMouseDownPos({ x: e.clientX, y: e.clientY });
  };

  const handleDotMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (mouseDownPos) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - mouseDownPos.x, 2) + 
        Math.pow(e.clientY - mouseDownPos.y, 2)
      );
      
      if (distance < 5 && onDotClick) {
        onDotClick();
      } else if (distance >= 5 && onStartBranchDrag && periodId !== undefined && dotX !== undefined) {
        const sourceId = typeof periodId === 'string' ? periodId : `period-${periodId}`;
        onStartBranchDrag(sourceId, dotX, centerY);
      }
    }
    
    setMouseDownPos(null);
  };

  const lineHeight = 18;
  const totalHeight = wrappedLines.length * lineHeight;
  const centerY = y + (totalHeight / 2) + 5;

  // Format date range to show just year if same year, or range if different
  const formatDateRange = () => {
    if (!startDate || !endDate) return dateRange;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();
    
    if (startYear === endYear) {
      return `${startYear}`;
    } else {
      return `${startYear}-${endYear}`;
    }
  };

  return (
    <g
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <rect
        x={isMainTimeline ? x - 30 : x}
        y={y - 5}
        width={isMainTimeline ? maxWidth + 70 : 270}
        height={totalHeight + 30}
        fill="transparent"
        style={{ pointerEvents: 'all' }}
      />
      
      <rect
        x={x}
        y={y}
        width={24}
        height={24}
        fill="transparent"
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      />
      
      <g style={{ pointerEvents: 'none' }}>
        {collapsed ? 
          <ChevronRight 
            x={x + 4} 
            y={y + 2} 
            size={16} 
            color={color} 
            strokeWidth={2.5}
          /> : 
          <ChevronDown 
            x={x + 4} 
            y={y + 2} 
            size={16} 
            color={color} 
            strokeWidth={2.5}
          />
        }
      </g>

      {/* Plus icon - always visible when onAddEntry exists and not uncategorized */}
      {onAddEntry && !isUncategorized && (
        <g style={{ cursor: 'pointer' }} onClick={handleAddEntry}>
          <rect
            x={x}
            y={y + 20}
            width={24}
            height={24}
            fill="transparent"
          />
          <Plus 
            x={x + 4} 
            y={y + 22} 
            size={16} 
            color="#666666" 
            strokeWidth={2.5}
          />
        </g>
      )}

      {isEditingName ? (
        <foreignObject
          x={x + 32}
          y={y - 2}
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
            maxLength={36}
            style={{
              width: '100%',
              fontSize: '15px',
              fontWeight: '600',
              color: color,
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
          ref={textRef}
          x={x + 32}
          fontSize="15"
          fontWeight="600"
          fill={color}
          style={{ 
            cursor: onUpdateName && !isUncategorized ? 'text' : 'default', 
            pointerEvents: 'all' 
          }}
          onClick={handleNameClick}
        >
          {wrappedLines.map((line, index) => (
            <tspan
              key={index}
              x={x + 32}
              y={y + 15 + (index * lineHeight)}
            >
              {line}
            </tspan>
          ))}
        </text>
      )}

      {showActions && !isEditingName && onDelete && !isUncategorized && (
        <g
          style={{ cursor: 'pointer' }}
          onClick={handleDelete}
        >
          {isMainTimeline ? (
            <>
              <circle
                cx={x - 15}
                cy={y + 10}
                r="10"
                fill="#fee"
                stroke="#fcc"
                strokeWidth="1"
              />
              <Trash2
                x={x - 20}
                y={y + 5}
                size={10}
                color="#e11d48"
                strokeWidth={2}
              />
            </>
          ) : (
            <>
              <circle
                cx={x + (wrappedLines[0].length * 7) + 85}
                cy={y + 10}
                r="10"
                fill="#fee"
                stroke="#fcc"
                strokeWidth="1"
              />
              <Trash2
                x={x + (wrappedLines[0].length * 7) + 80}
                y={y + 5}
                size={10}
                color="#e11d48"
                strokeWidth={2}
              />
            </>
          )}
        </g>
      )}

      <text
        x={x + 32}
        y={y + totalHeight + 17}
        fontSize="11"
        fill="#666666"
        style={{ pointerEvents: 'none' }}
      >
        {formatDateRange()}
        {entryCount !== undefined && ` • ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}`}
      </text>

      {dotX !== undefined && (onDotClick || onStartBranchDrag) && periodId !== undefined && (
        <>
          <circle
            cx={dotX}
            cy={centerY}
            r="2.5"
            fill="#666666"
            opacity="0.4"
            style={{ pointerEvents: 'none' }}
          />

          <circle
            cx={dotX}
            cy={centerY}
            r="10"
            fill="transparent"
            style={{
              cursor: 'grab',
              pointerEvents: 'all'
            }}
            onMouseDown={handleDotMouseDown}
            onMouseUp={handleDotMouseUp}
            onMouseEnter={(e) => {
              const nextSibling = e.currentTarget.nextElementSibling as SVGCircleElement | null;
              nextSibling?.setAttribute('opacity', '1');
            }}
            onMouseLeave={(e) => {
              const nextSibling = e.currentTarget.nextElementSibling as SVGCircleElement | null;
              nextSibling?.setAttribute('opacity', '0');
            }}
          />

          <circle
            cx={dotX}
            cy={centerY}
            r="7"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
            opacity="0"
            style={{ pointerEvents: 'none', transition: 'opacity 0.2s' }}
          />
        </>
      )}
    </g>
  );
}