'use client';

import { useState, useEffect } from 'react';
import { Event, EventFormData, Chapter } from '@/types';

interface TimelineEntry {
  id: string | number;
  date: Date;
  title: string;
  preview: string;
  content: string;
}

interface TimelineSidebarProps {
  entry: TimelineEntry | null;
  chapters: Chapter[];
  isCreating: boolean;
  createDate?: Date;
  createChapterId?: number;
  entryChapterId?: number;
  onSave: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
  onDelete?: (entryId: string | number) => Promise<void>;
}

export default function TimelineSidebar({
  entry,
  chapters,
  isCreating,
  createDate,
  createChapterId,
  entryChapterId,
  onSave,
  onCancel,
  onDelete,
}: TimelineSidebarProps) {
  const [isEditing, setIsEditing] = useState(isCreating);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    chapter: undefined,
    order: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Helper to get chapter display name
  const getChapterDisplayName = (chapter: Chapter) => {
    if (chapter.type === 'branch_period') {
      const parentBranch = chapters.find(c => c.id === chapter.parent_branch && c.type === 'branch');
      if (parentBranch) {
        return `${parentBranch.title} - ${chapter.title}`;
      }
    }
    return chapter.title;
  };

  // Helper to determine if a chapter is selectable (only periods, not branches)
  const getSelectableChapters = () => {
    return chapters.filter(c => c.type === 'main_period' || c.type === 'branch_period');
  };

  useEffect(() => {
    if (entry && !isCreating) {
      setFormData({
        title: entry.title,
        content: entry.content || entry.preview || '',
        date: new Date(entry.date).toISOString().split('T')[0],
        chapter: entryChapterId,
        order: 0,
      });
      setIsEditing(false);
    } else if (isCreating) {
      setIsEditing(true);
      setFormData({
        title: '',
        content: '',
        date: createDate ? createDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        chapter: createChapterId,
        order: 0,
      });
    }
  }, [entry, isCreating, createDate, createChapterId, entryChapterId]);

  const handleSave = async () => {
    if (!formData.title || !formData.title.trim()) return;
    
    const preview = formData.content 
      ? formData.content.substring(0, 100).trim() + (formData.content.length > 100 ? '...' : '')
      : '';
    
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        preview,
      });
      if (!isCreating) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entry || !onDelete) return;
    if (confirm('Are you sure you want to delete this entry?')) {
      await onDelete(entry.id);
    }
  };

  if (!entry && !isCreating) {
    return null;
  }

  const selectableChapters = getSelectableChapters();
  const selectedChapter = formData.chapter ? chapters.find(c => c.id === formData.chapter) : null;

  return (
    <div style={{
      width: '420px',
      background: '#ffffff',
      borderLeft: '1px solid #e9e9e7',
      padding: '96px 48px 48px 48px',
      overflow: 'auto',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: '8px' }}>
            <input
              type="text"
              placeholder="Untitled"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: '100%',
                padding: '4px 2px 8px 2px',
                border: 'none',
                fontSize: '30px',
                fontWeight: '700',
                color: '#37352f',
                background: 'transparent',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.4',
                minHeight: '42px',
              }}
              autoFocus
            />
          </div>

          <div style={{ marginTop: '4px', marginBottom: '8px' }}>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={{
                padding: '4px 6px',
                border: 'none',
                background: 'transparent',
                fontSize: '14px',
                color: '#787774',
                cursor: 'pointer',
                outline: 'none',
              }}
            />
          </div>

          {selectableChapters.length > 0 && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '11px', 
                marginBottom: '6px', 
                color: '#787774', 
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Chapter (optional)
              </label>
              <select
                value={formData.chapter || ''}
                onChange={(e) => setFormData({ ...formData, chapter: e.target.value ? parseInt(e.target.value) : undefined })}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #e9e9e7',
                  borderRadius: '4px',
                  background: 'white',
                  fontSize: '14px',
                  color: '#37352f',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="">No chapter</option>
                {selectableChapters
                  .filter(c => c.type === 'main_period')
                  .map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.title}
                    </option>
                  ))}
                {selectableChapters
                  .filter(c => c.type === 'branch_period')
                  .map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {getChapterDisplayName(chapter)}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '8px', minHeight: '400px' }}>
            <textarea
              placeholder="Start writing..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              style={{
                width: '100%',
                padding: '0',
                border: 'none',
                background: 'transparent',
                fontSize: '16px',
                flex: 1,
                resize: 'none',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                lineHeight: '1.6',
                color: '#37352f',
                outline: 'none',
                minHeight: '400px',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '3px',
                background: 'transparent',
                color: '#787774',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '400',
              }}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.title || !formData.title.trim()}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '3px',
                background: isSaving || !formData.title.trim() ? '#e9e9e7' : '#37352f',
                color: isSaving || !formData.title.trim() ? '#9b9a97' : '#ffffff',
                cursor: isSaving || !formData.title.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '400',
                flex: 1,
                transition: 'all 0.1s ease',
              }}
            >
              {isSaving ? 'Saving...' : isCreating ? 'Create' : 'Save'}
            </button>
            {!isCreating && entry && onDelete && (
              <button
                onClick={handleDelete}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ef4444',
                  borderRadius: '3px',
                  background: 'white',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '400',
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div style={{
            fontSize: '12px',
            color: '#787774',
            marginBottom: '4px',
            fontWeight: '400',
          }}>
            {entry && new Date(entry.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <h2 style={{
            fontSize: '30px',
            fontWeight: '700',
            color: '#37352f',
            marginBottom: '16px',
            lineHeight: '1.2',
            fontFamily: 'inherit',
          }}>
            {entry?.title || 'Untitled'}
          </h2>
          <div style={{
            fontSize: '16px',
            color: '#37352f',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            marginBottom: '24px',
            fontFamily: 'inherit',
          }}>
            {entry?.content || entry?.preview}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '3px',
              background: '#f7f6f3',
              color: '#37352f',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '400',
              transition: 'background 0.1s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#e9e9e7'}
            onMouseOut={(e) => e.currentTarget.style.background = '#f7f6f3'}
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}