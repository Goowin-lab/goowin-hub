const DEFAULT_API_BASE_URL = 'http://127.0.0.1:3000/api';

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, '');
}

export const appConfig = {
  apiBaseUrl: normalizeBaseUrl(
    process.env.NEXT_PUBLIC_API_URL ??
      process.env.NEXT_PUBLIC_GOOWIN_API_URL ??
      process.env.GOOWIN_API_URL ??
      DEFAULT_API_BASE_URL,
  ),
};
