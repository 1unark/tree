import { EventFormData } from '@/types';
import { eventsAPI } from '@/lib/api';

export function useEventActions(refresh: () => Promise<void>) {
  const createEvent = async (data: EventFormData) => {
    await eventsAPI.create(data);
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