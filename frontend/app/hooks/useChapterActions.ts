import { ChapterFormData } from '@/types';
import { chaptersAPI } from '@/lib/api';

export function useChapterActions(refresh: () => Promise<void>) {
  const createChapter = async (data: ChapterFormData) => {
    await chaptersAPI.create(data);
    await refresh();
  };

  const updateChapter = async (id: number, data: ChapterFormData) => {
    await chaptersAPI.update(id, data);
    await refresh();
  };

  const deleteChapter = async (id: number) => {
    await chaptersAPI.delete(id);
    await refresh();
  };

  return {
    createChapter,
    updateChapter,
    deleteChapter,
  };
}