import { Chapter, Event } from '@/types';

interface TimelineEntry {
  id: string | number;
  date: Date;
  title: string;
  preview: string;
  content: string;
}

interface TimelinePeriod {
  id: string | number;
  type: string;
  title: string;
  dateRange: string;
  startDate: Date;
  endDate: Date;
  collapsed: boolean;
  entries: TimelineEntry[];
}

interface TimelineBranch {
  id: number;
  name: string;
  x: number;
  collapsed: boolean;
  color: string;
  periods: TimelinePeriod[];
  sourceEntryId?: string | number;
}

interface TimelineData {
  mainTimeline: TimelinePeriod[];
  branches: TimelineBranch[];
}

export function transformToTimelineData(chapters: Chapter[], events: Event[]): TimelineData {
  const mainPeriods = chapters.filter(c => c.type === 'main_period');
  const branches = chapters.filter(c => c.type === 'branch');
  const branchPeriods = chapters.filter(c => c.type === 'branch_period');

  const eventsWithChapters = events.filter(e => e.chapter !== null && e.chapter !== undefined);
  const eventsWithoutChapters = events.filter(e => !e.chapter || e.chapter === null || e.chapter === undefined);

  const mainTimeline: TimelinePeriod[] = mainPeriods.map(chapter => {
    const chapterEvents = eventsWithChapters.filter(e => e.chapter === chapter.id || (typeof e.chapter === 'object' && e.chapter?.id === chapter.id));
    const entries: TimelineEntry[] = chapterEvents.map(event => ({
      id: event.id,
      date: new Date(event.date),
      title: event.title,
      preview: event.content ? event.content.substring(0, 100).trim() + (event.content.length > 100 ? '...' : '') : (event.preview || event.description?.substring(0, 100) + '...' || ''),
      content: event.content || event.description || event.preview || '',
    }));

    const startDate = new Date(chapter.start_date);
    const endDate = chapter.end_date ? new Date(chapter.end_date) : new Date();
    const dateRange = `${startDate.getFullYear()} - ${endDate.getFullYear()}`;

    return {
      id: chapter.id,
      type: 'period',
      title: chapter.title,
      dateRange,
      startDate,
      endDate,
      collapsed: chapter.collapsed || false,
      entries: entries.sort((a, b) => a.date.getTime() - b.date.getTime()),
    };
  });

  if (eventsWithoutChapters.length > 0) {
    const uncategorizedEntries: TimelineEntry[] = eventsWithoutChapters.map(event => ({
      id: event.id,
      date: new Date(event.date),
      title: event.title,
      preview: event.content ? event.content.substring(0, 100).trim() + (event.content.length > 100 ? '...' : '') : (event.preview || event.description?.substring(0, 100) + '...' || ''),
      content: event.content || event.description || event.preview || '',
    }));

    const sortedEntries = uncategorizedEntries.sort((a, b) => a.date.getTime() - b.date.getTime());
    const earliestDate = sortedEntries[0]?.date || new Date();
    const latestDate = sortedEntries[sortedEntries.length - 1]?.date || new Date();
    
    mainTimeline.push({
      id: 'uncategorized',
      type: 'period',
      title: 'Uncategorized',
      dateRange: `${earliestDate.getFullYear()} - ${latestDate.getFullYear()}`,
      startDate: earliestDate,
      endDate: latestDate,
      collapsed: false,
      entries: sortedEntries,
    });
  }

  const transformedBranches: TimelineBranch[] = branches.map((branch, idx) => {
    const periodsForBranch = branchPeriods.filter(p => p.parent_branch === branch.id);
    const periods: TimelinePeriod[] = periodsForBranch.map(periodChapter => {
      const periodEvents = eventsWithChapters.filter(e => e.chapter === periodChapter.id || (typeof e.chapter === 'object' && e.chapter?.id === periodChapter.id));
      const entries: TimelineEntry[] = periodEvents.map(event => ({
        id: event.id,
        date: new Date(event.date),
        title: event.title,
        preview: event.content ? event.content.substring(0, 100).trim() + (event.content.length > 100 ? '...' : '') : (event.preview || event.description?.substring(0, 100) + '...' || ''),
        content: event.content || event.description || event.preview || '',
      }));

      const startDate = new Date(periodChapter.start_date);
      const endDate = periodChapter.end_date ? new Date(periodChapter.end_date) : new Date();
      const dateRange = `${startDate.getFullYear()} - ${endDate.getFullYear()}`;

      return {
        id: periodChapter.id,
        type: 'period',
        title: periodChapter.title,
        dateRange,
        startDate,
        endDate,
        collapsed: periodChapter.collapsed || false,
        entries: entries.sort((a, b) => a.date.getTime() - b.date.getTime()),
      };
    });

    return {
      id: branch.id,
      name: branch.title,
      x: branch.x_position || (630 + idx * 400),
      collapsed: branch.collapsed || false,
      color: branch.color || '#3b82f6',
      periods: periods.sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),
    };
  });

  mainTimeline.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return {
    mainTimeline,
    branches: transformedBranches,
  };
}