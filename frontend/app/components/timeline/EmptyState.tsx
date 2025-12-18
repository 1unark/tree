import React from 'react';

interface TimelineEmptyStateProps {
  onCreateEntry: () => void;
}

export default function TimelineEmptyState({ onCreateEntry }: TimelineEmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '40px',
      textAlign: 'center',
      color: '#6b6b6b'
    }}>
      <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#000' }}>
        Your timeline is empty
      </div>
      <div style={{ fontSize: '14px', marginBottom: '24px', maxWidth: '400px' }}>
        Click anywhere on the timeline to create your first entry, or create a chapter first to organize your timeline.
      </div>
      <div 
        style={{
          width: '2px',
          height: '400px',
          background: '#e0e0e0',
          position: 'relative',
          margin: '0 auto',
          cursor: 'pointer'
        }}
        onClick={onCreateEntry}
      >
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: '#37352f',
          cursor: 'pointer',
          border: '2px solid white',
          boxShadow: '0 0 0 2px #37352f',
          transition: 'transform 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.2)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'}
        />
      </div>
    </div>
  );
}