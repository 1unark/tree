import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';

interface AddButtonProps {
  x: number;
  y: number;
  onAddEntry: () => void;
  onAddChapter: () => void;
  hasChapters?: boolean; // Add this prop
}

export default function AddButton({ x, y, onAddEntry, onAddChapter, hasChapters = true }: AddButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    // Add a small delay to prevent immediate closure from the same click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMenuSelect = (type: 'entry' | 'chapter') => {
    if (type === 'entry' && !hasChapters) return; // Prevent selection if no chapters
    
    setShowMenu(false);
    if (type === 'entry') {
      onAddEntry();
    } else {
      onAddChapter();
    }
  };

  return (
    <g ref={menuRef}>
      <g style={{ cursor: 'pointer' }} onClick={handlePlusClick}>
        <circle cx={x} cy={y} r="16" fill="transparent" />
        
        <circle
          cx={x}
          cy={y}
          r="10"
          fill="#f0f0f0"
          stroke="#d0d0d0"
          strokeWidth="1"
          className="plus-button"
        />
        
        <g transform={`translate(${x - 5}, ${y - 5})`} style={{ pointerEvents: 'none' }}>
          <Plus size={10} color="#666666" strokeWidth={3} />
        </g>
      </g>

      {showMenu && (
        <g transform={`translate(${x + 20}, ${y - 30})`}>
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
            style={{ cursor: hasChapters ? 'pointer' : 'not-allowed' }}
            onClick={(e) => {
              e.stopPropagation();
              handleMenuSelect('entry');
            }}
            onMouseEnter={(e) => hasChapters && e.currentTarget.setAttribute('fill', '#f5f5f5')}
            onMouseLeave={(e) => e.currentTarget.setAttribute('fill', 'transparent')}
          />
          <text
            x="10"
            y="18"
            fontSize="11"
            fontWeight="500"
            fill={hasChapters ? "#333" : "#999"}
            style={{ pointerEvents: 'none' }}
          >
            + Entry
          </text>
          {!hasChapters && (
            <text
              x="70"
              y="18"
              fontSize="9"
              fill="#999"
              style={{ pointerEvents: 'none' }}
            >
              *
            </text>
          )}
          <line x1="10" y1="30" x2="90" y2="30" stroke="#e5e5e5" strokeWidth="1" />
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
  );
}