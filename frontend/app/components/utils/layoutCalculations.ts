// utils/layoutCalculations.ts
import { TimelinePeriod, TimelineBranch } from '../types/timeline.types';

export const LAYOUT_CONSTANTS = {
  spineX: 250,
  entryCardHeight: 64,
  periodHeaderHeight: 45,
  startY: 10,
  branchMinSpacing: 400,
  periodDotOffset: 15,
  entryDotOffset: 18,
  
  // ========================================
  // MAIN TIMELINE SPACING CONTROLS
  // ========================================
  
  // Space between entries within a chapter
  mainTimelineEntrySpacing: 1,
  
  // Space between last entry and next chapter header
  mainTimelineEntryToChapterGap: 30,
  
  // Space between chapters (when chapter has no entries)
  mainTimelineChapterToChapterGap: 20,
  
  // ========================================
  // BRANCH SPACING CONTROLS
  // ========================================
  
  // Space between entries within a branch chapter
  branchEntrySpacing: 1,
  
  // Space between last entry and next chapter header in branch
  branchEntryToChapterGap: 17,
  
  // Space between chapters in branch (when chapter has no entries)
  branchChapterToChapterGap: 15,
  
  // Legacy - kept for backward compatibility
  periodGap: 45,
  entryHeight: 70, 
  mainTimelinePeriodGap: 25,
  branchPeriodGap: 5,
  mainTimelineEntryHeight: 72,
  branchEntryHeight: 72,
};

