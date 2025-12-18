import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTimeline } from '../../hooks/useTimeline';
import { useEventActions } from '../../hooks/useEventActions';
import { transformToTimelineData } from '../../lib/timelineTransform';
import { calculateLayout, LAYOUT_CONSTANTS } from '../utils/layoutCalculations';
import { findMainPeriodForDate } from '../utils/timelineHelpers';
import { LifeTimelineProps, TimelineData, TimelinePeriod, TimelineEntry, TimelineBranch } from '../types/timeline.types';
import TimelineHeader from './Header';
import TimelineStickyHeader from './StickyHeader';
import TimelineEmptyState from './EmptyState';
import TimelineCanvas from './Canvas';
import TimelineSidebar from './Sidebar';

export default function LifeTimeline({ 
  chapters: chaptersProp = [], 
  events: eventsProp = [], 
  refresh: refreshProp, 
  initialData = null 
}: LifeTimelineProps) {
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
      return initialData;
    }
    if (chapters.length > 0 || events.length > 0) {
      return transformToTimelineData(chapters, events);
    }
    return {
      mainTimeline: [],
      branches: [],
    };
  }, [chapters, events, initialData]);

  const [data, setData] = useState<TimelineData>(transformedData);
  const [dragging, setDragging] = useState<number | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<string | number | null>(null);
  const [stickyPeriod, setStickyPeriod] = useState<TimelinePeriod | null>(null);
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

  const { positions, totalHeight } = calculateLayout(data.mainTimeline);

  const handleEventSubmit = async (formData: EventFormData) => {
    try {
      if (isCreatingEntry) {
        await createEvent(formData);
        setIsCreatingEntry(false);
        setCreateEntryDate(undefined);
        setCreateEntryChapterId(undefined);
        await refresh();
      } else if (expandedEntry) {
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

  const findEntryChapter = (entryId: string | number): number | undefined => {
    if (typeof entryId === 'number') {
      const event = events.find(e => e.id === entryId);
      if (event && event.chapter) {
        return typeof event.chapter === 'number' ? event.chapter : event.chapter;
      }
    }
    return undefined;
  };

  const handleTimelineClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (dragging) return;
    
    const svg = svgRef.current;
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    const scrollTop = scrollContainerRef.current?.scrollTop || 0;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top + scrollTop;
    
    if (Math.abs(x - LAYOUT_CONSTANTS.spineX) < 100) {
      let clickedDate: Date | undefined;
      let clickedChapterId: number | undefined;
      
      data.mainTimeline.forEach((period: TimelinePeriod) => {
        const periodY = positions.get(`period-${period.id}`);
        if (periodY && y >= periodY - 20 && y <= periodY + 200) {
          clickedChapterId = chapters.find(c => c.id === period.id)?.id;
          const periodStart = period.startDate.getTime();
          const periodEnd = period.endDate.getTime();
          const periodDuration = periodEnd - periodStart;
          const clickOffset = y - periodY;
          const periodHeight = LAYOUT_CONSTANTS.periodHeaderHeight + 
            (period.collapsed ? 0 : period.entries.length * LAYOUT_CONSTANTS.entryHeight) + 
            LAYOUT_CONSTANTS.periodGap;
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
        setCreateEntryDate(new Date());
        setCreateEntryChapterId(undefined);
        setIsCreatingEntry(true);
        setExpandedEntry(null);
      }
    } else {
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
  }, [data.mainTimeline, positions]);

  const toggleMainPeriod = (periodId: string | number) => {
    setData(prev => {
      const period = prev.mainTimeline.find(p => p.id === periodId);
      if (!period) return prev;
      
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

  const toggleBranchPeriod = (branchId: string | number, periodId: string | number) => {
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

  const toggleBranch = (branchId: string | number) => {
    setData(prev => ({
      ...prev,
      branches: prev.branches.map(b => 
        b.id === branchId ? { ...b, collapsed: !b.collapsed } : b
      )
    }));
  };

  useEffect(() => {
    if (data.branches.length > 0) {
      const startX = LAYOUT_CONSTANTS.spineX + 300;
      setData(prev => ({
        ...prev,
        branches: prev.branches.map((branch, idx) => ({
          ...branch,
          x: startX + (idx * LAYOUT_CONSTANTS.branchMinSpacing)
        }))
      }));
    }
  }, []); // Only run once on mount

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !svgRef.current) return;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const newX = e.clientX - rect.left;
    
    const minX = LAYOUT_CONSTANTS.spineX + 130;
    const maxX = rect.width - 350;
    
    setData(prev => ({
      ...prev,
      branches: prev.branches.map(b => 
        b.id === dragging ? { ...b, x: Math.max(minX, Math.min(maxX, newX)) } : b
      )
    }));
  };

  const handleToggleEntry = (entryId: string | number) => {
    setExpandedEntry(prev => prev === entryId ? null : entryId);
  };

  const handleCreateEntryFromEmpty = () => {
    setCreateEntryDate(new Date());
    setCreateEntryChapterId(undefined);
    setIsCreatingEntry(true);
  };

  const findExpandedEntry = (): TimelineEntry | null => {
    if (isCreatingEntry || !expandedEntry) return null;
    
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
        <TimelineHeader branches={data.branches} />

        {stickyPeriod && <TimelineStickyHeader period={stickyPeriod} />}

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          <div 
            ref={scrollContainerRef}
            style={{ 
              flex: 1, 
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingTop: '506px',
              height: '100%',
              width: '100%'
            }}>
            {data.mainTimeline.length === 0 && data.branches.length === 0 ? (
              <TimelineEmptyState onCreateEntry={handleCreateEntryFromEmpty} />
            ) : (
              <TimelineCanvas
                data={data}
                positions={positions}
                totalHeight={totalHeight}
                expandedEntry={expandedEntry}
                dragging={dragging}
                svgRef={svgRef}
                onMouseMove={handleMouseMove}
                onMouseUp={() => setDragging(null)}
                onTimelineClick={handleTimelineClick}
                onToggleMainPeriod={toggleMainPeriod}
                onToggleBranchPeriod={toggleBranchPeriod}
                onToggleBranch={toggleBranch}
                onToggleEntry={handleToggleEntry}
                onStartDragBranch={setDragging}
              />
            )}
          </div>
          
          {(expandedEntry || isCreatingEntry) && (
            <TimelineSidebar
              entry={findExpandedEntry()}
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