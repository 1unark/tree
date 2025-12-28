// lib/timelineTransform.ts
import { Chapter, Event } from '@/types';
import { TimelineData, TimelinePeriod, TimelineBranch, TimelineEntry } from '@/components/types/timeline.types';

export function transformToTimelineData(chapters: Chapter[], events: Event[]): TimelineData {
  // Separate main timeline periods from branches
  const mainPeriods = chapters.filter(c => c.type === 'main_period' && !c.parent_branch);
  const branches = chapters.filter(c => c.type === 'branch' && !c.parent_branch);
  
  // Transform main timeline periods
  const mainTimeline: TimelinePeriod[] = mainPeriods.map(period => {
    const periodEvents = events.filter(e => e.chapter === period.id);
    
    return {
      id: period.id,
      title: period.content?.title || `Period ${period.id}`,
      startDate: new Date(period.start_date),
      endDate: new Date(period.end_date || period.start_date),
      dateRange: formatDateRange(new Date(period.start_date), new Date(period.end_date || period.start_date)),
      collapsed: period.collapsed || false,
      entries: periodEvents.map(event => transformEvent(event))
    };
  });

  // Transform branches
  const transformedBranches: TimelineBranch[] = branches.map(branch => {
    // Get all periods that belong to this branch
    const branchPeriods = chapters.filter(c => 
      c.type === 'branch_period' && c.parent_branch === branch.id
    );
    
    return {
      id: branch.id,
      name: branch.content?.name || branch.content?.title || `Branch ${branch.id}`,
      color: branch.color || '#3b82f6',
      x: branch.x_position || 0,
      collapsed: branch.collapsed || false,
      periods: branchPeriods.map(period => {
        const periodEvents = events.filter(e => e.chapter === period.id);
        
        return {
          id: period.id,
          title: period.content?.title || `Period ${period.id}`,
          startDate: new Date(period.start_date),
          endDate: new Date(period.end_date || period.start_date),
          dateRange: formatDateRange(new Date(period.start_date), new Date(period.end_date || period.start_date)),
          collapsed: period.collapsed || false,
          entries: periodEvents.map(event => transformEvent(event))
        };
      })
    };
  });

  return {
    mainTimeline,
    branches: transformedBranches
  };
}

function transformEvent(event: Event): TimelineEntry {
  return {
    id: event.id,
    date: new Date(event.date),
    title: event.content?.title || `Event ${event.id}`,
    preview: event.content?.preview || event.content?.description || 'No description',
    content: event.content?.content || event.content?.description || '',
    tags: event.content?.tags || []
  };
}

function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  
  if (startStr === endStr) return startStr;
  return `${startStr} - ${endStr}`;
}