// components/InlineChapterCreator.tsx
import React, { useState, useRef, useEffect } from 'react';

interface InlineChapterCreatorProps {
  x: number;
  y: number;
  onSave: (title: string) => void;
  onCancel: () => void;
}

export default function InlineChapterCreator({
  x,
  y,
  onSave,
  onCancel
}: InlineChapterCreatorProps) {
  const [title, setTitle] = useState('New Chapter');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = () => {
    if (title.trim()) {
      onSave(title.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <foreignObject
      x={x}
      y={y}
      width="230"
      height="30"
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="New Chapter"
          maxLength={50}
          style={{
            flex: 1,
            border: '1px solid #e0e0e0',
            outline: 'none',
            fontSize: '13px',
            fontWeight: '600',
            padding: '4px 6px',
            background: 'white',
            fontFamily: 'inherit',
            borderRadius: '3px',
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '3px',
            border: 'none',
            background: '#6b7280',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            flexShrink: 0
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <polyline
              points="3,8 6,11 13,4"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </foreignObject>
  );
}