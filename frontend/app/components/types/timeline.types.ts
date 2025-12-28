// components/timeline/types/timeline.types.ts - UPDATE THIS
export interface TimelineBranch {
  id: string | number;
  name: string;
  color: string;
  x: number;
  collapsed: boolean;
  sourceEntryId?: string | number; // ID of entry or "period-{id}" for chapter
  periods: TimelinePeriod[];
  directEntries?: TimelineEntry[]; // Entries directly in branch without period
}

export interface TimelineEntry {
  id: string | number;
  title: string;
  date: Date;
  content: string;
  dateText: string;
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