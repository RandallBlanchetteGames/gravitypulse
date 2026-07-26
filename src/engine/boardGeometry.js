/* ==========================================================================
   GRAVITY PULSE 2026 - BOARD GEOMETRY & COORDINATE MATHEMATICS
   ========================================================================== */

export const REGION_SIZE = 3;

/* Get region coordinates (rx, ry) from cell coordinates (x, y) */
export function getRegionCoords(x, y) {
  return {
    rx: Math.floor(x / REGION_SIZE),
    ry: Math.floor(y / REGION_SIZE)
  };
}

/* Get center cell coordinates (x, y) of a 3x3 region (rx, ry) */
export function getRegionCenter(rx, ry) {
  return {
    x: rx * REGION_SIZE + 1,
    y: ry * REGION_SIZE + 1
  };
}

/* Check if coordinates are within the center 2x2 Black Hole singularity */
export function isBlackHole(x, y, boardSize) {
  const midLeft = (boardSize / 2) - 1;
  const midRight = boardSize / 2;
  return (x === midLeft || x === midRight) && (y === midLeft || y === midRight);
}

/* Calculate Chebyshev distance (diagonal max step) between two points */
export function getChebyshevDistance(x1, y1, x2, y2) {
  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}

/* Calculate Manhattan distance (orthogonal step sum) */
export function getManhattanDistance(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

/* Get angle in radians from center point (for clockwise tie-breaking) */
export function getAngleFromCenter(x, y, boardSize) {
  const cx = (boardSize - 1) / 2;
  const cy = (boardSize - 1) / 2;
  // atan2(y - cy, x - cx), converted to 0..2PI starting from top (-PI/2)
  let angle = Math.atan2(y - cy, x - cx) + Math.PI / 2;
  if (angle < 0) angle += 2 * Math.PI;
  return angle;
}

/* Sort entities for Black Hole tie-breaker ordering:
   1. Closest Chebyshev distance to center
   2. Clockwise angle from top
   3. Entity ID fallback */
export function sortEntitiesByTieBreaker(entities, boardSize) {
  const cx = (boardSize - 1) / 2;
  const cy = (boardSize - 1) / 2;

  return [...entities].sort((a, b) => {
    const distA = getChebyshevDistance(a.x, a.y, cx, cy);
    const distB = getChebyshevDistance(b.x, b.y, cx, cy);
    if (distA !== distB) return distA - distB;

    const angleA = getAngleFromCenter(a.x, a.y, boardSize);
    const angleB = getAngleFromCenter(b.x, b.y, boardSize);
    if (Math.abs(angleA - angleB) > 0.001) return angleA - angleB;

    return String(a.id).localeCompare(String(b.id));
  });
}
