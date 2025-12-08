import { useState, useEffect } from 'react';
import { Chapter, Event } from '@/types';
import { chaptersAPI, eventsAPI } from '@/lib/api';

export function useTimeline() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [chaptersData, eventsData] = await Promise.all([
        chaptersAPI.getAll(),
        eventsAPI.getAll(),
      ]);
      
      // Ensure we have arrays and handle paginated responses
      const chaptersArray = Array.isArray(chaptersData) ? chaptersData : (chaptersData?.results || []);
      const eventsArray = Array.isArray(eventsData) ? eventsData : (eventsData?.results || []);
      
      setChapters(chaptersArray.sort((a, b) => 
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      ));
      setEvents(eventsArray);
    } catch (err) {
      console.error('Failed to load data:', err);
      setChapters([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { chapters, events, loading, refresh: loadData };
}

export function useChapterActions(refresh: () => Promise<void>) {
  return {
    createChapter: async (data: any) => {
      await chaptersAPI.create(data);
      await refresh();
    },
    updateChapter: async (id: number, data: any) => {
      await chaptersAPI.update(id, data);
      await refresh();
    },
    deleteChapter: async (id: number) => {
      await chaptersAPI.delete(id);
      await refresh();
    },
  };
}

export function useEventActions(refresh: () => Promise<void>) {
  return {
    createEvent: async (data: any) => {
      await eventsAPI.create(data);
      await refresh();
    },
    updateEvent: async (id: number, data: any) => {
      await eventsAPI.update(id, data);
      await refresh();
    },
    deleteEvent: async (id: number) => {
      await eventsAPI.delete(id);
      await refresh();
    },
  };
}