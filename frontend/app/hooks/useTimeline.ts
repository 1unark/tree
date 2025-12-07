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
      setChapters(chaptersData.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
      setEvents(eventsData);
    } catch (err) {
      console.error('Failed to load data:', err);
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