export interface TimelineEntry {
  id: string | number;
  title: string;
  date: Date;
  preview: string;
}

export interface TimelinePeriod {
  id: string | number;
  title: string;
  dateRange: string;
  startDate: Date;
  endDate: Date;
  entries: TimelineEntry[];
  collapsed?: boolean;
}

export interface TimelineBranch {
  id: string | number;
  name: string;
  color: string;
  x: number;
  periods: TimelinePeriod[];
  collapsed?: boolean;
}

export interface TimelineData {
  mainTimeline: TimelinePeriod[];
  branches: TimelineBranch[];
}

export interface LifeTimelineProps {
  chapters?: Chapter[];
  events?: Event[];
  refresh?: () => Promise<void>;
  initialData?: any;
}