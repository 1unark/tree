import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
import { Chapter, Event, EventFormData } from '@/types';
import { transformToTimelineData } from '@/lib/timelineTransform';
import TimelineSidebar from './TimelineSidebar';
import { useEventActions } from '@/hooks/useEventActions';
import { useTimeline } from '@/hooks/useTimeline';

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
}

// TEST DATA - COMMENTED OUT - Now using backend API
/* const sampleData = {
  mainTimeline: [
    { 
      id: 'period-childhood',
      type: 'period',
      title: 'Childhood',
      dateRange: '2000 - 2005',
      startDate: new Date(2000, 0, 1),
      endDate: new Date(2005, 8, 1),
      collapsed: false,
      entries: [
        { 
          id: 'm1', 
          date: new Date(2000, 0, 1), 
          title: "Born", 
          preview: "Entered the world on a cold January morning...",
          content: "Entered the world on a cold January morning. Mom says I came three weeks early."
        },
        { 
          id: 'm1a', 
          date: new Date(2001, 3, 12), 
          title: "First Steps", 
          preview: "Took my first wobbly steps...",
          content: "Took my first wobbly steps across the living room. Dad caught it on camera."
        },
        { 
          id: 'm2', 
          date: new Date(2002, 5, 15), 
          title: "First Words", 
          preview: "Started talking, said 'dada' first...",
          content: "Started talking, said 'dada' first much to mom's dismay."
        },
        { 
          id: 'm2a', 
          date: new Date(2003, 7, 8), 
          title: "Beach Vacation", 
          preview: "First time seeing the ocean...",
          content: "First time seeing the ocean. Built sandcastles all day with dad."
        },
        { 
          id: 'm3', 
          date: new Date(2004, 8, 1), 
          title: "First Day of Preschool", 
          preview: "Walked into Mrs. Johnson's classroom...",
          content: "Walked into Mrs. Johnson's classroom with my Spider-Man backpack. Made my first friend - Tommy."
        },
        { 
          id: 'm3a', 
          date: new Date(2005, 2, 20), 
          title: "Learned to Ride a Bike", 
          preview: "Dad took the training wheels off...",
          content: "Dad took the training wheels off. Crashed twice but then I got it!"
        },
      ]
    },
    { 
      id: 'period-education',
      type: 'period',
      title: 'School Years',
      dateRange: '2005 - 2016',
      startDate: new Date(2005, 8, 1),
      endDate: new Date(2016, 5, 15),
      collapsed: false,
      entries: [

        { 
          id: 'm4a', 
          date: new Date(2006, 3, 15), 
          title: "Science Fair Win", 
          preview: "My volcano project won first place...",
          content: "My volcano project won first place. Mom helped me build it in the garage."
        },
        { 
          id: 'm4b', 
          date: new Date(2007, 10, 8), 
          title: "Joined Soccer Team", 
          preview: "First organized sport...",
          content: "First organized sport. I was terrible but had so much fun."
        },


        { 
          id: 'm5b', 
          date: new Date(2010, 5, 20), 
          title: "Band Concert", 
          preview: "Played trumpet in my first concert...",
          content: "Played trumpet in my first concert. Hit most of the right notes."
        },
        { 
          id: 'm6', 
          date: new Date(2011, 8, 1), 
          title: "High School Begins", 
          preview: "Freshman year. Walking through those doors...",
          content: "Freshman year. Walking through those doors was terrifying and exhilarating."
        },
        { 
          id: 'm6a', 
          date: new Date(2012, 1, 10), 
          title: "Made Varsity Team", 
          preview: "As a sophomore, huge accomplishment...",
          content: "As a sophomore, huge accomplishment. Coach believed in me."
        },

      ]
    },
    { 
      id: 'period-adult',
      type: 'period',
      title: 'Adult Life',
      dateRange: '2016 - Present',
      startDate: new Date(2016, 6, 1),
      endDate: new Date(2024, 11, 31),
      collapsed: false,
      entries: [
        { 
          id: 'm8', 
          date: new Date(2016, 6, 1), 
          title: "First Real Job", 
          preview: "Started as a junior developer...",
          content: "Started as a junior developer at TechCorp. Imposter syndrome hit hard."
        },
        { 
          id: 'm8a', 
          date: new Date(2017, 0, 15), 
          title: "First Apartment", 
          preview: "Moved out of my parents' house...",
          content: "Moved into my own place and spent a lot of time moving my stuff in. It was my first time living somewhere other than my childhood home and felt pretty crazy."
        },
        { 
          id: 'm8b', 
          date: new Date(2017, 8, 22), 
          title: "Completed First Marathon", 
          preview: "26.2 miles, finished in 4:32...",
          content: "26.2 miles, finished in 4:32. Trained for 6 months. Legs hurt for a week."
        },
        { 
          id: 'm9', 
          date: new Date(2018, 7, 20), 
          title: "Got Married", 
          preview: "Best day of my life. Sarah looked stunning...",
          content: "Best day of my life. Sarah looked stunning. Vows under the oak tree, everyone cried."
        },
        { 
          id: 'm9a', 
          date: new Date(2019, 2, 10), 
          title: "Honeymoon in Japan", 
          preview: "Two weeks exploring Tokyo and Kyoto...",
          content: "Two weeks exploring Tokyo and Kyoto. Amazing food, beautiful temples."
        },
        { 
          id: 'm9b', 
          date: new Date(2019, 9, 5), 
          title: "Bought First House", 
          preview: "3 bed, 2 bath with a yard...",
          content: "3 bed, 2 bath with a yard. The mortgage is scary but it's ours."
        },
        { 
          id: 'm9c', 
          date: new Date(2020, 2, 15), 
          title: "Pandemic Lockdown", 
          preview: "World changed overnight...",
          content: "World changed overnight. Working from home, everything uncertain."
        },
        { 
          id: 'm9d', 
          date: new Date(2021, 5, 20), 
          title: "Adopted Max", 
          preview: "Got a golden retriever puppy...",
          content: "Got a golden retriever puppy at the animal shelter. Hes so cute and loves to run outside"
        },
        { 
          id: 'm10', 
          date: new Date(2022, 2, 10), 
          title: "Became a Parent", 
          preview: "Lily was born at 3:47 AM...",
          content: "Lily was born at 3:47 AM. 7 pounds, 3 ounces. My entire world shifted."
        },
        { 
          id: 'm10a', 
          date: new Date(2023, 7, 15), 
          title: "Lily's First Birthday", 
          preview: "Can't believe a year has passed...",
          content: "Can't believe a year has passed. She's walking now. Time flies."
        },
        { 
          id: 'm10b', 
          date: new Date(2024, 4, 8), 
          title: "Family Trip to Disney", 
          preview: "Lily's first big vacation...",
          content: "Lily's first big vacation. Her face when she saw the castle was priceless."
        },
      ]
    },
  ],
  branches: [
    {
      id: 1,
      name: "Career",
      x: 720,
      collapsed: false,
      color: "#3b82f6",
      periods: [
        {
          id: 'career-early',
          title: 'Early Career',
          dateRange: '2016 - 2020',
          startDate: new Date(2016, 6, 1),
          endDate: new Date(2020, 0, 1),
          collapsed: false,
          entries: [
            { 
              id: 18, 
              date: new Date(2016, 6, 1), 
              title: "First Job at TechCorp", 
              preview: "Junior developer role...",
              content: "Junior developer role. Terrified but excited. First PR took 6 hours."
            },
            { 
              id: '18a', 
              date: new Date(2016, 9, 10), 
              title: "Completed Onboarding", 
              preview: "Finally felt like part of the team...",
              content: "Finally felt like part of the team. Got my first real project assignment."
            },
            { 
              id: 19, 
              date: new Date(2017, 2, 15), 
              title: "First Production Deploy", 
              preview: "Pushed code that affected real users...",
              content: "Pushed code that affected real users. Hands shaking, watched metrics for an hour."
            },
            { 
              id: '19a', 
              date: new Date(2017, 6, 20), 
              title: "Won Hackathon", 
              preview: "24-hour internal competition...",
              content: "24-hour internal competition. Our team built a cool internal tool. Got company-wide recognition."
            },
            { 
              id: '19b', 
              date: new Date(2017, 10, 5), 
              title: "First Conference Talk", 
              preview: "Spoke at local dev meetup...",
              content: "Spoke at local dev meetup. Super nervous but it went well."
            },
            { 
              id: 20, 
              date: new Date(2018, 2, 1), 
              title: "Promoted to Senior", 
              preview: "Finally felt like I knew what I was doing...",
              content: "Finally felt like I knew what I was doing. Leading projects, mentoring juniors."
            },
            { 
              id: '20a', 
              date: new Date(2018, 8, 12), 
              title: "Led Major Feature Launch", 
              preview: "First time owning an entire feature...",
              content: "First time owning an entire feature. Shipped on time and under budget."
            },
            { 
              id: '20b', 
              date: new Date(2019, 3, 8), 
              title: "Mentored First Junior", 
              preview: "Started mentoring Alex...",
              content: "Started mentoring Alex. Reminded me how much I've grown."
            },
            { 
              id: '20c', 
              date: new Date(2019, 10, 15), 
              title: "Got Industry Certification", 
              preview: "Passed AWS Solutions Architect exam...",
              content: "Passed AWS Solutions Architect exam. Studied for 3 months."
            },
          ]
        },
        {
          id: 'career-growth',
          title: 'Growth Phase',
          dateRange: '2020 - 2024',
          startDate: new Date(2020, 0, 1),
          endDate: new Date(2024, 11, 31),
          collapsed: false,
          entries: [
            { 
              id: 22, 
              date: new Date(2020, 0, 1), 
              title: "Joined a Startup", 
              preview: "Left the comfort of BigCorp...",
              content: "Left BigCorp for a 20-person startup. Risky but wanted something meaningful."
            },
            { 
              id: '22a', 
              date: new Date(2020, 5, 10), 
              title: "Helped Raise Series A", 
              preview: "Company secured $5M funding...",
              content: "Company secured $5M funding. My technical demos helped close investors."
            },
            { 
              id: '22b', 
              date: new Date(2020, 9, 22), 
              title: "Built Core Platform", 
              preview: "Architected and built our main product...",
              content: "Architected and built our main product. Months of work but so rewarding."
            },
            { 
              id: 23, 
              date: new Date(2021, 5, 15), 
              title: "Became Tech Lead", 
              preview: "Leading a team of 5 engineers...",
              content: "Leading a team of 5 engineers. First time managing people. So different from coding."
            },
            { 
              id: '23a', 
              date: new Date(2021, 10, 8), 
              title: "Hired First Team Member", 
              preview: "Ran interview process, made my first hire...",
              content: "Ran interview process, made my first hire. Big responsibility."
            },
            { 
              id: '23b', 
              date: new Date(2022, 4, 20), 
              title: "Launched Product V2", 
              preview: "Complete redesign and rewrite...",
              content: "Complete redesign and rewrite. Team worked incredibly hard. Users loved it."
            },
            { 
              id: '23c', 
              date: new Date(2023, 1, 12), 
              title: "Spoke at TechConf", 
              preview: "Keynote at major industry conference...",
              content: "Keynote at major industry conference. 500 people in the audience."
            },
            { 
              id: '23d', 
              date: new Date(2023, 8, 5), 
              title: "Promoted to Engineering Manager", 
              preview: "Now managing 12 people across 3 teams...",
              content: "Now managing 12 people across 3 teams. Less coding, more strategy."
            },
            { 
              id: '23e', 
              date: new Date(2024, 3, 18), 
              title: "Company Hit Profitability", 
              preview: "First profitable quarter...",
              content: "First profitable quarter. All the hard work paying off."
            },
          ]
        },
      ]
    },
    {
      id: 2,
      name: "Relationships",
      x: 1020,
      collapsed: false,
      color: "#ec4899",
      periods: [
        {
          id: 'rel-dating',
          title: 'Dating Years',
          dateRange: '2014 - 2018',
          startDate: new Date(2014, 0, 1),
          endDate: new Date(2018, 7, 20),
          collapsed: false,
          entries: [
            { 
              id: 26, 
              date: new Date(2014, 8, 5), 
              title: "First Serious Relationship", 
              preview: "Met Emma in college...",
              content: "Met Emma in college. Dated for 2 years but we wanted different things."
            },
            { 
              id: 27, 
              date: new Date(2016, 10, 15), 
              title: "Breakup and Growth", 
              preview: "Emma and I parted ways...",
              content: "Emma and I parted ways. Hurt but learned so much about myself."
            },
            { 
              id: 28, 
              date: new Date(2017, 4, 10), 
              title: "Met Sarah", 
              preview: "Coffee shop on a rainy Tuesday...",
              content: "Coffee shop on a rainy Tuesday. She was reading my favorite book. Talked for three hours."
            },
            { 
              id: '28a', 
              date: new Date(2017, 6, 22), 
              title: "First Road Trip Together", 
              preview: "Weekend getaway to the mountains...",
              content: "Weekend getaway to the mountains. Got lost but had the best time."
            },
            { 
              id: '28b', 
              date: new Date(2017, 9, 30), 
              title: "Met Her Parents", 
              preview: "Sunday dinner, so nervous...",
              content: "Sunday dinner, so nervous. They were so warm and welcoming."
            },

          ]
        },
        {
          id: 'rel-family',
          title: 'Family Life',
          dateRange: '2018 - Present',
          startDate: new Date(2018, 7, 20),
          endDate: new Date(2024, 11, 31),
          collapsed: false,
          entries: [
            { 
              id: 30, 
              date: new Date(2018, 7, 20), 
              title: "Wedding Day", 
              preview: "Under the oak tree. 80 guests...",
              content: "Under the oak tree. 80 guests. Perfect weather. Hands shaking during vows."
            },
            { 
              id: '30a', 
              date: new Date(2019, 7, 20), 
              title: "First Anniversary", 
              preview: "Weekend at a bed and breakfast...",
              content: "Weekend at a bed and breakfast. Reflected on our first year together."
            },
            { 
              id: '30b', 
              date: new Date(2020, 11, 25), 
              title: "Found Out We're Expecting", 
              preview: "Two pink lines. Pure joy and terror...",
              content: "Two pink lines. Pure joy and terror. We're going to be parents!"
            },
            { 
              id: '30c', 
              date: new Date(2021, 4, 10), 
              title: "Nursery Setup", 
              preview: "Spent weeks painting and decorating...",
              content: "Spent weeks painting and decorating. Pale yellow walls with animal decals."
            },
            { 
              id: '30d', 
              date: new Date(2021, 9, 8), 
              title: "Baby Shower", 
              preview: "Friends and family celebrated with us...",
              content: "Friends and family celebrated with us. So many gifts and so much love."
            },
            { 
              id: 31, 
              date: new Date(2022, 2, 10), 
              title: "Lily is Born", 
              preview: "3:47 AM. Everything changed...",
              content: "3:47 AM. Everything changed. She's perfect. I'm a father now."
            },
            { 
              id: '31a', 
              date: new Date(2022, 5, 15), 
              title: "First Night's Sleep", 
              preview: "Lily slept through the night...",
              content: "Lily slept through the night for the first time. We actually got rest!"
            },
            { 
              id: '31b', 
              date: new Date(2022, 8, 8), 
              title: "Lily's First Word", 
              preview: "She said 'dada'...",
              content: "She said 'dada'. Sarah pretended to be annoyed but we were both thrilled."
            },
            { 
              id: '31c', 
              date: new Date(2023, 1, 20), 
              title: "Family Photos", 
              preview: "Professional shoot, all three of us...",
              content: "Professional shoot, all three of us. Lily wouldn't stop moving but got some great shots."
            },
            { 
              id: '31d', 
              date: new Date(2024, 0, 1), 
              title: "Lily's First Steps", 
              preview: "She walked across the living room...",
              content: "She walked across the living room to me. We both cried happy tears."
            },
          ]
        },
      ]
    },
    {
      id: 3,
      name: "Hobbies & Travel",
      x: 1320,
      collapsed: false,
      color: "#10b981",
      periods: [
        {
          id: 'hobby-early',
          title: 'Adventures',
          dateRange: '2015 - 2020',
          startDate: new Date(2015, 0, 1),
          endDate: new Date(2020, 0, 1),
          collapsed: false,
          entries: [
            { 
              id: 40, 
              date: new Date(2015, 5, 15), 
              title: "Backpacked Europe", 
              preview: "Summer after junior year...",
              content: "Summer after junior year. 6 countries, 8 weeks. Life-changing experience."
            },
            { 
              id: 41, 
              date: new Date(2016, 8, 20), 
              title: "Started Photography", 
              preview: "Bought my first DSLR...",
              content: "Bought my first DSLR. Been capturing moments ever since."
            },
            { 
              id: 42, 
              date: new Date(2017, 6, 10), 
              title: "Learned to Surf", 
              preview: "California coast, two week trip...",
              content: "California coast, two week trip. Fell off the board 100 times but finally stood up."
            },
            { 
              id: 43, 
              date: new Date(2018, 3, 5), 
              title: "Climbed First Mountain", 
              preview: "Mt. Washington in New Hampshire...",
              content: "Mt. Washington in New Hampshire. Tough hike but incredible views."
            },
            { 
              id: 44, 
              date: new Date(2019, 1, 14), 
              title: "Started Book Club", 
              preview: "Monthly meetings with friends...",
              content: "Monthly meetings with friends. Currently on our 60th book."
            },
          ]
        },
        {
          id: 'hobby-present',
          title: 'Current Pursuits',
          dateRange: '2020 - Present',
          startDate: new Date(2020, 0, 1),
          endDate: new Date(2024, 11, 31),
          collapsed: false,
          entries: [
            { 
              id: 45, 
              date: new Date(2020, 4, 1), 
              title: "Started Woodworking", 
              preview: "Built a workbench in the garage...",
              content: "Built a workbench in the garage. New pandemic hobby. Very therapeutic."
            },
            { 
              id: 46, 
              date: new Date(2021, 7, 15), 
              title: "Ran First Half Marathon", 
              preview: "13.1 miles, finished strong...",
              content: "13.1 miles, finished strong. Training for a full marathon next."
            },
            { 
              id: 47, 
              date: new Date(2022, 9, 10), 
              title: "Learned to Cook", 
              preview: "Taking cooking classes...",
              content: "Taking cooking classes. Can now make a decent risotto."
            },
            { 
              id: 48, 
              date: new Date(2023, 6, 20), 
              title: "Built Lily's Treehouse", 
              preview: "Spent a month building in the backyard...",
              content: "Spent a month building in the backyard. She loves her special place."
            },
            { 
              id: 49, 
              date: new Date(2024, 2, 8), 
              title: "Started Podcasting", 
              preview: "Tech talk show with a friend...",
              content: "Tech talk show with a friend. 10 episodes in, small but growing audience."
            },
          ]
        },
      ]
    },
  ]
}; */

