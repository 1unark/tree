import { TimelinePeriod, TimelineData } from '../types/timeline.types';
import { LAYOUT_CONSTANTS } from '../utils/layoutCalculations';

export function findMainPeriodForDate(
  mainTimeline: TimelinePeriod[],
  date: Date
): TimelinePeriod | undefined {
  return mainTimeline.find(p => p.startDate <= date && p.endDate >= date);
}

export function calculateBranchY(
  branch: TimelineBranch,
  period: TimelinePeriod,
  mainTimeline: TimelinePeriod[],
  positions: Map<string, number>,
  entryIndex: number | null = null
): number {
  const matchingMainPeriod = findMainPeriodForDate(mainTimeline, period.startDate);
  if (!matchingMainPeriod) return LAYOUT_CONSTANTS.startY;
  
  const mainPeriodY = positions.get(`period-${matchingMainPeriod.id}`);
  if (!mainPeriodY) return LAYOUT_CONSTANTS.startY;
  
  const periodIndex = branch.periods.findIndex(p => p.id === period.id);
  
  let offset = 0;
  for (let i = 0; i < periodIndex; i++) {
    const prevPeriod = branch.periods[i];
    const prevMainPeriod = findMainPeriodForDate(mainTimeline, prevPeriod.startDate);
    
    if (prevMainPeriod?.id === matchingMainPeriod.id && !prevPeriod.collapsed) {
      offset += LAYOUT_CONSTANTS.periodHeaderHeight;
      offset += prevPeriod.entries.length * LAYOUT_CONSTANTS.entryHeight;
    } else if (prevMainPeriod?.id === matchingMainPeriod.id) {
      offset += LAYOUT_CONSTANTS.periodHeaderHeight;
    }
  }
  
  if (entryIndex !== null) {
    return mainPeriodY + offset + LAYOUT_CONSTANTS.periodHeaderHeight + (entryIndex * LAYOUT_CONSTANTS.entryHeight);
  }
  
  return mainPeriodY + offset;
}

export function countTotalEntries(data: TimelineData): number {
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
}