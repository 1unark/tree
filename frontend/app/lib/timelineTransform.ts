// lib/timelineTransform.ts - FIXED TO MATCH YOUR TYPES
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

// Helper function to parse dates in local timezone (fixes timezone shift issue)
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in JS
}

function transformEntry(event: Event): TimelineEntry {
  return {
    id: event.id,
    date: parseLocalDate(event.date),
    title: event.title,
    preview: event.content ? event.content.substring(0, 100).trim() + (event.content.length > 100 ? '...' : '') : '',
    content: event.content || '',
  };
}

function formatDateRange(startDate: Date, endDate: Date): string {
  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
  const startYear = startDate.getFullYear();
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
  const endYear = endDate.getFullYear();
  
  if (startYear === endYear) {
    if (startMonth === endMonth) {
      return `${startMonth} ${startYear}`;
    }
    return `${startMonth} - ${endMonth} ${startYear}`;
  } else {
    return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
  }
}

export function transformToTimelineData(chapters: Chapter[], events: Event[]): TimelineData {
  const mainPeriods = chapters.filter(c => c.type === 'main_period');
  const branches = chapters.filter(c => c.type === 'branch');

  // Build main timeline
  const mainTimeline: TimelinePeriod[] = mainPeriods.map(chapter => {
    // Get events that belong to this chapter
    const chapterEvents = events.filter(e => e.chapter === chapter.id);
    
    const entries: TimelineEntry[] = chapterEvents.map(event => transformEntry(event));

    const startDate = parseLocalDate(chapter.start_date);
    const endDate = chapter.end_date ? parseLocalDate(chapter.end_date) : new Date();
    
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

  // Sort chapters chronologically by start date (day-level precision)
  mainTimeline.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  // Handle uncategorized events - add AFTER sorting
  // Get all chapter IDs that exist (including branch periods)
  const allChapterIds = new Set(chapters.map(c => c.id));
  
  // Events without a chapter OR with a chapter that doesn't exist
  const uncategorizedEvents = events.filter(e => !e.chapter || !allChapterIds.has(e.chapter));

  if (uncategorizedEvents.length > 0) {
    const uncategorizedEntries: TimelineEntry[] = uncategorizedEvents.map(event => transformEntry(event));
    const sortedEntries = uncategorizedEntries.sort((a, b) => a.date.getTime() - b.date.getTime());
    const earliestDate = sortedEntries[0]?.date || new Date();
    const latestDate = sortedEntries[sortedEntries.length - 1]?.date || new Date();
    
    // Use a far future date for sorting to ensure it appears last
    mainTimeline.push({
      id: 'uncategorized',
      type: 'period',
      title: 'Uncategorized',
      dateRange: formatDateRange(earliestDate, latestDate),
      startDate: new Date(9999, 0, 1), // Far future date for sorting purposes
      endDate: new Date(9999, 11, 31),
      collapsed: false,
      entries: sortedEntries,
    });
  }

  // Build branches
  const transformedBranches: TimelineBranch[] = branches.map(branch => {
    // Get branch periods (chapters that belong to this branch)
    const branchPeriodsData = chapters.filter(c => 
      c.type === 'branch_period' && c.parent_branch === branch.id
    );
    
    const branchPeriods: TimelinePeriod[] = branchPeriodsData.map(period => {
      // Get events that belong to this branch period
      const periodEvents = events.filter(e => e.chapter === period.id);
      const periodEntries = periodEvents.map(e => transformEntry(e));
      
      return {
        id: period.id,
        type: 'period',
        title: period.title,
        startDate: parseLocalDate(period.start_date),
        endDate: period.end_date ? parseLocalDate(period.end_date) : new Date(),
        dateRange: formatDateRange(
          parseLocalDate(period.start_date), 
          period.end_date ? parseLocalDate(period.end_date) : new Date()
        ),
        collapsed: period.collapsed || false,
        entries: periodEntries.sort((a, b) => a.date.getTime() - b.date.getTime())
      };
    });
    
    // Sort branch periods chronologically by start date (day-level precision)
    branchPeriods.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    // Get events directly assigned to the branch (chapter points to the branch itself)
    const directBranchEvents = events.filter(e => e.chapter === branch.id);
    const directBranchEntries = directBranchEvents.map(e => transformEntry(e));
    
    // Determine source for the branch connection line
    let sourceEntryId: string | number | undefined;
    const branchAny = branch as any;
    
    if (branchAny.source_entry) {
      sourceEntryId = branchAny.source_entry;
    } else if (branchAny.source_chapter) {
      sourceEntryId = `period-${branchAny.source_chapter}`;
    }

    // Build periods array
    let periods: TimelinePeriod[];
    
    if (branchPeriods.length > 0) {
      // Has explicit branch periods
      periods = branchPeriods;
    } else if (directBranchEntries.length > 0) {
      // Has events directly in the branch - create a default period for them
      const sortedEntries = directBranchEntries.sort((a, b) => a.date.getTime() - b.date.getTime());
      const earliestDate = sortedEntries[0]?.date || parseLocalDate(branch.start_date);
      const latestDate = sortedEntries[sortedEntries.length - 1]?.date || (branch.end_date ? parseLocalDate(branch.end_date) : new Date());
      
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
      // Empty branch - create a default period
      periods = [{
        id: `branch-${branch.id}-default`,
        type: 'period',
        title: 'New Period',
        startDate: parseLocalDate(branch.start_date),
        endDate: branch.end_date ? parseLocalDate(branch.end_date) : new Date(),
        dateRange: formatDateRange(
          parseLocalDate(branch.start_date), 
          branch.end_date ? parseLocalDate(branch.end_date) : new Date()
        ),
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

  return {
    mainTimeline,
    branches: transformedBranches,
  };
}