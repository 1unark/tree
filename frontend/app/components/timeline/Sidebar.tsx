'use client';

import { useState, useEffect } from 'react';
import { EventFormData, Chapter } from '@/types';

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

  const getChapterDetails = (chapterId: number) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return null;
    
    if (chapter.type === 'branch_period') {
      const parentBranch = chapters.find(
        c => c.id === chapter.parent_branch && c.type === 'branch'
      );
      return {
        branch: parentBranch?.title || 'Unknown Branch',
        chapter: chapter.title,
        type: 'branch_period'
      };
    }
    
    return {
      branch: null,
      chapter: chapter.title,
      type: chapter.type
    };
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
        date: createDate 
          ? createDate.toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0],
        chapter: createChapterId,
        order: 0,
      });
    }
  }, [entry, isCreating, createDate, createChapterId, entryChapterId]);

  const handleSave = async () => {
    if (!formData.title?.trim()) return;
    
    const preview = formData.content 
      ? formData.content.substring(0, 100).trim() + 
        (formData.content.length > 100 ? '...' : '')
      : '';
    
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        title: formData.title.trim(),
        preview,
        order: formData.order || 0,
      });
      if (!isCreating) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entry || !onDelete) return;
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await onDelete(entry.id);
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    if (isCreating) {
      onCancel();
    } else {
      setIsEditing(false);
      if (entry) {
        setFormData({
          title: entry.title,
          content: entry.content || entry.preview || '',
          date: new Date(entry.date).toISOString().split('T')[0],
          chapter: entryChapterId,
          order: 0,
        });
      }
    }
  };

  const handleClose = () => {
    onCancel();
  };

  if (!entry && !isCreating) {
    return null;
  }

  const chapterDetails = formData.chapter 
    ? getChapterDetails(formData.chapter) 
    : null;

  const formattedDate = (isEditing && formData.date)
    ? new Date(formData.date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : entry 
      ? new Date(entry.date).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
      : '';

  return (
    <div style={{
      width: '420px',
      background: '#ffffff',
      borderLeft: '1px solid #e9e9e7',
      padding: '80px 24px 32px 24px',
      overflow: 'auto',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {/* Metadata row with close button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: '#37352f',
              flexWrap: 'wrap',
              fontWeight: '500',
              flex: 1,
            }}>
              {chapterDetails && (
                <>
                  {chapterDetails.branch && (
                    <>
                      <span>{chapterDetails.branch}</span>
                      <span style={{ color: '#9b9a97', fontWeight: '400' }}>/</span>
                    </>
                  )}
                  <span>{chapterDetails.chapter}</span>
                  <span style={{ color: '#9b9a97', fontWeight: '400' }}>·</span>
                </>
              )}
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={isSaving}
                style={{
                  padding: '2px 6px',
                  border: '1px solid #e9e9e7',
                  background: '#ffffff',
                  fontSize: '13px',
                  color: '#37352f',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  outline: 'none',
                  borderRadius: '3px',
                  fontWeight: '500',
                }}
              />
            </div>
            <button
              onClick={handleClose}
              style={{
                width: '32px',
                height: '32px',
                border: 'none',
                background: 'transparent',
                color: '#787774',
                cursor: 'pointer',
                fontSize: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '3px',
                transition: 'background 0.1s ease',
                flexShrink: 0,
                marginLeft: '8px',
                lineHeight: '1',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f7f6f3'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              ×
            </button>
          </div>

          {/* Title */}
          <input
            type="text"
            placeholder="Untitled"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            autoFocus
            disabled={isSaving}
            style={{
              width: '100%',
              padding: '2px 0 8px 0',
              border: 'none',
              fontSize: '28px',
              fontWeight: '700',
              color: '#37352f',
              background: 'transparent',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: '1.3',
              marginBottom: '12px',
            }}
          />

          {/* Content */}
          <textarea
            placeholder="Start writing..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            disabled={isSaving}
            style={{
              width: '100%',
              padding: '0',
              border: 'none',
              background: 'transparent',
              fontSize: '15px',
              flex: 1,
              resize: 'none',
              fontFamily: 'inherit',
              lineHeight: '1.6',
              color: '#37352f',
              outline: 'none',
              minHeight: '300px',
            }}
          />

          {/* Actions */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #e9e9e7',
          }}>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '3px',
                background: 'transparent',
                color: '#787774',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Cancel
            </button>
            {!isCreating && entry && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #eb5757',
                  borderRadius: '3px',
                  background: 'transparent',
                  color: '#eb5757',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginLeft: 'auto',
                }}
              >
                Delete
              </button>
            )}
            <button
              type="submit"
              onClick={handleSave}
              disabled={isSaving || !formData.title?.trim()}
              style={{
                padding: '6px 16px',
                border: 'none',
                borderRadius: '3px',
                background: isSaving || !formData.title?.trim() ? '#e9e9e7' : '#37352f',
                color: isSaving || !formData.title?.trim() ? '#9b9a97' : '#ffffff',
                cursor: isSaving || !formData.title?.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                marginLeft: !isCreating && entry && onDelete ? '0' : 'auto',
              }}
            >
              {isSaving ? 'Saving...' : isCreating ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Metadata row with close button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: '#37352f',
              flexWrap: 'wrap',
              fontWeight: '500',
              flex: 1,
            }}>
              {chapterDetails && (
                <>
                  {chapterDetails.branch && (
                    <>
                      <span>{chapterDetails.branch}</span>
                      <span style={{ color: '#9b9a97', fontWeight: '400' }}>/</span>
                    </>
                  )}
                  <span>{chapterDetails.chapter}</span>
                  <span style={{ color: '#9b9a97', fontWeight: '400' }}>·</span>
                </>
              )}
              <span>{formattedDate}</span>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: '32px',
                height: '32px',
                border: 'none',
                background: 'transparent',
                color: '#787774',
                cursor: 'pointer',
                fontSize: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '3px',
                transition: 'background 0.1s ease',
                flexShrink: 0,
                marginLeft: '8px',
                lineHeight: '1',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f7f6f3'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              ×
            </button>
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#37352f',
            margin: '0 0 12px 0',
            lineHeight: '1.3',
            fontFamily: 'inherit',
          }}>
            {entry?.title || 'Untitled'}
          </h2>

          {/* Content */}
          <div style={{
            fontSize: '15px',
            color: '#37352f',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            marginBottom: '20px',
            fontFamily: 'inherit',
          }}>
            {entry?.content || entry?.preview}
          </div>

          {/* Actions */}
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: '3px',
              background: '#37352f',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}