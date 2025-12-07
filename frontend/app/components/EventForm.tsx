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
    date: event?.date || new Date().toISOString().split('T')[0],
    chapters: event?.chapters || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
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
    <div className="modal" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
          {event ? 'Edit' : 'New'} Event
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Title"
              className="input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <textarea
              placeholder="Description (optional)"
              className="textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <input
              type="date"
              className="input"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          {chapters.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#6b7280' }}>
                Link to chapters (optional)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {chapters.map((chapter) => (
                  <label
                    key={chapter.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: formData.chapters.includes(chapter.id) ? '#eff6ff' : '#f9fafb',
                      border: formData.chapters.includes(chapter.id) ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.chapters.includes(chapter.id)}
                      onChange={() => toggleChapter(chapter.id)}
                      style={{ margin: 0 }}
                    />
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: chapter.color,
                      }}
                    />
                    <span>{chapter.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="button-group">
            <button type="button" className="button button-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="button button-primary">
              {event ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}