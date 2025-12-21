// types/timeline.types.ts
import { Chapter, Event } from '@/types';

export interface TimelineEntry {
  id: string | number;
  date: Date;
  title: string;
  preview: string;
  content: string;
}

export interface TimelinePeriod {
  id: string | number;
  type: string;
  title: string;
  dateRange: string;
  startDate: Date;
  endDate: Date;
  collapsed: boolean;
  entries: TimelineEntry[];
}

export interface TimelineBranch {
  id: number;
  name: string;
  x: number;
  collapsed: boolean;
  color: string;
  periods: TimelinePeriod[];
  sourceEntryId?: string | number; // Track which entry this branch came from
}

export interface TimelineData {
  mainTimeline: TimelinePeriod[];
  branches: TimelineBranch[];
}

export interface DragState {
  type: 'branch' | 'creating-branch' | null;
  id?: number;
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

export interface EventFormData {
  title: string;
  date: string;
  content?: string;
  description?: string;
  preview?: string;
  chapter?: number;
}