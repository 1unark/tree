export interface Chapter {
  id: number;
  type: 'main_period' | 'branch' | 'branch_period';
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  color: string;
  x_position?: number;
  parent_branch?: number;
  collapsed: boolean;
  order: number;
  entries?: Event[];
  periods?: Chapter[];
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  preview?: string;
  content?: string;
  date: string;
  chapter?: number;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface ChapterFormData {
  type: 'main_period' | 'branch' | 'branch_period';
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  color: string;
  x_position?: number;
  parent_branch?: number;
  collapsed?: boolean;
  order?: number;
}

export interface EventFormData {
  title: string;
  description?: string;
  preview?: string;
  content?: string;
  date: string;
  chapter?: number;
  order?: number;
}