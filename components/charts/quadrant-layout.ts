export interface PlotPoint {
  id: string;
  x: number;
  y: number;
}

export interface LabelCandidate extends PlotPoint {
  text: string;
  width: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PositionedLabel extends LabelCandidate {
  box: Rect;
}

const LABEL_HEIGHT = 18;
const DOT_GAP = 12;
const DOT_CLEARANCE = 9;
const LABEL_CLEARANCE = 3;

function validRect(rect: Rect): boolean {
  return [rect.x, rect.y, rect.width, rect.height].every(Number.isFinite)
    && rect.width >= 0 && rect.height >= 0;
}

function intersects(a: Rect, b: Rect, gap = 0): boolean {
  return a.x < b.x + b.width + gap
    && a.x + a.width + gap > b.x
    && a.y < b.y + b.height + gap
    && a.y + a.height + gap > b.y;
}

function contains(bounds: Rect, box: Rect): boolean {
  return box.x >= bounds.x && box.y >= bounds.y
    && box.x + box.width <= bounds.x + bounds.width
    && box.y + box.height <= bounds.y + bounds.height;
}

function coversPoint(box: Rect, point: PlotPoint): boolean {
  const nearestX = Math.max(box.x, Math.min(point.x, box.x + box.width));
  const nearestY = Math.max(box.y, Math.min(point.y, box.y + box.height));
  return (point.x - nearestX) ** 2 + (point.y - nearestY) ** 2 < DOT_CLEARANCE ** 2;
}

/** Place priority labels at measured widths; crowded products retain their tooltip. */
export function placeLabels(
  candidates: LabelCandidate[],
  points: PlotPoint[],
  bounds: Rect,
  reserved: Rect[],
  limit: number,
): PositionedLabel[] {
  if (!validRect(bounds) || !Number.isFinite(limit) || limit < 1) return [];

  const labels: PositionedLabel[] = [];
  const seen = new Set<string>();
  const obstacles = reserved.filter(validRect);
  const dots = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

  for (const candidate of candidates) {
    if (labels.length >= Math.floor(limit)) break;
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    const { x, y, width } = candidate;
    if (![x, y, width].every(Number.isFinite) || width <= 0 || !candidate.text.trim()) continue;

    const positions: [number, number][] = [
      [x + DOT_GAP, y - LABEL_HEIGHT / 2],
      [x - width - DOT_GAP, y - LABEL_HEIGHT / 2],
      [x - width / 2, y - LABEL_HEIGHT - DOT_GAP],
      [x - width / 2, y + DOT_GAP],
      [x + DOT_GAP, y - LABEL_HEIGHT - DOT_GAP],
      [x - width - DOT_GAP, y - LABEL_HEIGHT - DOT_GAP],
      [x + DOT_GAP, y + DOT_GAP],
      [x - width - DOT_GAP, y + DOT_GAP],
    ];

    for (const [left, top] of positions) {
      const box: Rect = { x: left, y: top, width, height: LABEL_HEIGHT };
      if (!contains(bounds, box)) continue;
      if (obstacles.some((obstacle) => intersects(box, obstacle))) continue;
      if (dots.some((point) => coversPoint(box, point))) continue;
      if (labels.some((label) => intersects(box, label.box, LABEL_CLEARANCE))) continue;
      labels.push({ ...candidate, box });
      break;
    }
  }

  return labels;
}
