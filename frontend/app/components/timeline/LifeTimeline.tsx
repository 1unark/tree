// components/LifeTimeline.tsx - UPDATED VERSION
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
  const [createEntryBranchId, setCreateEntryBranchId] = useState<number | undefined>(undefined);
  const [isCreatingChapterFromEmpty, setIsCreatingChapterFromEmpty] = useState(false);

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
      const minX = LAYOUT_CONSTANTS.spineX + 45;
      const maxX = rect.width - 220;
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


  const saveBranch = async (branch: TimelineBranch, sourceEntryId?: string | number, sourceChapterId?: number) => {
    try {
      const { entry, period } = findEntryOrPeriodById(sourceEntryId || '');
      
      const branchData: any = {
        title: branch.name,
        type: 'branch',
        start_date: new Date().toISOString().split('T')[0],
        color: branch.color,
        x_position: branch.x,
        collapsed: branch.collapsed
      };

      // Set source based on what we're branching from
      if (entry && typeof entry.id === 'number') {
        branchData.source_entry = entry.id;
      } else if (period && typeof period.id === 'number') {
        branchData.source_chapter = period.id;
      } else if (typeof sourceEntryId === 'string' && sourceEntryId.startsWith('period-')) {
        const periodId = parseInt(sourceEntryId.replace('period-', ''));
        if (!isNaN(periodId)) {
          branchData.source_chapter = periodId;
        }
      }

      const branchChapter = await chaptersAPI.create(branchData);

      // Create branch period if there are periods
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

  const handleDeleteBranch = async (branchId: number) => {
    try {
      await chaptersAPI.delete(branchId);
      setData(prev => ({
        ...prev,
        branches: prev.branches.filter(b => b.id !== branchId)
      }));
      await refresh();
    } catch (error) {
      console.error('Error deleting branch:', error);
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

  const handleUpdateChapterDates = async (chapterId: number, startDate: string, endDate: string) => {
    try {
      await chaptersAPI.update(chapterId, { 
        start_date: startDate, 
        end_date: endDate 
      });
      
      // Update local state
      setData(prev => ({
        ...prev,
        mainTimeline: prev.mainTimeline.map(p => 
          p.id === chapterId ? { 
            ...p, 
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            dateRange: `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
          } : p
        ),
        branches: prev.branches.map(branch => ({
          ...branch,
          periods: branch.periods.map(p => 
            p.id === chapterId ? { 
              ...p, 
              startDate: new Date(startDate),
              endDate: new Date(endDate),
              dateRange: `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
            } : p
          )
        }))
      }));
      
      // Refresh to get sorted data
      await refresh();
    } catch (error) {
      console.error('Error updating chapter dates:', error);
    }
  };

  const handleDeleteChapter = async (chapterId: number) => {
    try {
      await chaptersAPI.delete(chapterId);
      setData(prev => ({
        ...prev,
        mainTimeline: prev.mainTimeline.filter(p => p.id !== chapterId),
        branches: prev.branches.map(branch => ({
          ...branch,
          periods: branch.periods.filter(p => p.id !== chapterId)
        }))
      }));
      await refresh();
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  const handleAddBranchEntry = (branchId: number, y: number) => {
    const branch = data.branches.find(b => b.id === branchId);
    if (!branch) return;
    
    // Check if branch has periods
    if (branch.periods && branch.periods.length > 0) {
      // Find the most recent period (last one in the array)
      const mostRecentPeriod = branch.periods[branch.periods.length - 1];
      
      // If period has a real ID, use it as chapter
      if (typeof mostRecentPeriod.id === 'number') {
        setCreateEntryDate(mostRecentPeriod.startDate);
        setCreateEntryChapterId(mostRecentPeriod.id);
        setCreateEntryBranchId(undefined);
      } else {
        // Period is virtual, assign directly to branch
        setCreateEntryDate(mostRecentPeriod.startDate);
        setCreateEntryChapterId(undefined);
        setCreateEntryBranchId(typeof branch.id === 'number' ? branch.id : undefined);
      }
    } else {
      // No periods, entry goes directly in branch
      setCreateEntryDate(new Date());
      setCreateEntryChapterId(undefined);
      setCreateEntryBranchId(typeof branch.id === 'number' ? branch.id : undefined);
    }
    
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
          
          await saveBranch(newBranch, dragState.sourceEntryId);
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
        const eventData: any = {
          title: formData.title,
          date: formData.date,
          content: formData.content || ''
        };
        
        if (createEntryChapterId) {
          eventData.chapter = createEntryChapterId;
        } else if (createEntryBranchId) {
          eventData.branch = createEntryBranchId;
        }
        
        await createEvent(eventData);
        
        // Auto-expand chapter dates if needed
        if (createEntryChapterId) {
          const chapter = chapters.find(c => c.id === createEntryChapterId);
          if (chapter) {
            const eventDate = new Date(formData.date);
            const chapterStart = new Date(chapter.start_date);
            const chapterEnd = new Date(chapter.end_date);
            
            let needsUpdate = false;
            let newStart = chapter.start_date;
            let newEnd = chapter.end_date;
            
            if (eventDate < chapterStart) {
              newStart = formData.date;
              needsUpdate = true;
            }
            
            if (eventDate > chapterEnd) {
              newEnd = formData.date;
              needsUpdate = true;
            }
            
            if (needsUpdate) {
              await chaptersAPI.update(chapter.id, {
                start_date: newStart,
                end_date: newEnd
              });
            }
          }
        }
        
        setIsCreatingEntry(false);
        setCreateEntryDate(undefined);
        setCreateEntryChapterId(undefined);
        setCreateEntryBranchId(undefined);
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
          
          // Auto-expand chapter dates if date was changed
          const eventChapterId = findEntryChapter(expandedEntry);
          if (eventChapterId && formData.date) {
            const chapter = chapters.find(c => c.id === eventChapterId);
            if (chapter) {
              const eventDate = new Date(formData.date);
              const chapterStart = new Date(chapter.start_date);
              const chapterEnd = new Date(chapter.end_date);
              
              let needsUpdate = false;
              let newStart = chapter.start_date;
              let newEnd = chapter.end_date;
              
              if (eventDate < chapterStart) {
                newStart = formData.date;
                needsUpdate = true;
              }
              
              if (eventDate > chapterEnd) {
                newEnd = formData.date;
                needsUpdate = true;
              }
              
              if (needsUpdate) {
                await chaptersAPI.update(chapter.id, {
                  start_date: newStart,
                  end_date: newEnd
                });
              }
            }
          }
          
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
      setCreateEntryBranchId(undefined);
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
    const paddingOffset = 506;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top + scrollTop - paddingOffset;
    
    console.log('[handleTimelineClick] Click position:', { x, y, spineX: LAYOUT_CONSTANTS.spineX });
    
    // Only create entry if clicking near the spine
    if (Math.abs(x - LAYOUT_CONSTANTS.spineX) < 100) {
      let clickedDate: Date | undefined;
      let clickedChapterId: number | undefined;
      
      console.log('[handleTimelineClick] Near spine, checking periods...');
      
      // Find which period was clicked - use actual positions, not recalculated heights
      for (let i = 0; i < data.mainTimeline.length; i++) {
        const period = data.mainTimeline[i];
        const periodY = positions.get(`period-${period.id}`);
        
        console.log(`[handleTimelineClick] Checking period ${period.id} (${period.title}) at Y=${periodY}`);
        
        if (periodY !== undefined) {
          // Get the next period's Y position to know where this period ends
          const nextPeriodY = i < data.mainTimeline.length - 1
            ? positions.get(`period-${data.mainTimeline[i + 1].id}`)
            : totalHeight;
          
          console.log(`[handleTimelineClick] Period range: ${periodY - 20} to ${nextPeriodY}`);
          
          // Check if click is within this period's range
          if (y >= periodY - 20 && y < (nextPeriodY ?? totalHeight)) {
            console.log(`[handleTimelineClick] ✓ Click is within period ${period.id}!`);
            
            // Only assign chapter if it's a real chapter (not 'uncategorized')
            if (typeof period.id === 'number') {
              clickedChapterId = period.id;
              console.log(`[handleTimelineClick] Set clickedChapterId to: ${clickedChapterId}`);
            } else {
              console.log(`[handleTimelineClick] Period ID is not a number (${typeof period.id}), skipping`);
            }
            
            // Calculate date based on position within period
            const periodStart = period.startDate.getTime();
            const periodEnd = period.endDate.getTime();
            const periodDuration = periodEnd - periodStart;
            const clickOffset = y - periodY;
            const periodHeight = (nextPeriodY ?? totalHeight) - periodY;
            const ratio = Math.max(0, Math.min(1, clickOffset / Math.max(periodHeight, 100)));
            clickedDate = new Date(periodStart + ratio * periodDuration);
            
            break; // Found the period, stop searching
          }
        }
      }
      
      console.log('[handleTimelineClick] Final values:', {
        clickedDate,
        clickedChapterId
      });
      
      setCreateEntryDate(clickedDate || new Date());
      setCreateEntryChapterId(clickedChapterId);
      setCreateEntryBranchId(undefined);
      setIsCreatingEntry(true);
      setExpandedEntry(null);
      
      console.log('[handleTimelineClick] State set:', {
        createEntryDate: clickedDate || new Date(),
        createEntryChapterId: clickedChapterId,
        isCreatingEntry: true
      });
    } else {
      console.log('[handleTimelineClick] Not near spine, x distance:', Math.abs(x - LAYOUT_CONSTANTS.spineX));
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

  const handleCreateChapter = async (chapterData: any) => {
    // Check if this is a branch chapter (has branch_id) or main timeline chapter
    const apiData: any = {
      ...chapterData,
    };
    
    // Set the correct type based on whether it's a branch chapter or main chapter
    if (chapterData.branch_id) {
      apiData.type = 'branch_period';
      apiData.parent_branch = chapterData.branch_id;
      // Remove branch_id as it's now in parent_branch
      delete apiData.branch_id;
    } else {
      apiData.type = 'main_period';
    }
    
    console.log('[handleCreateChapter] Creating chapter with data:', apiData);
    
    await chaptersAPI.create(apiData);
    await refresh();
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

  //const handleCreateChapterFromEmpty = () => {
    //setIsCreatingChapterFromEmpty(true);
  //};


  const findExpandedEntry = (): TimelineEntry | null => {
    if (isCreatingEntry || !expandedEntry) return null;
    const result = findEntryOrPeriodById(expandedEntry);
    return result.entry || null;
  };


  const handleCreateEntryFromEmpty = () => {
    setCreateEntryDate(new Date());
    setCreateEntryChapterId(undefined);
    setCreateEntryBranchId(undefined);
    setIsCreatingEntry(true);
  };

  const handleCreateChapterFromEmpty = async () => {
    // Create a default chapter
    const newChapterData = {
      title: 'New Chapter',
      type: 'main_period',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      collapsed: false
    };
    
    await handleCreateChapter(newChapterData);
  };

  const handleCreateEntryInChapter = (chapterId: number) => {
    console.log('[handleCreateEntryInChapter] Creating entry in chapter:', chapterId);
    
    // Find the chapter to get its date range
    const chapter = chapters.find(c => c.id === chapterId);
    const entryDate = chapter ? new Date(chapter.start_date) : new Date();
    
    setCreateEntryDate(entryDate);
    setCreateEntryChapterId(chapterId);
    setCreateEntryBranchId(undefined);
    setIsCreatingEntry(true);
    setExpandedEntry(null);
    
    console.log('[handleCreateEntryInChapter] State set:', {
      createEntryDate: entryDate,
      createEntryChapterId: chapterId,
      isCreatingEntry: true
    });
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
              <TimelineEmptyState 
                onCreateEntry={handleCreateEntryFromEmpty}
                onCreateChapter={handleCreateChapterFromEmpty}
              />
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
                onDeleteBranch={handleDeleteBranch}
                onUpdateChapterName={handleUpdateChapterName}
                onUpdateChapterDates={handleUpdateChapterDates}
                onDeleteChapter={handleDeleteChapter}
                onAddBranchEntry={handleAddBranchEntry}
                onCreateChapter={handleCreateChapter}
                onCreateEntryInChapter={handleCreateEntryInChapter} // ADD THIS
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