interface LifeTimelineProps {
  chapters?: Chapter[];
  events?: Event[];
  refresh?: () => Promise<void>;
  initialData?: any; // For backward compatibility
}

export default function LifeTimeline({ chapters: chaptersProp = [], events: eventsProp = [], refresh: refreshProp, initialData = null }: LifeTimelineProps) {
  // Use hook if props not provided, otherwise use props
  const timelineHook = useTimeline();
  const chapters = chaptersProp.length > 0 ? chaptersProp : timelineHook.chapters;
  const events = eventsProp.length > 0 ? eventsProp : timelineHook.events;
  
  // Use provided refresh or hook's refresh
  const refresh = refreshProp || timelineHook.refresh;
  
  const { createEvent, updateEvent, deleteEvent } = useEventActions(refresh);
  // Transform API data to timeline format
  const transformedData = useMemo(() => {
    if (initialData) {
      return initialData; // Use initialData if provided (for backward compatibility)
    }
    if (chapters.length > 0 || events.length > 0) {
      return transformToTimelineData(chapters, events);
    }
    // Fallback to empty data structure
    return {
      mainTimeline: [],
      branches: [],
    };
  }, [chapters, events, initialData]);

  const [data, setData] = useState(transformedData);
  const [dragging, setDragging] = useState<number | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<string | number | null>(null);
  const [stickyPeriod, setStickyPeriod] = useState<any>(null);
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);
  const [createEntryDate, setCreateEntryDate] = useState<Date | undefined>(undefined);
  const [createEntryChapterId, setCreateEntryChapterId] = useState<number | undefined>(undefined);
  const svgRef = useRef<SVGSVGElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update data when chapters/events change
  useEffect(() => {
    const newData = transformToTimelineData(chapters, events);
    setData(newData);
  }, [chapters, events]);

  const handleEventSubmit = async (formData: EventFormData) => {
    try {
      if (isCreatingEntry) {
        await createEvent(formData);
        setIsCreatingEntry(false);
        setCreateEntryDate(undefined);
        setCreateEntryChapterId(undefined);
        // Force refresh by calling refresh directly
        await refresh();
      } else if (expandedEntry) {
      // Find the event ID from expanded entry
      let eventId: number | null = null;
      data.mainTimeline.forEach((period: TimelinePeriod) => {
        const found = period.entries.find((e: TimelineEntry) => e.id === expandedEntry);
        if (found && typeof found.id === 'number') eventId = found.id;
      });
      data.branches.forEach((branch: TimelineBranch) => {
        branch.periods.forEach((period: TimelinePeriod) => {
          const found = period.entries.find((e: TimelineEntry) => e.id === expandedEntry);
          if (found && typeof found.id === 'number') eventId = found.id;
        });
      });
      if (eventId) {
        await updateEvent(eventId, formData);
        await refresh();
      }
    }
    } catch (error) {
      console.error('Error submitting event:', error);
    }
  };

  const handleDeleteEntry = async (entryId: string | number) => {
    if (typeof entryId === 'number') {
      await deleteEvent(entryId);
      setExpandedEntry(null);
    }
  };

  const handleCancelSidebar = () => {
    if (isCreatingEntry) {
      setIsCreatingEntry(false);
      setCreateEntryDate(undefined);
      setCreateEntryChapterId(undefined);
    } else {
      setExpandedEntry(null);
    }
  };

  // Find chapter for an entry
  const findEntryChapter = (entryId: string | number): number | undefined => {
    if (typeof entryId === 'number') {
      const event = events.find(e => e.id === entryId);
      if (event && event.chapter) {
        return typeof event.chapter === 'number' ? event.chapter : event.chapter;
      }
    }
    return undefined;
  };

  const spineX = 330;
  const entryHeight = 72;
  const periodHeaderHeight = 45;
  const periodGap = 48;
  const startY = 10;
  const branchMinSpacing = 400;

  const calculateLayout = () => {
    let currentY = startY;
    const positions = new Map();

    data.mainTimeline.forEach(period => {
      positions.set(`period-${period.id}`, currentY);
      currentY += periodHeaderHeight;

      if (!period.collapsed) {
        period.entries.forEach(entry => {
          positions.set(`entry-${entry.id}`, currentY);
          currentY += entryHeight;
        });
      }

      currentY += periodGap;
    });

    // Ensure minimum height for empty timeline - at least viewport height
    const minHeight = Math.max(currentY + 100, typeof window !== 'undefined' ? window.innerHeight : 800);
    return { positions, totalHeight: minHeight };
  };

  const { positions, totalHeight } = calculateLayout();

  const handleTimelineClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (dragging) return; // Don't create entry while dragging
    
    const svg = svgRef.current;
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    const scrollTop = scrollContainerRef.current?.scrollTop || 0;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top + scrollTop;
    
    // Check if click is on spine (main timeline) or empty space
    if (Math.abs(x - spineX) < 100) {
      // Find which period this Y position corresponds to
      let clickedDate: Date | undefined;
      let clickedChapterId: number | undefined;
      
      data.mainTimeline.forEach((period: TimelinePeriod) => {
        const periodY = positions.get(`period-${period.id}`);
        if (periodY && y >= periodY - 20 && y <= periodY + 200) {
          // Clicked on a period - create entry for that period
          clickedChapterId = chapters.find(c => c.id === period.id)?.id;
          // Estimate date based on Y position within period
          const periodStart = period.startDate.getTime();
          const periodEnd = period.endDate.getTime();
          const periodDuration = periodEnd - periodStart;
          const clickOffset = y - periodY;
          const periodHeight = periodHeaderHeight + (period.collapsed ? 0 : period.entries.length * entryHeight) + periodGap;
          const ratio = Math.max(0, Math.min(1, clickOffset / Math.max(periodHeight, 100)));
          clickedDate = new Date(periodStart + ratio * periodDuration);
        }
      });
      
      if (clickedDate || clickedChapterId) {
        setCreateEntryDate(clickedDate || new Date());
        setCreateEntryChapterId(clickedChapterId);
        setIsCreatingEntry(true);
        setExpandedEntry(null);
      } else {
        // Clicked on empty space - create with current date
        setCreateEntryDate(new Date());
        setCreateEntryChapterId(undefined);
        setIsCreatingEntry(true);
        setExpandedEntry(null);
      }
    } else {
      // Click anywhere on the timeline to create
      setCreateEntryDate(new Date());
      setCreateEntryChapterId(undefined);
      setIsCreatingEntry(true);
      setExpandedEntry(null);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      
      const scrollTop = scrollContainerRef.current.scrollTop;
      let currentPeriod = null;
      
      for (const period of data.mainTimeline) {
        const periodY = positions.get(`period-${period.id}`);
        if (periodY && scrollTop + 64 >= periodY - 20) {
          currentPeriod = period;
        }
      }
      
      setStickyPeriod(currentPeriod);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [data.mainTimeline]);

  const toggleMainPeriod = (periodId) => {
    setData(prev => {
      const period = prev.mainTimeline.find(p => p.id === periodId);
      const newCollapsed = !period.collapsed;
      
      return {
        ...prev,
        mainTimeline: prev.mainTimeline.map(p => 
          p.id === periodId ? { ...p, collapsed: newCollapsed } : p
        ),
        branches: prev.branches.map(branch => ({
          ...branch,
          periods: branch.periods.map(branchPeriod => {
            const periodInRange = branchPeriod.startDate >= period.startDate && 
                                 branchPeriod.startDate <= period.endDate;
            
            if (periodInRange) {
              return { ...branchPeriod, collapsed: newCollapsed };
            }
            return branchPeriod;
          })
        }))
      };
    });
  };

  const toggleBranchPeriod = (branchId, periodId) => {
    setData(prev => ({
      ...prev,
      branches: prev.branches.map(b => 
        b.id === branchId ? {
          ...b,
          periods: b.periods.map(p => 
            p.id === periodId ? { ...p, collapsed: !p.collapsed } : p
          )
        } : b
      )
    }));
  };

  const toggleBranch = (branchId) => {
    setData(prev => ({
      ...prev,
      branches: prev.branches.map(b => 
        b.id === branchId ? { ...b, collapsed: !b.collapsed } : b
      )
    }));
  };

  useEffect(() => {
    // Auto-space branches on mount
    if (data.branches.length > 0) {
        const startX = spineX + 300;
        setData(prev => ({
        ...prev,
        branches: prev.branches.map((branch, idx) => ({
            ...branch,
            x: startX + (idx * branchMinSpacing)
        }))
        }));
    }
  }, []); // Only run once on mount

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !svgRef.current) return;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const newX = e.clientX - rect.left;
    
    // More permissive limits - just keep it visible on screen
    const minX = spineX + 130;
    const maxX = rect.width - 350;
    
    setData(prev => ({
        ...prev,
        branches: prev.branches.map(b => 
        b.id === dragging ? { ...b, x: Math.max(minX, Math.min(maxX, newX)) } : b
        )
    }));
  };

  const findMainPeriodForDate = (date) => {
    return data.mainTimeline.find(p => 
      p.startDate <= date && p.endDate >= date
    );
  };

  const calculateBranchY = (branch, period, entryIndex = null) => {
    const matchingMainPeriod = findMainPeriodForDate(period.startDate);
    if (!matchingMainPeriod) return startY;
    
    const mainPeriodY = positions.get(`period-${matchingMainPeriod.id}`);
    if (!mainPeriodY) return startY;
    
    const periodIndex = branch.periods.findIndex(p => p.id === period.id);
    
    let offset = 0;
    for (let i = 0; i < periodIndex; i++) {
      const prevPeriod = branch.periods[i];
      const prevMainPeriod = findMainPeriodForDate(prevPeriod.startDate);
      
      if (prevMainPeriod?.id === matchingMainPeriod.id && !prevPeriod.collapsed) {
        offset += periodHeaderHeight;
        offset += prevPeriod.entries.length * entryHeight;
      } else if (prevMainPeriod?.id === matchingMainPeriod.id) {
        offset += periodHeaderHeight;
      }
    }
    
    if (entryIndex !== null) {
      return mainPeriodY + offset + periodHeaderHeight + (entryIndex * entryHeight);
    }
    
    return mainPeriodY + offset;
  };

  const countTotalEntries = () => {
    let count = 0;
    data.mainTimeline.forEach(period => {
      count += period.entries.length;
    });
    data.branches.forEach(branch => {
      branch.periods.forEach(period => {
        count += period.entries.length;
      });
    });
    return count;
  };
  return (
  <>
    <style>{`
      body, html {
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
      }
      * {
        box-sizing: border-box;
      }
      *::-webkit-scrollbar {
        display: none;
      }
      * {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `}</style>
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#ffffff',
      backgroundImage: `radial-gradient(circle, #e5e5e5 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        height: '56px',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#fff',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111' }}>
            Life Timeline
          </h1>
          
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            paddingLeft: '20px',
            borderLeft: '1px solid #ddd'
          }}>
            {data.branches.map(branch => (
              <div key={branch.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                background: '#f5f5f5',
                borderRadius: '4px',
                fontSize: '13px',
                color: '#666'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: branch.color
                }} />
                {branch.name}
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ fontSize: '12px', color: '#6b6b6b' }}>
          Click on the timeline to create entries
        </div>
      </div>

      {stickyPeriod && (
        <div style={{
          position: 'absolute',
          top: '65px',
          left: '0',
          right: '0',
          height: '62px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          alignItems: 'center',
          marginTop: "-9px",
          padding: '0 40px 0 90px',
          zIndex: 90,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#000000',
            marginRight: '16px'
          }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#000000', letterSpacing: '-0.01em' }}>
              {stickyPeriod.title}
            </div>
            <div style={{ fontSize: '11px', color: '#6b6b6b', marginTop: '2px' }}>
              {stickyPeriod.dateRange} • {stickyPeriod.entries.length} entries
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <div 
          ref={scrollContainerRef}
          style={{ 
            flex: 1, 
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingTop: stickyPeriod ? '56px' : '0',
            height: '100%',
            width: '100%'
          }}>
          {data.mainTimeline.length === 0 && data.branches.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: '40px',
              textAlign: 'center',
              color: '#6b6b6b'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#000' }}>
                Your timeline is empty
              </div>
              <div style={{ fontSize: '14px', marginBottom: '24px', maxWidth: '400px' }}>
                Click anywhere on the timeline to create your first entry, or create a chapter first to organize your timeline.
              </div>
              <div 
                style={{
                  width: '2px',
                  height: '400px',
                  background: '#e0e0e0',
                  position: 'relative',
                  margin: '0 auto',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setCreateEntryDate(new Date());
                  setCreateEntryChapterId(undefined);
                  setIsCreatingEntry(true);
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#37352f',
                  cursor: 'pointer',
                  border: '2px solid white',
                  boxShadow: '0 0 0 2px #37352f',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.2)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'}
                />
              </div>
            </div>
          ) : (
            <svg 
              ref={svgRef}
              width="100%" 
              height={totalHeight}
              onMouseMove={handleMouseMove}
              onMouseUp={() => setDragging(null)}
              onMouseLeave={() => setDragging(null)}
              style={{ cursor: dragging ? 'grabbing' : 'default', display: 'block', minHeight: '100vh' }}
            >
            {/* Main timeline spine - full height */}
            <line
              x1={spineX}
              y1={0}
              x2={spineX}
              y2={totalHeight}
              stroke="#e0e0e0"
              strokeWidth="2"
            />
            
            {/* Clickable area for creating entries along the spine - wider for easier clicking */}
            <rect
              x={spineX - 100}
              y={0}
              width={200}
              height={totalHeight}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={(e) => handleTimelineClick(e as any)}
            />

            {data.mainTimeline.map(period => {
              const periodY = positions.get(`period-${period.id}`);
              
              return (
                <g key={period.id}>
                  <circle cx={spineX} cy={periodY + 8} r="6" fill="#000000" />
                  
                  <rect
                    x={50}
                    y={periodY - 10}
                    width={280}
                    height={62}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleMainPeriod(period.id)}
                  />
                  
                  <g style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                    {period.collapsed ? 
                      <ChevronRight x={60} y={periodY + 3} size={18} color="#6b6b6b" strokeWidth={2.5} /> : 
                      <ChevronDown x={60} y={periodY + 3} size={18} color="#6b6b6b" strokeWidth={2.5} />
                    }
                    
                    <text
                      x={88}
                      y={periodY + 9}
                      fontSize="15"
                      fontWeight="600"
                      fill="#000000"
                      letterSpacing="-0.01em"
                    >
                      {period.title}
                    </text>
                    
                    <text
                      x={88}
                      y={periodY + 28}
                      fontSize="12"
                      fill="#6b6b6b"
                      fontWeight="500"
                    >
                      {period.dateRange} • {period.entries.length} {period.entries.length === 1 ? 'entry' : 'entries'}
                    </text>
                  </g>

                  {!period.collapsed && period.entries.map(entry => {
                    const entryY = positions.get(`entry-${entry.id}`);
                    const isExpanded = expandedEntry === entry.id;
                    
                    return (
                      <g key={entry.id}>
                        <circle cx={spineX} cy={entryY + 18} r="3" fill="#cccccc" />
                        
                        <rect
                          x={60}
                          y={entryY + 8}
                          width={270}
                          height={64}
                          fill={isExpanded ? '#fafafa' : 'transparent'}
                          stroke="transparent"
                          strokeWidth="1"
                          rx="8"
                          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                          onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                          onMouseOver={(e) => {
                            if (!isExpanded) e.currentTarget.setAttribute('fill', '#fafafa');
                          }}
                          onMouseOut={(e) => {
                            if (!isExpanded) e.currentTarget.setAttribute('fill', 'transparent');
                          }}
                        />
                        
                        <text
                          x={80}
                          y={entryY + 28}
                          fontSize="13"
                          fontWeight="600"
                          fill="#000000"
                          letterSpacing="-0.01em"
                          style={{ pointerEvents: 'none' }}
                        >
                          {entry.title}
                        </text>
                        
                        <text
                          x={80}
                          y={entryY + 44}
                          fontSize="11"
                          fill="#6b6b6b"
                          fontWeight="500"
                          style={{ pointerEvents: 'none' }}
                        >
                          {entry.date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric' 
                          })}
                        </text>
                        
                        <text
                          x={80}
                          y={entryY + 60}
                          fontSize="12"
                          fill="#8a8a8a"
                          style={{ pointerEvents: 'none' }}
                        >
                          {entry.preview.substring(0, 36)}...
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {data.branches.map(branch => {
              if (!branch.periods || branch.periods.length === 0) return null;
              
              const firstPeriod = branch.periods[0];
              const matchingMainPeriod = findMainPeriodForDate(firstPeriod.startDate);
              const branchStartY = matchingMainPeriod 
                ? positions.get(`period-${matchingMainPeriod.id}`)
                : startY;

              return (
                <g key={branch.id}>
                  <line
                    x1={spineX + 20}
                    y1={branchStartY + 8}
                    x2={branch.x - 20}
                    y2={branchStartY + 8}
                    stroke={branch.color}
                    strokeWidth="2"
                    opacity="0.2"
                    strokeDasharray="4 4"
                  />

                  <line
                    x1={branch.x}
                    y1={branchStartY}
                    x2={branch.x}
                    y2={totalHeight - 40}
                    stroke={branch.color}
                    strokeWidth="2"
                    opacity="0.12"
                  />

                  <rect
                    x={branch.x - 100}
                    y={branchStartY - 53}
                    width="200"
                    height="36"
                    fill="#ffffff"
                    stroke={branch.color}
                    strokeWidth="1.5"
                    rx="8"
                    style={{ cursor: 'grab' }}
                    onMouseDown={() => setDragging(branch.id)}
                  />
                  
                  <g
                    onMouseDown={() => setDragging(branch.id)}
                    style={{ cursor: 'grab', pointerEvents: 'none' }}
                  >
                    <GripVertical x={branch.x - 90} y={branchStartY - 41} size={14} color={branch.color} opacity={0.5} />
                  </g>
                  
                  <rect
                    x={branch.x - 65}
                    y={branchStartY - 32}
                    width={24}
                    height={24}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBranch(branch.id);
                    }}
                  />
                  
                  <g style={{ pointerEvents: 'none' }}>
                    {branch.collapsed ? 
                      <ChevronRight x={branch.x - 61} y={branchStartY - 42} size={16} color={branch.color} strokeWidth={2.5} /> : 
                      <ChevronDown x={branch.x - 61} y={branchStartY - 42} size={16} color={branch.color} strokeWidth={2.5} />
                    }
                    
                    <text
                      x={branch.x - 38}
                      y={branchStartY - 30}
                      fontSize="13"
                      fontWeight="600"
                      fill={branch.color}
                      letterSpacing="-0.01em"
                    >
                      {branch.name}
                    </text>
                  </g>

                  {!branch.collapsed && branch.periods.map((period, pIdx) => {
                    const matchingMainPeriod = findMainPeriodForDate(period.startDate);
                    const mainPeriodCollapsed = matchingMainPeriod?.collapsed || false;
                    
                    if (mainPeriodCollapsed) return null;
                    
                    const periodStartY = calculateBranchY(branch, period);

                    return (
                      <g key={period.id}>
                        <circle cx={branch.x} cy={periodStartY + 8} r="5" fill={branch.color} />
                        
                        <rect
                          x={branch.x + 20}
                          y={periodStartY - 10}
                          width={260}
                          height={50}
                          fill="transparent"
                          style={{ cursor: 'pointer' }}
                          onClick={() => toggleBranchPeriod(branch.id, period.id)}
                        />
                        
                        <g style={{ pointerEvents: 'none' }}>
                          {period.collapsed ? 
                            <ChevronRight x={branch.x + 28} y={periodStartY - 2} size={16} color={branch.color} opacity={0.7} strokeWidth={2.5} /> : 
                            <ChevronDown x={branch.x + 28} y={periodStartY - 2} size={16} color={branch.color} opacity={0.7} strokeWidth={2.5} />
                          }
                          
                          <text
                            x={branch.x + 52}
                            y={periodStartY + 5}
                            fontSize="13"
                            fontWeight="600"
                            fill="#000000"
                            letterSpacing="-0.01em"
                          >
                            {period.title}
                          </text>
                          
                          <text
                            x={branch.x + 52}
                            y={periodStartY + 22}
                            fontSize="11"
                            fill="#6b6b6b"
                            fontWeight="500"
                          >
                            {period.dateRange}
                          </text>
                        </g>

                        {!period.collapsed && period.entries.map((entry, eIdx) => {
                          const entryY = calculateBranchY(branch, period, eIdx);
                          const isExpanded = expandedEntry === entry.id;
                          
                          return (
                            <g key={entry.id}>
                              <circle cx={branch.x} cy={entryY + 18} r="2.5" fill={branch.color} opacity="0.4" />
                              
                              <rect
                                x={branch.x + 24}
                                y={entryY}
                                width={276}
                                height={64}
                                fill={isExpanded ? `${branch.color}0a` : 'transparent'}
                                stroke="transparent"
                                strokeWidth="1"
                                rx="8"
                                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                                onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                                onMouseOver={(e) => {
                                  if (!isExpanded) e.currentTarget.setAttribute('fill', `${branch.color}05`);
                                }}
                                onMouseOut={(e) => {
                                  if (!isExpanded) e.currentTarget.setAttribute('fill', 'transparent');
                                }}
                              />
                              
                              <text
                                x={branch.x + 44}
                                y={entryY + 20}
                                fontSize="12"
                                fontWeight="600"
                                fill="#000000"
                                letterSpacing="-0.01em"
                                style={{ pointerEvents: 'none' }}
                              >
                                {entry.title}
                              </text>
                              
                              <text
                                x={branch.x + 44}
                                y={entryY + 36}
                                fontSize="10"
                                fill="#6b6b6b"
                                fontWeight="500"
                                style={{ pointerEvents: 'none' }}
                              >
                                {entry.date.toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric' 
                                })}
                              </text>
                              
                              <text
                                x={branch.x + 44}
                                y={entryY + 52}
                                fontSize="11"
                                fill="#8a8a8a"
                                style={{ pointerEvents: 'none' }}
                              >
                                {entry.preview.substring(0, 36)}...
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
          )}
        </div>
        
        {(expandedEntry || isCreatingEntry) && (
          <TimelineSidebar
            entry={(() => {
              if (isCreatingEntry) return null;
              let foundEntry: TimelineEntry | null = null;
              data.mainTimeline.forEach((period: TimelinePeriod) => {
                const found = period.entries.find((e: TimelineEntry) => e.id === expandedEntry);
                if (found) foundEntry = found;
              });
              data.branches.forEach((branch: TimelineBranch) => {
                branch.periods.forEach((period: TimelinePeriod) => {
                  const found = period.entries.find((e: TimelineEntry) => e.id === expandedEntry);
                  if (found) foundEntry = found;
                });
              });
              return foundEntry;
            })()}
            chapters={chapters}
            isCreating={isCreatingEntry}
            createDate={createEntryDate}
            createChapterId={createEntryChapterId}
            entryChapterId={expandedEntry ? findEntryChapter(expandedEntry) : undefined}
            onSave={handleEventSubmit}
            onCancel={handleCancelSidebar}
            onDelete={handleDeleteEntry}
          />
        )}
      </div>

    </div>
  </>
);
}