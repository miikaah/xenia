export const humanizeSize = (size: number) => {
  if (size < 1_000_000_000) {
    if (size < 1_000_000) {
      if (size < 1000) {
        return `${size} B`;
      }

      return `${(size / 1000).toFixed(2)} kB`;
    }

    return `${(size / 1_000_000).toFixed(2)} MB`;
  }

  return `${(size / 1_000_000_000).toFixed(2)} GB`;
};

export const formatDate = (mtimeMs: number) => {
  const [y0, y1, y2, y3, m0, m1, d0, d1, mi0, mi1, h0, h1] = new Date(mtimeMs)
    .toISOString()
    .substring(0, 16)
    .replace(/[-:T]/g, "")
    .split("");

  return `${mi0}${mi1}:${h0}${h1} ${d0}${d1}.${m0}${m1}.${y0}${y1}${y2}${y3}`;
};
