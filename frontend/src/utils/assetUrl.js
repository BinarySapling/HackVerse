const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const getApiOrigin = () => API_BASE.replace(/\/api\/v1\/?$/, '');

export const resolveAssetUrl = (pathOrUrl) => {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl) || pathOrUrl.startsWith('blob:')) {
    return pathOrUrl;
  }
  return `${getApiOrigin()}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
};
