// app/components/TimelineList.tsx
import { Chapter, Event } from '@/types';
import ChapterCard from './ChapterCard';

interface TimelineListProps {
  chapters: Chapter[];
  events: Event[];
  onEditChapter: (chapter: Chapter) => void;
  onDeleteChapter: (id: number) => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (id: number) => void;
}

export default function TimelineList({
  chapters,
  events,
  onEditChapter,
  onDeleteChapter,
  onEditEvent,
  onDeleteEvent,
}: TimelineListProps) {
  return (
    <div className="space-y-0">
      {chapters.map((chapter) => (
        <ChapterCard
          key={chapter.id}
          chapter={chapter}
          events={events}
          onEdit={() => onEditChapter(chapter)}
          onDelete={() => onDeleteChapter(chapter.id)}
          onEditEvent={onEditEvent}
          onDeleteEvent={onDeleteEvent}
        />
      ))}
    </div>
  );
}