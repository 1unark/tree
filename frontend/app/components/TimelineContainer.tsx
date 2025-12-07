'use client';

import { useState, useRef, useEffect } from 'react';
import { useTimeline, useChapterActions, useEventActions } from '@/hooks/useTimeline';
import { Chapter, Event } from '@/types';
import './styles/timeline.css';

export default function TimelineContainer() {
  const { chapters, events, loading, refresh } = useTimeline();
  const { createChapter, updateChapter, deleteChapter } = useChapterActions(refresh);
  const { createEvent, updateEvent, deleteEvent } = useEventActions(refresh);

  const [activeForm, setActiveForm] = useState<'top' | number | null>(null);
  const [formType, setFormType] = useState<'chapter' | 'event'>('chapter');
  const [editingItem, setEditingItem] = useState<(Chapter | Event) & { type: 'chapter' | 'event' } | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [color, setColor] = useState('#3b82f6');

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeForm !== null) {
      titleInputRef.current?.focus();
    }
  }, [activeForm]);

  const openForm = (location: 'top' | number, item?: (Chapter | Event) & { type: 'chapter' | 'event' }) => {
    if (item) {
      setEditingItem(item);
      setFormType(item.type);
      setTitle(item.title);
      setDescription(item.description || '');
      setDate(item.date);
      setColor('color' in item ? item.color : '#3b82f6');
    } else {
      setEditingItem(null);
      setTitle('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setColor('#3b82f6');
    }
    setActiveForm(location);
  };

  const closeForm = () => {
    setActiveForm(null);
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setColor('#3b82f6');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (formType === 'chapter') {
      const data = { title, description, date, color };
      if (editingItem) {
        await updateChapter(editingItem.id, data);
      } else {
        await createChapter(data);
      }
    } else {
      const data = { title, description, date, chapters: [] };
      if (editingItem) {
        await updateEvent(editingItem.id, data);
      } else {
        await createEvent(data);
      }
    }

    closeForm();
  };

  const handleDelete = async () => {
    if (!editingItem || !confirm(`Delete this ${formType}?`)) return;

    if (formType === 'chapter') {
      await deleteChapter(editingItem.id);
    } else {
      await deleteEvent(editingItem.id);
    }

    closeForm();
  };

  const allItems = [
    ...chapters.map(c => ({ ...c, type: 'chapter' as const })),
    ...events.map(e => ({ ...e, type: 'event' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ color: '#9ca3af' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <div className="timeline-wrapper">
        <div className="timeline-center-line" />
        
        <div className="timeline-content">
          {/* Add at top */}
          {activeForm === 'top' ? (
            <QuickForm
              type={formType}
              setType={setFormType}
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              date={date}
              setDate={setDate}
              color={color}
              setColor={setColor}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              onDelete={editingItem ? handleDelete : undefined}
              titleInputRef={titleInputRef}
            />
          ) : (
            <div className="add-zone" onClick={() => openForm('top')}>
              <button className="add-trigger">+</button>
              <span className="add-label">Add to timeline</span>
            </div>
          )}

          {/* Timeline items */}
          {allItems.length === 0 ? (
            <div className="empty-state">
              <h2>Your timeline is empty</h2>
              <p>Start capturing your life's moments</p>
              <button className="empty-cta" onClick={() => openForm('top')}>
                + Create your first entry
              </button>
            </div>
          ) : (
            allItems.map((item, index) => (
              <div key={`${item.type}-${item.id}`}>
                <div className="timeline-item" onClick={() => openForm(index, item)}>
                  {item.type === 'chapter' ? (
                    <div className="chapter-indicator" style={{ background: (item as Chapter).color }} />
                  ) : (
                    <div className="event-indicator" />
                  )}
                  <div className="item-card">
                    <div className="item-header">
                      <span className="item-date">
                        {new Date(item.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <h3 className="item-title">{item.title}</h3>
                    </div>
                    {item.description && (
                      <p className="item-description">{item.description}</p>
                    )}
                  </div>
                </div>

                {activeForm === index && (
                  <QuickForm
                    type={formType}
                    setType={setFormType}
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    date={date}
                    setDate={setDate}
                    color={color}
                    setColor={setColor}
                    onSubmit={handleSubmit}
                    onCancel={closeForm}
                    onDelete={editingItem ? handleDelete : undefined}
                    titleInputRef={titleInputRef}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function QuickForm({
  type,
  setType,
  title,
  setTitle,
  description,
  setDescription,
  date,
  setDate,
  color,
  setColor,
  onSubmit,
  onCancel,
  onDelete,
  titleInputRef,
}: any) {
  return (
    <div className="quick-form">
      <div className="form-tabs">
        <button
          type="button"
          className={`form-tab ${type === 'chapter' ? 'active' : ''}`}
          onClick={() => setType('chapter')}
        >
          Chapter
        </button>
        <button
          type="button"
          className={`form-tab ${type === 'event' ? 'active' : ''}`}
          onClick={() => setType('event')}
        >
          Event
        </button>
      </div>
      
      <form onSubmit={onSubmit}>
        <div className="form-content">
          <input
            ref={titleInputRef}
            type="text"
            className="form-input"
            placeholder="What happened?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          
          <textarea
            className="form-textarea"
            placeholder="Add details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="form-meta">
            {onDelete && (
              <button type="button" className="form-btn form-btn-delete" onClick={onDelete}>
                Delete
              </button>
            )}
            
            <input
              type="date"
              className="form-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            
            {type === 'chapter' && (
              <input
                type="color"
                className="form-color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            )}

            <div className="form-actions">
              <button type="button" className="form-btn form-btn-cancel" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="form-btn form-btn-save">
                Save
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}