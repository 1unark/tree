import React from 'react';
import { TimelinePeriod } from '../types/timeline.types';

interface TimelineStickyHeaderProps {
  period: TimelinePeriod;
}

export default function TimelineStickyHeader({ period }: TimelineStickyHeaderProps) {
  return (
    <div style={{
      position: 'absolute',
      top: '56px',
      left: '0',
      right: '0',
      height: '62px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e5e5e5',
      display: 'flex',
      alignItems: 'center',
      padding: '0 40px 0 90px',
      zIndex: 90,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      opacity: 1, // Always visible
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#000000',
        marginRight: '16px'
      }} />
      <div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#000000', letterSpacing: '-0.01em' }}>
          {period.title}
        </div>
        <div style={{ fontSize: '11px', color: '#6b6b6b', marginTop: '2px' }}>
          {period.dateRange} • {period.entries.length} entries
        </div>
      </div>
    </div>
  );
}