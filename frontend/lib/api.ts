// lib/api.ts
import { Chapter, Event, ChapterFormData, EventFormData } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// Chapters
export const chaptersAPI = {
  getAll: (): Promise<Chapter[]> => fetchAPI('/chapters/'),
  
  getOne: (id: number): Promise<Chapter> => fetchAPI(`/chapters/${id}/`),
  
  create: (data: ChapterFormData): Promise<Chapter> => 
    fetchAPI('/chapters/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: Partial<ChapterFormData>): Promise<Chapter> => 
    fetchAPI(`/chapters/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (id: number): Promise<void> => 
    fetchAPI(`/chapters/${id}/`, {
      method: 'DELETE',
    }),
};

// Events
export const eventsAPI = {
  getAll: (): Promise<Event[]> => fetchAPI('/events/'),
  
  getOne: (id: number): Promise<Event> => fetchAPI(`/events/${id}/`),
  
  create: (data: EventFormData): Promise<Event> => 
    fetchAPI('/events/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: Partial<EventFormData>): Promise<Event> => 
    fetchAPI(`/events/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (id: number): Promise<void> => 
    fetchAPI(`/events/${id}/`, {
      method: 'DELETE',
    }),
};