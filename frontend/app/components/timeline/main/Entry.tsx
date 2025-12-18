import React from 'react';

interface MainEntryProps {
  entry: {
    id: string | number;
    title: string;
    date: Date;
    preview: string;
  };
  entryY: number;
  spineX: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function Entry({
  entry,
  entryY,
  spineX,
  isExpanded,
  onToggleExpand
}: MainEntryProps) {
  return (
    <g>
      <circle cx={spineX} cy={entryY + 18} r="3" fill="#cccccc" />
      
      <rect
        x={60}
        y={entryY + 8}
        width={260}
        height={64}
        fill={isExpanded ? '#fafafa' : 'transparent'}
        stroke="transparent"
        strokeWidth="1"
        rx="8"
        style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
        onClick={onToggleExpand}
        onMouseOver={(e) => {
          if (!isExpanded) e.currentTarget.setAttribute('fill', '#fafafa');
        }}
        onMouseOut={(e) => {
          if (!isExpanded) e.currentTarget.setAttribute('fill', 'transparent');
        }}
      />
      
      <text
        x={80}
        y={entryY + 28}
        fontSize="13"
        fontWeight="600"
        fill="#000000"
        letterSpacing="-0.01em"
        style={{ pointerEvents: 'none' }}
      >
        {entry.title}
      </text>
      
      <text
        x={80}
        y={entryY + 44}
        fontSize="11"
        fill="#6b6b6b"
        fontWeight="500"
        style={{ pointerEvents: 'none' }}
      >
        {entry.date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric' 
        })}
      </text>
      
      <text
        x={80}
        y={entryY + 60}
        fontSize="12"
        fill="#8a8a8a"
        style={{ pointerEvents: 'none' }}
      >
        {entry.preview.substring(0, 36)}...
      </text>
    </g>
  );
}