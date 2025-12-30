// hooks/useTimeline.ts
import { useState, useEffect } from 'react';
import { Chapter, Event } from '@/types';
import { chaptersAPI, eventsAPI, TimelineData } from '@/lib/api';

export function useTimeline() {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [timelineResponse, eventsData] = await Promise.all([
        chaptersAPI.getTimelineData(),
        (await eventsAPI.getAll()) as { results: Event[] } | Event[], // Explicitly define the type
      ]);
      
      // Handle paginated responses
      const eventsArray = Array.isArray(eventsData) ? eventsData : (eventsData?.results || []);
      
      setTimelineData(timelineResponse);
      
      // Flatten all chapters for backwards compatibility
      const allChapters = [
        ...timelineResponse.main_timeline,
        ...timelineResponse.branches,
        ...timelineResponse.branches.flatMap(b => b.periods || [])
      ];
      
      setChapters(allChapters.sort((a, b) => 
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      ));
      setEvents(eventsArray);
    } catch (err) {
      console.error('Failed to load data:', err);
      setTimelineData({ main_timeline: [], branches: [] });
      setChapters([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { chapters, events, timelineData, loading, refresh: loadData };
}