import React from 'react';
import { TimelineBranch } from '../types/timeline.types';

interface TimelineHeaderProps {
  branches: TimelineBranch[];
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TimelineHeader({ branches }: TimelineHeaderProps) {
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/users/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Token ${token}` : '',
        },
      });

      // Always clear token and redirect, even if request fails
      localStorage.removeItem('token');
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear token and redirect on error
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
  };

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
          Timeline
        </h1>
        
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          paddingLeft: '20px',
          borderLeft: '1px solid #ddd'
        }}>
          {/*
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
            */}
        </div>
      </div>
      
      <button
        onClick={handleLogout}
        style={{
          fontSize: '12px',
          color: '#6b6b6b',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
        }}
        onMouseOver={(e) => e.currentTarget.style.color = '#111'}
        onMouseOut={(e) => e.currentTarget.style.color = '#6b6b6b'}
      >
        Log out
      </button>
    </div>
  );
}