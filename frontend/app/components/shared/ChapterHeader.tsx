import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Edit2, Trash2 } from 'lucide-react';

interface ChapterHeaderProps {
  x: number;
  y: number;
  title: string;
  dateRange: string;
  entryCount?: number;
  collapsed: boolean;
  onToggle: () => void;
  onUpdateName?: (newName: string) => void;
  onDelete?: () => void;
  onDotClick?: () => void;
  dotX?: number;
  color?: string;
  isUncategorized?: boolean;
}

export default function ChapterHeader({
  x,
  y,
  title,
  dateRange,
  entryCount,
  collapsed,
  onToggle,
  onUpdateName,
  onDelete,
  onDotClick,
  dotX,
  color = '#000000',
  isUncategorized = false
}: ChapterHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(title);
  const [showActions, setShowActions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const [wrappedLines, setWrappedLines] = useState<string[]>([title]);

  // Maximum width before wrapping (distance from x to dotX minus some padding)
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

  // Text wrapping logic
  useEffect(() => {
    if (!textRef.current || isEditingName) return;

    const words = title.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    // Create a temporary text element to measure width
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
      if (confirm(`Delete chapter "${title}"?`)) {
        onDelete();
      }
    }
  };

  const lineHeight = 18;
  const totalHeight = wrappedLines.length * lineHeight;

  return (
    <g
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Collapse/Expand chevron */}
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

      {/* Chapter title - editable with wrapping */}
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
            maxLength={40}
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

      {/* Edit and Delete icons */}
      {showActions && !isEditingName && onUpdateName && onDelete && !isUncategorized && (
        <>
          <g
            style={{ cursor: 'pointer' }}
            onClick={handleNameClick}
          >
            <circle
              cx={x + 232}
              cy={y + 10}
              r="10"
              fill="#f0f0f0"
              stroke="#d0d0d0"
              strokeWidth="1"
            />
            <Edit2
              x={x + 227}
              y={y + 5}
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
              cx={x + 252}
              cy={y + 10}
              r="10"
              fill="#fee"
              stroke="#fcc"
              strokeWidth="1"
            />
            <Trash2
              x={x + 247}
              y={y + 5}
              size={10}
              color="#e11d48"
              strokeWidth={2}
            />
          </g>
        </>
      )}

      {/* Date range and entry count */}
      <text
        x={x + 32}
        y={y + totalHeight + 17}
        fontSize="11"
        fill="#666666"
        style={{ pointerEvents: 'none' }}
      >
        {dateRange}
        {entryCount !== undefined && ` • ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}`}
      </text>

      {/* Dot for creating entries (optional) */}
      {dotX !== undefined && onDotClick && (
        <circle
          cx={dotX}
          cy={y + (totalHeight / 2) + 5}
          r="4"
          fill="#d0d0d0"
          style={{ 
            cursor: 'pointer',
            pointerEvents: 'all'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDotClick();
          }}
        />
      )}
    </g>
  );
}