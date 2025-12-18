import React from 'react';
import { TimelineBranch } from '../types/timeline.types';

interface TimelineHeaderProps {
  branches: TimelineBranch[];
}

export default function TimelineHeader({ branches }: TimelineHeaderProps) {
  return (
    <div style={{
      height: '56px',
      borderBottom: '1px solid #ddd',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      background: '#fff',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111' }}>
          Life Timeline
        </h1>
        
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          paddingLeft: '20px',
          borderLeft: '1px solid #ddd'
        }}>
          {branches.map(branch => (
            <div key={branch.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: '#f5f5f5',
              borderRadius: '4px',
              fontSize: '13px',
              color: '#666'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: branch.color
              }} />
              {branch.name}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ fontSize: '12px', color: '#6b6b6b' }}>
        Click on the timeline to create entries
      </div>
    </div>
  );
}