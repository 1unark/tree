// components/TimelineContainer.tsx
'use client';

import TimelineFlow from './components/TimelineFlow';
import { useTimeline } from '@/hooks/useTimeline';

export default function TimelineContainer() {
  const { chapters, events, loading } = useTimeline();

  if (loading) return <div>Loading...</div>;

  return <TimelineFlow chapters={chapters} events={events} />;
}