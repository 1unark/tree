'use client';

import { useState } from 'react';
import { Chapter, ChapterFormData } from '@/types';

interface ChapterFormProps {
  chapter?: Chapter;
  onSubmit: (data: ChapterFormData) => Promise<void>;
  onCancel: () => void;
}

export default function ChapterForm({ chapter, onSubmit, onCancel }: ChapterFormProps) {
  const [formData, setFormData] = useState<ChapterFormData>({
    title: chapter?.title || '',
    description: chapter?.description || '',
    date: chapter?.date || new Date().toISOString().split('T')[0],
    color: chapter?.color || '#3b82f6',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="modal" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
          {chapter ? 'Edit' : 'New'} Chapter
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

          <div style={{ marginBottom: '16px' }}>
            <input
              type="color"
              className="input"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>

          <div className="button-group">
            <button type="button" className="button button-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="button button-primary">
              {chapter ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}