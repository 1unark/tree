// api.ts
import { Chapter, Event, ChapterFormData, EventFormData } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchAPI(endpoint: string, options?: RequestInit) {
  console.log(`[API] Calling ${endpoint}`, options?.body ? JSON.parse(options.body as string) : '');
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[API ERROR] ${endpoint}:`, errorText);
    throw new Error(`API error: ${response.statusText}`);
  }

  const result = await response.json();
  console.log(`[API RESPONSE] ${endpoint}:`, result);
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
    console.log('[eventsAPI.create] Input data:', data);
    return fetchAPI('/events/', { method: 'POST', body: JSON.stringify(data) });
  },
  
  update: (id: number, data: Partial<EventFormData>): Promise<Event> => 
    fetchAPI(`/events/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  
  delete: (id: number): Promise<void> => 
    fetchAPI(`/events/${id}/`, { method: 'DELETE' }),
};