import { createHmac } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:3000/api';
const LOCAL_DEV_ADMIN_USER_ID =
  process.env.GOOWIN_API_ACTOR_USER_ID ??
  '00000000-0000-4000-8000-000000000001';

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, '');
}

function parseEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const [key, ...valueParts] = line.split('=');
        return [key, valueParts.join('=').replace(/^["']|["']$/g, '')];
      }),
  );
}

function getLocalApiJwtSecret() {
  const candidates = [
    path.resolve(process.cwd(), '../api/.env'),
    path.resolve(process.cwd(), 'apps/api/.env'),
  ];

  for (const candidate of candidates) {
    const env = parseEnvFile(candidate);
    if (typeof env.JWT_SECRET === 'string' && env.JWT_SECRET) {
      return env.JWT_SECRET;
    }
  }

  return undefined;
}

function base64Url(input: string | Buffer) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function signJwt(payload: Record<string, unknown>, secret: string) {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64Url(JSON.stringify(payload));
  const signature = base64Url(
    createHmac('sha256', secret).update(`${header}.${body}`).digest(),
  );

  return `${header}.${body}.${signature}`;
}

function createLocalDevelopmentApiToken() {
  if (process.env.NODE_ENV === 'production') {
    return '';
  }

  const secret = process.env.GOOWIN_API_JWT_SECRET ?? getLocalApiJwtSecret();
  if (!secret) {
    return '';
  }

  const now = Math.floor(Date.now() / 1000);

  return signJwt(
    {
      clientId: null,
      email: 'admin-local@goowin.local',
      exp: now + 60 * 60,
      iat: now,
      role: 'GOOWIN_ADMIN',
      sub: LOCAL_DEV_ADMIN_USER_ID,
    },
    secret,
  );
}

export const appConfig = {
  apiBaseUrl: normalizeBaseUrl(
    process.env.NEXT_PUBLIC_API_URL ??
      process.env.NEXT_PUBLIC_GOOWIN_API_URL ??
      process.env.GOOWIN_API_URL ??
      DEFAULT_API_BASE_URL,
  ),
  get apiToken() {
    return (
      process.env.GOOWIN_API_TOKEN ??
      process.env.NEXT_PUBLIC_GOOWIN_API_TOKEN ??
      createLocalDevelopmentApiToken()
    );
  },
};
