import { EventFormData } from '@/types';
import { eventsAPI } from '@/lib/api';

export function useEventActions(refresh: () => Promise<void>) {
  const createEvent = async (data: EventFormData) => {
    console.log('[useEventActions.createEvent] Called with:', data);
    const result = await eventsAPI.create(data);
    console.log('[useEventActions.createEvent] Result:', result);
    await refresh();
  };

  const updateEvent = async (id: number, data: EventFormData) => {
    await eventsAPI.update(id, data);
    await refresh();
  };

  const deleteEvent = async (id: number) => {
    await eventsAPI.delete(id);
    await refresh();
  };

  return {
    createEvent,
    updateEvent,
    deleteEvent,
  };
}