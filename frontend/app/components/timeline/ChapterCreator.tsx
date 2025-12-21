// components/InlineChapterCreator.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

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
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
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
      x={x - 120}
      y={y}
      width="240"
      height="50"
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{
        background: 'white',
        border: '1.5px solid #3b82f6',
        borderRadius: '8px',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Chapter name..."
          maxLength={50}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '13px',
            fontWeight: '500',
            color: '#1a1a1a',
            background: 'transparent'
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            background: '#3b82f6',
            border: 'none',
            borderRadius: '4px',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <Check size={14} color="white" strokeWidth={3} />
        </button>
        <button
          onClick={onCancel}
          style={{
            background: '#f5f5f5',
            border: 'none',
            borderRadius: '4px',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <X size={14} color="#666" strokeWidth={3} />
        </button>
      </div>
    </foreignObject>
  );
}