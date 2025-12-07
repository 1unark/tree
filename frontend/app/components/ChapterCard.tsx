'use client';

import { useState } from 'react';
import { Chapter, Event } from '@/types';

interface ChapterCardProps {
  chapter: Chapter;
  events: Event[];
  onEdit: () => void;
  onDelete: () => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: number) => void;
}

export default function ChapterCard({
  chapter,
  events,
  onEdit,
  onDelete,
  onEditEvent,
  onDeleteEvent,
}: ChapterCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const chapterEvents = events
    .filter(event => event.chapters.includes(chapter.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="timeline-item">
      <div
        className="timeline-dot"
        style={{ backgroundColor: chapter.color }}
      />

      <div className="item-content">
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <h3 className="item-title">{chapter.title}</h3>
              <p className="item-date">{formatDate(chapter.date)}</p>
              {chapter.description && isExpanded && (
                <p className="item-description">{chapter.description}</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="button button-secondary"
                style={{ padding: '4px 12px', fontSize: '13px' }}
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this chapter?')) {
                    onDelete();
                  }
                }}
                className="button button-danger"
                style={{ padding: '4px 12px', fontSize: '13px' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {isExpanded && chapterEvents.length > 0 && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
            {chapterEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  padding: '8px 0',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {formatDate(event.date)}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{event.title}</span>
                  </div>
                  {event.description && (
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                      {event.description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => onEditEvent(event)}
                    className="button button-secondary"
                    style={{ padding: '2px 8px', fontSize: '12px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this event?')) {
                        onDeleteEvent(event.id);
                      }
                    }}
                    className="button button-danger"
                    style={{ padding: '2px 8px', fontSize: '12px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}