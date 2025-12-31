'use client';

import LifeTimeline from '../components/timeline/LifeTimeline';
import { useTimeline } from '@/hooks/useTimeline';

export default function TimelineContainer() {
  const { chapters, events, loading, refresh } = useTimeline();

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
