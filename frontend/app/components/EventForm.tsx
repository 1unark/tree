// components/EventForm.tsx
'use client';

import { useState } from 'react';
import { Event, EventFormData, Chapter } from '@/types';

interface EventFormProps {
  event?: Event;
  chapters: Chapter[];
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
}

export default function EventForm({ event, chapters, onSubmit, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || '',
    chapters: event?.chapters || [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const toggleChapter = (chapterId: number) => {
    setFormData({
      ...formData,
      chapters: formData.chapters.includes(chapterId)
        ? formData.chapters.filter(id => id !== chapterId)
        : [...formData.chapters, chapterId],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold">
        {event ? 'Edit Event' : 'New Event'}
      </h3>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Date *
        </label>
        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Chapters
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
          {chapters.length === 0 ? (
            <p className="text-sm text-gray-500">No chapters available</p>
          ) : (
            chapters.map((chapter) => (
              <label key={chapter.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.chapters.includes(chapter.id)}
                  onChange={() => toggleChapter(chapter.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: chapter.color }}
                  />
                  <span className="text-sm">{chapter.title}</span>
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Event'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}