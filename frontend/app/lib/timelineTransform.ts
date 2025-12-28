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

function transformEntry(event: Event): TimelineEntry {
  return {
    id: event.id,
    date: new Date(event.date),
    title: event.title,
    preview: event.content ? event.content.substring(0, 100).trim() + (event.content.length > 100 ? '...' : '') : '',
    content: event.content || '',
  };
}

function formatDateRange(startDate: Date, endDate: Date): string {
  return `${startDate.getFullYear()} - ${endDate.getFullYear()}`;
}

export function transformToTimelineData(chapters: Chapter[], events: Event[]): TimelineData {
  const mainPeriods = chapters.filter(c => c.type === 'main_period');
  const branches = chapters.filter(c => c.type === 'branch');

  console.log('=== DEBUG: All Events with chapter field ===');
  events.forEach(e => {
    console.log(`Event ${e.id} (${e.title}):`, {
      chapter: e.chapter,
      chapterType: typeof e.chapter,
      branch: e.branch,
      branchType: typeof e.branch
    });
  });

  console.log('=== DEBUG: All Chapters ===');
  mainPeriods.forEach(c => {
    console.log(`Chapter ${c.id} (${c.title})`);
  });

  // Build main timeline
  const mainTimeline: TimelinePeriod[] = mainPeriods.map(chapter => {
    // Get events that belong to this chapter
    const chapterEvents = events.filter(e => {
      if (!e.chapter) return false;
      
      // If chapter is a number, compare directly
      if (typeof e.chapter === 'number') {
        return e.chapter === chapter.id;
      }
      
      // If chapter is an object with id property
      if (typeof e.chapter === 'object' && e.chapter !== null && 'id' in e.chapter) {
        return e.chapter.id === chapter.id;
      }
      
      return false;
    });
    
    const entries: TimelineEntry[] = chapterEvents.map(event => transformEntry(event));

    const startDate = new Date(chapter.start_date);
    const endDate = chapter.end_date ? new Date(chapter.end_date) : new Date();

    return {
      id: chapter.id,
      type: 'period',
      title: chapter.title,
      dateRange: formatDateRange(startDate, endDate),
      startDate,
      endDate,
      collapsed: chapter.collapsed || false,
      entries: entries.sort((a, b) => a.date.getTime() - b.date.getTime()),
    };
  });

  // Handle uncategorized events
  const uncategorizedEvents = events.filter(e => {
    // Has a chapter - not uncategorized
    if (e.chapter) {
      if (typeof e.chapter === 'number' || (typeof e.chapter === 'object' && e.chapter !== null)) {
        return false;
      }
    }
    
    // Has a branch - not uncategorized
    if (e.branch) {
      if (typeof e.branch === 'number' || (typeof e.branch === 'object' && e.branch !== null)) {
        return false;
      }
    }
    
    return true;
  });

  if (uncategorizedEvents.length > 0) {
    const uncategorizedEntries: TimelineEntry[] = uncategorizedEvents.map(event => transformEntry(event));
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

  // Build branches
  const transformedBranches: TimelineBranch[] = branches.map(branch => {
    const branchPeriodsData = chapters.filter(c => {
      if (c.type !== 'branch_period') return false;
      if (!c.parent_branch) return false;
      
      if (typeof c.parent_branch === 'number') {
        return c.parent_branch === branch.id;
      }
      
      if (typeof c.parent_branch === 'object' && c.parent_branch !== null && 'id' in c.parent_branch) {
        return c.parent_branch.id === branch.id;
      }
      
      return false;
    });
    
    const branchPeriods: TimelinePeriod[] = branchPeriodsData.map(period => {
      const periodEvents = events.filter(e => {
        if (!e.chapter) return false;
        
        if (typeof e.chapter === 'number') {
          return e.chapter === period.id;
        }
        
        if (typeof e.chapter === 'object' && e.chapter !== null && 'id' in e.chapter) {
          return e.chapter.id === period.id;
        }
        
        return false;
      });
      
      const periodEntries = periodEvents.map(e => transformEntry(e));
      
      return {
        id: period.id,
        type: 'period',
        title: period.title,
        startDate: new Date(period.start_date),
        endDate: period.end_date ? new Date(period.end_date) : new Date(),
        dateRange: formatDateRange(new Date(period.start_date), period.end_date ? new Date(period.end_date) : new Date()),
        collapsed: period.collapsed || false,
        entries: periodEntries.sort((a, b) => a.date.getTime() - b.date.getTime())
      };
    });
    
    const directBranchEvents = events.filter(e => {
      if (!e.branch) return false;
      if (e.chapter) return false;
      
      if (typeof e.branch === 'number') {
        return e.branch === branch.id;
      }
      
      if (typeof e.branch === 'object' && e.branch !== null && 'id' in e.branch) {
        return e.branch.id === branch.id;
      }
      
      return false;
    });
    
    const directBranchEntries = directBranchEvents.map(e => transformEntry(e));
    
    let sourceEntryId: string | number | undefined;
    
    if (branch.source_entry) {
      const sourceId = typeof branch.source_entry === 'object' && branch.source_entry !== null && 'id' in branch.source_entry
        ? branch.source_entry.id
        : branch.source_entry;
      sourceEntryId = sourceId;
    } else if (branch.source_chapter) {
      const sourceId = typeof branch.source_chapter === 'object' && branch.source_chapter !== null && 'id' in branch.source_chapter
        ? branch.source_chapter.id
        : branch.source_chapter;
      sourceEntryId = `period-${sourceId}`;
    }

    let periods: TimelinePeriod[];
    
    if (branchPeriods.length > 0) {
      periods = branchPeriods;
    } else if (directBranchEntries.length > 0) {
      const sortedEntries = directBranchEntries.sort((a, b) => a.date.getTime() - b.date.getTime());
      const earliestDate = sortedEntries[0]?.date || new Date(branch.start_date);
      const latestDate = sortedEntries[sortedEntries.length - 1]?.date || (branch.end_date ? new Date(branch.end_date) : new Date());
      
      periods = [{
        id: `branch-${branch.id}-entries`,
        type: 'period',
        title: 'Entries',
        startDate: earliestDate,
        endDate: latestDate,
        dateRange: formatDateRange(earliestDate, latestDate),
        collapsed: false,
        entries: sortedEntries
      }];
    } else {
      periods = [{
        id: `branch-${branch.id}-default`,
        type: 'period',
        title: 'New Period',
        startDate: new Date(branch.start_date),
        endDate: branch.end_date ? new Date(branch.end_date) : new Date(),
        dateRange: formatDateRange(new Date(branch.start_date), branch.end_date ? new Date(branch.end_date) : new Date()),
        collapsed: false,
        entries: []
      }];
    }

    return {
      id: branch.id,
      name: branch.title,
      color: branch.color || '#3b82f6',
      x: branch.x_position || 0,
      collapsed: branch.collapsed || false,
      sourceEntryId: sourceEntryId,
      periods: periods
    };
  });

  mainTimeline.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return {
    mainTimeline,
    branches: transformedBranches,
  };
}