// api.ts
import { Chapter, Event, ChapterFormData, EventFormData } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // No token, redirect to auth page
    window.location.href = '/auth';
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    // Token invalid or expired
    localStorage.removeItem('token');
    window.location.href = '/auth';
    throw new Error('Authentication failed');
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[API ERROR] ${endpoint}:`, errorText);
    throw new Error(`API error: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
}

// Timeline data structure returned from the backend
export interface TimelineData {
  main_timeline: Chapter[];
  branches: Chapter[];
}

export const chaptersAPI = {
  // Get organized timeline data (recommended)
  getTimelineData: (): Promise<TimelineData> => 
    fetchAPI('/chapters/timeline_data/'),
  
  // Get all chapters (fallback)
  getAll: (): Promise<Chapter[]> => fetchAPI('/chapters/'),
  
  create: (data: ChapterFormData): Promise<Chapter> => 
    fetchAPI('/chapters/', { method: 'POST', body: JSON.stringify(data) }),
  
  update: (id: number, data: Partial<ChapterFormData>): Promise<Chapter> => 
    fetchAPI(`/chapters/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  
  delete: (id: number): Promise<void> => 
    fetchAPI(`/chapters/${id}/`, { method: 'DELETE' }),
};

export const eventsAPI = {
  getAll: (): Promise<Event[]> => fetchAPI('/events/'),
  
  create: (data: EventFormData): Promise<Event> => {
    return fetchAPI('/events/', { method: 'POST', body: JSON.stringify(data) });
  },
  
  update: (id: number, data: Partial<EventFormData>): Promise<Event> => 
    fetchAPI(`/events/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  
  delete: (id: number): Promise<void> => 
    fetchAPI(`/events/${id}/`, { method: 'DELETE' }),
};