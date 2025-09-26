export function clampPosition(x, y, scale, imgSize) {
  if (!imgSize) return { x, y };
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  const scaledW = imgSize.w * scale;
  const scaledH = imgSize.h * scale;

  if (scaledW <= viewportW) {
    x = (viewportW - scaledW) / 2;
  } else {
    const minX = viewportW - scaledW;
    const maxX = 0;
    x = Math.min(maxX, Math.max(minX, x));
  }

  if (scaledH <= viewportH) {
    y = (viewportH - scaledH) / 2;
  } else {
    const minY = viewportH - scaledH;
    const maxY = 0;
    y = Math.min(maxY, Math.max(minY, y));
  }

  return { x, y };
}
