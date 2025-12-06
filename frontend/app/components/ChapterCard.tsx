// components/ChapterCard.tsx
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
    <div className="relative pl-8 pb-8">
      {/* Timeline line */}
      <div
        className="absolute left-2 top-0 bottom-0 w-1"
        style={{ backgroundColor: chapter.color }}
      />

      {/* Timeline dot */}
      <div
        className="absolute left-0 top-2 w-5 h-5 rounded-full border-4 border-white shadow-md"
        style={{ backgroundColor: chapter.color }}
      />

      {/* Chapter card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Chapter header */}
        <div
          className="p-4 cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: `${chapter.color}15`, borderLeft: `4px solid ${chapter.color}` }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">{chapter.title}</h3>
              <div className="text-sm text-gray-600">
                {formatDate(chapter.start_date)}
                {chapter.end_date ? ` - ${formatDate(chapter.end_date)}` : ' - Present'}
              </div>
              {chapter.description && isExpanded && (
                <p className="mt-2 text-gray-700">{chapter.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this chapter? Events will not be deleted.')) {
                    onDelete();
                  }
                }}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            </div>
          </div>
        </div>

        {/* Events list */}
        {isExpanded && chapterEvents.length > 0 && (
          <div className="border-t">
            {chapterEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 border-b last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        {formatDate(event.date)}
                      </span>
                      <span className="text-gray-300">•</span>
                      <h4 className="font-medium">{event.title}</h4>
                    </div>
                    {event.description && (
                      <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => onEditEvent(event)}
                      className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this event?')) {
                          onDeleteEvent(event.id);
                        }
                      }}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isExpanded && chapterEvents.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500 border-t">
            No events in this chapter yet
          </div>
        )}
      </div>
    </div>
  );
}