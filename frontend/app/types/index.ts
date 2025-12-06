// app/types/index.ts
export interface Chapter {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  date: string;
  chapters: number[];
  created_at: string;
  updated_at: string;
}

export interface ChapterFormData {
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  color: string;
}

export interface EventFormData {
  title: string;
  description?: string;
  date: string;
  chapters: number[];
}