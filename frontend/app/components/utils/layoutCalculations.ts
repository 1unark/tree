export const LAYOUT_CONSTANTS = {
  spineX: 330,
  entryHeight: 72,
  periodHeaderHeight: 45,
  periodGap: 48,
  startY: 10,
  branchMinSpacing: 400,
};

export function calculateLayout(
  mainTimeline: TimelinePeriod[],
  startY: number = LAYOUT_CONSTANTS.startY
) {
  let currentY = startY;
  const positions = new Map();

  mainTimeline.forEach(period => {
    positions.set(`period-${period.id}`, currentY);
    currentY += LAYOUT_CONSTANTS.periodHeaderHeight;

    if (!period.collapsed) {
      period.entries.forEach(entry => {
        positions.set(`entry-${entry.id}`, currentY);
        currentY += LAYOUT_CONSTANTS.entryHeight;
      });
    }

    currentY += LAYOUT_CONSTANTS.periodGap;
  });

  const minHeight = Math.max(
    currentY + 100,
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  
  return { positions, totalHeight: minHeight };
}