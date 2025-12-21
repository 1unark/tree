// components/LifeTimeline.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTimeline } from '../../hooks/useTimeline';
import { useEventActions } from '../../hooks/useEventActions';
import { transformToTimelineData } from '../../lib/timelineTransform';
import { calculateLayout, LAYOUT_CONSTANTS } from '../utils/layoutCalculations';
import { chaptersAPI } from '@/lib/api';
import { LifeTimelineProps, TimelineData, TimelinePeriod, TimelineEntry, TimelineBranch, DragState } from '../types/timeline.types';
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
  const timelineHook = useTimeline();
  const chapters = chaptersProp.length > 0 ? chaptersProp : timelineHook.chapters;
  const events = eventsProp.length > 0 ? eventsProp : timelineHook.events;
  const refresh = refreshProp || timelineHook.refresh;
  const { createEvent, updateEvent, deleteEvent } = useEventActions(refresh);
  
  const transformedData = useMemo(() => {
    if (initialData) return initialData;
    if (chapters.length > 0 || events.length > 0) {
      return transformToTimelineData(chapters, events);
    }
    return { mainTimeline: [], branches: [] };
  }, [chapters, events, initialData]);

  const [data, setData] = useState<TimelineData>(transformedData);
  const [dragState, setDragState] = useState<DragState>({ type: null });
  const [expandedEntry, setExpandedEntry] = useState<string | number | null>(null);
  const [stickyPeriod, setStickyPeriod] = useState<TimelinePeriod | null>(null);
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);
  const [createEntryDate, setCreateEntryDate] = useState<Date | undefined>(undefined);
  const [createEntryChapterId, setCreateEntryChapterId] = useState<number | undefined>(undefined);
  const svgRef = useRef<SVGSVGElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newData = transformToTimelineData(chapters, events);
    setData(newData);
  }, [chapters, events]);

  const { positions, totalHeight } = calculateLayout(data.mainTimeline);

  const getRandomBranchColor = () => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const findEntryOrPeriodById = (id: string | number): { entry?: TimelineEntry; period?: TimelinePeriod } => {
    if (typeof id === 'string' && id.startsWith('period-')) {
      const periodId = id.replace('period-', '');
      const period = data.mainTimeline.find(p => String(p.id) === periodId);
      if (period) return { period };
    }
    
    for (const period of data.mainTimeline) {
      const entry = period.entries.find(e => e.id === id);
      if (entry) return { entry };
    }
    for (const branch of data.branches) {
      for (const period of branch.periods) {
        const entry = period.entries.find(e => e.id === id);
        if (entry) return { entry };
      }
    }
    return {};
  };

  const handleStartBranchCreation = (sourceId: string | number, x: number, y: number) => {
    setDragState({
      type: 'creating-branch',
      sourceEntryId: sourceId,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const paddingOffset = 506;
    const scrollTop = scrollContainerRef.current?.scrollTop || 0;
    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top + scrollTop - paddingOffset;
    
    if (dragState.type === 'branch' && dragState.id && dragState.offsetX !== undefined) {
      const minX = LAYOUT_CONSTANTS.spineX + 130;
      const maxX = rect.width - 350;
      const targetX = newX - dragState.offsetX;
      
      setData(prev => ({
        ...prev,
        branches: prev.branches.map(b => 
          b.id === dragState.id ? { ...b, x: Math.max(minX, Math.min(maxX, targetX)) } : b
        )
      }));
    } else if (dragState.type === 'creating-branch') {
      setDragState(prev => ({
        ...prev,
        currentX: newX,
        currentY: newY
      }));
    }
  };

  const saveBranch = async (branch: TimelineBranch) => {
    try {
      const branchChapter = await chaptersAPI.create({
        title: branch.name,
        type: 'branch',
        start_date: new Date().toISOString().split('T')[0],
        color: branch.color,
        x_position: branch.x,
        collapsed: branch.collapsed
      });

      if (branch.periods.length > 0) {
        const period = branch.periods[0];
        await chaptersAPI.create({
          title: period.title,
          type: 'branch_period',
          start_date: period.startDate.toISOString().split('T')[0],
          end_date: period.endDate.toISOString().split('T')[0],
          parent_branch: branchChapter.id,
          collapsed: period.collapsed
        });
      }

      await refresh();
    } catch (error) {
      console.error('Error saving branch:', error);
    }
  };

  const handleUpdateBranchName = async (branchId: number, newName: string) => {
    try {
      await chaptersAPI.update(branchId, { title: newName });
      
      setData(prev => ({
        ...prev,
        branches: prev.branches.map(b => 
          b.id === branchId ? { ...b, name: newName } : b
        )
      }));
      
      await refresh();
    } catch (error) {
      console.error('Error updating branch name:', error);
    }
  };

  const handleUpdateChapterName = async (chapterId: number, newName: string) => {
    try {
      await chaptersAPI.update(chapterId, { title: newName });
      
      setData(prev => ({
        ...prev,
        mainTimeline: prev.mainTimeline.map(p => 
          p.id === chapterId ? { ...p, title: newName } : p
        ),
        branches: prev.branches.map(branch => ({
          ...branch,
          periods: branch.periods.map(p => 
            p.id === chapterId ? { ...p, title: newName } : p
          )
        }))
      }));
      
      await refresh();
    } catch (error) {
      console.error('Error updating chapter name:', error);
    }
  };

  const handleAddBranchEntry = (branchId: number, y: number) => {
    const branch = data.branches.find(b => b.id === branchId);
    if (!branch || !branch.periods || branch.periods.length === 0) return;
    
    const firstPeriod = branch.periods[0];
    const periodChapterId = typeof firstPeriod.id === 'number' ? firstPeriod.id : undefined;
    
    setCreateEntryDate(firstPeriod.startDate);
    setCreateEntryChapterId(periodChapterId);
    setIsCreatingEntry(true);
    setExpandedEntry(null);
  };

  const handleMouseUp = async () => {
    if (dragState.type === 'creating-branch' && dragState.sourceEntryId && dragState.startX && dragState.currentX) {
      const dragDistance = dragState.currentX - dragState.startX;
      
      if (dragDistance > 100) {
        const { entry, period } = findEntryOrPeriodById(dragState.sourceEntryId);
        
        if (entry || period) {
          const sourceDate = entry?.date || period?.startDate || new Date();
          const sourceTitle = entry?.title || period?.title || 'Unknown';
          
          const newBranch: TimelineBranch = {
            id: Date.now(),
            name: `Branch: ${sourceTitle}`,
            color: getRandomBranchColor(),
            x: dragState.currentX,
            collapsed: false,
            sourceEntryId: dragState.sourceEntryId,
            periods: [{
              id: `branch-period-${Date.now()}`,
              title: 'New Period',
              startDate: sourceDate,
              endDate: new Date(sourceDate.getTime() + 86400000),
              dateRange: sourceDate.toLocaleDateString('en-US', { 
                month: 'short',
                year: 'numeric'
              }),
              collapsed: false,
              entries: []
            }]
          };
          
          setData(prev => ({
            ...prev,
            branches: [...prev.branches, newBranch]
          }));
          
          await saveBranch(newBranch);
        }
      }
    } else if (dragState.type === 'branch' && dragState.id) {
      const branch = data.branches.find(b => b.id === dragState.id);
      if (branch && typeof branch.id === 'number') {
        try {
          await chaptersAPI.update(branch.id, { x_position: branch.x });
        } catch (error) {
          console.error('Error saving branch position:', error);
        }
      }
    }
    
    setDragState({ type: null });
  };

  const handleEventSubmit = async (formData: any) => {
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
    if (dragState.type) return;
    
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
          x: branch.x || startX + (idx * LAYOUT_CONSTANTS.branchMinSpacing)
        }))
      }));
    }
  }, [data.branches.length]);

  useEffect(() => {
    if (dragState.type === 'branch' || dragState.type === 'creating-branch') {
      document.body.classList.add('dragging');
    } else {
      document.body.classList.remove('dragging');
    }
    
    return () => {
      document.body.classList.remove('dragging');
    };
  }, [dragState.type]);

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
    const result = findEntryOrPeriodById(expandedEntry);
    return result.entry || null;
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
        
        svg {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        body.dragging,
        body.dragging * {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          cursor: grabbing !important;
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
                dragState={dragState}
                svgRef={svgRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTimelineClick={handleTimelineClick}
                onToggleMainPeriod={toggleMainPeriod}
                onToggleBranchPeriod={toggleBranchPeriod}
                onToggleBranch={toggleBranch}
                onToggleEntry={handleToggleEntry}
                onStartDragBranch={(id, offsetX) => setDragState({ type: 'branch', id, offsetX })}
                onStartBranchCreation={handleStartBranchCreation}
                onUpdateBranchName={handleUpdateBranchName}
                onUpdateChapterName={handleUpdateChapterName}
                onAddBranchEntry={handleAddBranchEntry}
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