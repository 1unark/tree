import React from 'react';
import AddButton from '../shared/AddButton';

interface TimelineEmptyStateProps {
  onCreateEntry: () => void;
  onCreateChapter: () => void;
}

export default function TimelineEmptyState({ onCreateEntry, onCreateChapter }: TimelineEmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '40px',
      textAlign: 'center',
      color: '#6b6b6b',
      marginTop:'-300px'
    }}>
      <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#000' }}>
        Your timeline is empty
      </div>
      <div style={{ fontSize: '14px', marginBottom: '24px', maxWidth: '400px' }}>
        Create a chapter to organize your life timeline, then add entries within it.
      </div>
      <svg width="200" height="400" style={{ overflow: 'visible' }}>
        <line
          x1="100"
          y1="0"
          x2="100"
          y2="400"
          stroke="#e0e0e0"
          strokeWidth="2"
        />
        <AddButton
          x={100}
          y={200}
          onAddEntry={onCreateEntry}
          onAddChapter={onCreateChapter}
          hasChapters={false}
        />
      </svg>
    </div>
  );
}