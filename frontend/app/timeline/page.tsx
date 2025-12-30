'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LifeTimeline from '../components/timeline/LifeTimeline';
import { useTimeline } from '@/hooks/useTimeline';

export default function TimelineContainer() {
  const router = useRouter();
  const { chapters, events, loading, refresh } = useTimeline();

  useEffect(() => {
    // Check if user is authenticated via Django REST token
    const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
    
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        Loading timeline...
      </div>
    );
  }

  return <LifeTimeline chapters={chapters} events={events} refresh={refresh} />;
}