export function calculateLayout(
  mainTimeline: TimelinePeriod[],
  startY: number = LAYOUT_CONSTANTS.startY
) {
  let currentY = startY;
  const positions = new Map();

  mainTimeline.forEach((period, periodIndex) => {
    // Store period position
    positions.set(`period-${period.id}`, currentY);
    positions.set(`period-${period.id}-dot`, currentY + LAYOUT_CONSTANTS.periodDotOffset);
    currentY += LAYOUT_CONSTANTS.periodHeaderHeight;

    if (!period.collapsed && period.entries && period.entries.length > 0) {
      // Has entries - process them
      period.entries.forEach((entry, entryIndex) => {
        positions.set(`entry-${entry.id}`, currentY);
        positions.set(`entry-${entry.id}-dot`, currentY + LAYOUT_CONSTANTS.entryDotOffset);
        currentY += LAYOUT_CONSTANTS.entryCardHeight;
        
        // Add spacing between entries (but not after the last entry)
        if (entryIndex < period.entries.length - 1) {
          currentY += LAYOUT_CONSTANTS.mainTimelineEntrySpacing;
        }
      });
      
      // Add gap between last entry and next chapter
      if (periodIndex < mainTimeline.length - 1) {
        currentY += LAYOUT_CONSTANTS.mainTimelineEntryToChapterGap;
      }
    } else {
      // No entries - just add chapter-to-chapter gap
      if (periodIndex < mainTimeline.length - 1) {
        currentY += LAYOUT_CONSTANTS.mainTimelineChapterToChapterGap;
      }
    }
  });

  const minHeight = Math.max(
    currentY + 100,
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  
  return { positions, totalHeight: minHeight };
}

export function calculateBranchPositions(
  branch: TimelineBranch,
  mainTimeline: TimelinePeriod[],
  positions: Map<string, number>
) {
  const branchPositions = new Map<string, { y: number; dotY: number }>();
  
  // Calculate branch source Y
  let branchSourceY = LAYOUT_CONSTANTS.startY;
  
  if (branch.sourceEntryId) {
    if (typeof branch.sourceEntryId === 'string' && branch.sourceEntryId.startsWith('period-')) {
      const dotY = positions.get(`period-${branch.sourceEntryId.replace('period-', '')}-dot`);
      if (dotY !== undefined) {
        branchSourceY = dotY;
      }
    } else {
      const dotY = positions.get(`entry-${branch.sourceEntryId}-dot`);
      if (dotY !== undefined) {
        branchSourceY = dotY;
      }
    }
  } else if (branch.periods && branch.periods.length > 0) {
    const firstPeriod = branch.periods[0];
    const matchingMainPeriod = mainTimeline.find(p => 
      p.startDate <= firstPeriod.startDate && 
      (!p.endDate || p.endDate >= firstPeriod.startDate)
    );
    if (matchingMainPeriod) {
      branchSourceY = positions.get(`period-${matchingMainPeriod.id}-dot`) ?? branchSourceY;
    }
  }

  branchPositions.set(`branch-${branch.id}-source`, {
    y: branchSourceY,
    dotY: branchSourceY
  });

  let currentY = branchSourceY;

  if (!branch.periods || branch.periods.length === 0) {
    return branchPositions;
  }

  branch.periods.forEach((period, periodIndex) => {
    // Store period position
    branchPositions.set(`branch-${branch.id}-period-${period.id}`, {
      y: currentY,
      dotY: currentY + LAYOUT_CONSTANTS.periodDotOffset
    });
    
    currentY += LAYOUT_CONSTANTS.periodHeaderHeight;

    if (!period.collapsed && period.entries && period.entries.length > 0) {
      // Has entries - process them
      period.entries.forEach((entry, entryIndex) => {
        branchPositions.set(`branch-${branch.id}-entry-${entry.id}`, {
          y: currentY,
          dotY: currentY + LAYOUT_CONSTANTS.entryDotOffset
        });
        currentY += LAYOUT_CONSTANTS.entryCardHeight;
        
        // Add spacing between entries (but not after the last entry)
        if (entryIndex < period.entries.length - 1) {
          currentY += LAYOUT_CONSTANTS.branchEntrySpacing;
        }
      });
      
      // Add gap between last entry and next chapter
      if (periodIndex < branch.periods.length - 1) {
        currentY += LAYOUT_CONSTANTS.branchEntryToChapterGap;
      }
    } else {
      // No entries - just add chapter-to-chapter gap
      if (periodIndex < branch.periods.length - 1) {
        currentY += LAYOUT_CONSTANTS.branchChapterToChapterGap;
      }
    }
  });

  return branchPositions;
}

export function calculatePlusButtonY(positions: Map<string, number>): number {
  const allPositions = Array.from(positions.values());
  const lastContentY = allPositions.length > 0 ? Math.max(...allPositions) : 0;
  return lastContentY + LAYOUT_CONSTANTS.entryCardHeight + LAYOUT_CONSTANTS.entryDotOffset;
}

// Helper function to adjust all spacing globally
export function adjustSpacing(options: {
  // Main timeline
  mainEntrySpacing?: number;
  mainEntryToChapterGap?: number;
  mainChapterToChapterGap?: number;
  
  // Branch
  branchEntrySpacing?: number;
  branchEntryToChapterGap?: number;
  branchChapterToChapterGap?: number;
}) {
  if (options.mainEntrySpacing !== undefined) {
    LAYOUT_CONSTANTS.mainTimelineEntrySpacing = options.mainEntrySpacing;
  }
  if (options.mainEntryToChapterGap !== undefined) {
    LAYOUT_CONSTANTS.mainTimelineEntryToChapterGap = options.mainEntryToChapterGap;
  }
  if (options.mainChapterToChapterGap !== undefined) {
    LAYOUT_CONSTANTS.mainTimelineChapterToChapterGap = options.mainChapterToChapterGap;
  }
  if (options.branchEntrySpacing !== undefined) {
    LAYOUT_CONSTANTS.branchEntrySpacing = options.branchEntrySpacing;
  }
  if (options.branchEntryToChapterGap !== undefined) {
    LAYOUT_CONSTANTS.branchEntryToChapterGap = options.branchEntryToChapterGap;
  }
  if (options.branchChapterToChapterGap !== undefined) {
    LAYOUT_CONSTANTS.branchChapterToChapterGap = options.branchChapterToChapterGap;
  }
}