export function assetPath(path) {
  if (!path || !path.startsWith('/')) return path;

  const base = import.meta.env.BASE_URL || '/';
  return `${base.replace(/\/$/, '')}${path}`;
}
