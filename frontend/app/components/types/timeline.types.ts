// components/timeline/types/timeline.types.ts
import { Chapter, Event } from '@/types';

export interface TimelineBranch {
  id: string | number;
  name: string;
  color: string;
  x: number;
  collapsed: boolean;
  sourceEntryId?: string | number;
  periods: TimelinePeriod[];
  directEntries?: TimelineEntry[];
}

export interface TimelineEntry {
  id: string | number;
  title: string;
  date: Date;
  content: string;
  dateText: string;
  preview: string;  // Made required to match Sidebar expectations
}

export interface TimelinePeriod {
  id: string | number;
  title: string;
  startDate: Date;
  endDate: Date;
  dateRange: string;
  collapsed: boolean;
  entries: TimelineEntry[];
}

export interface TimelineData {
  mainTimeline: TimelinePeriod[];
  branches: TimelineBranch[];
}

export interface DragState {
  type: 'branch' | 'creating-branch' | null;
  id?: string | number;
  offsetX?: number;
  sourceEntryId?: string | number;
  startX?: number;
  startY?: number;
  currentX?: number;
  currentY?: number;
}

export interface LifeTimelineProps {
  chapters?: Chapter[];
  events?: Event[];
  refresh?: () => Promise<void>;
  initialData?: TimelineData | null;
}