export function coverSrc(slug: string, width: 480 | 960 | 1600 = 960): string {
  return `/images/selected-work/web/${slug}-${width}.webp`;
}

export function coverSrcSet(slug: string): string {
  return [480, 960, 1600].map((width) => `${coverSrc(slug, width as 480 | 960 | 1600)} ${width}w`).join(', ');
}
