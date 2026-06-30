export const SESSION_COOKIE_NAME = 'goowin_session';

export type GoowinUserRole =
  | 'GOOWIN_ADMIN'
  | 'GOOWIN_EDITOR'
  | 'CLIENT'
  | 'AGENCY';

export type AuthSession = {
  clientId: string | null;
  email: string;
  id: string;
  role: GoowinUserRole;
};

type JwtPayload = AuthSession & {
  exp?: number;
  sub?: string;
};

export function decodeSessionToken(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const [, payload] = token.split('.');

  if (!payload) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as Partial<JwtPayload>;
    const id = parsed.id ?? parsed.sub;

    if (!id || !parsed.email || !isGoowinUserRole(parsed.role)) {
      return null;
    }

    if (parsed.exp && parsed.exp * 1000 <= Date.now()) {
      return null;
    }

    return {
      clientId: parsed.clientId ?? null,
      email: parsed.email,
      id,
      role: parsed.role,
    } satisfies AuthSession;
  } catch {
    return null;
  }
}

export function getDefaultRouteForRole(role: GoowinUserRole) {
  switch (role) {
    case 'GOOWIN_ADMIN':
    case 'GOOWIN_EDITOR':
      return '/dashboard';
    case 'CLIENT':
      return '/client/dashboard';
    case 'AGENCY':
      return null;
  }
}

export function isAdminRole(role: GoowinUserRole) {
  return role === 'GOOWIN_ADMIN' || role === 'GOOWIN_EDITOR';
}

export function isClientRole(role: GoowinUserRole) {
  return role === 'CLIENT';
}

function isGoowinUserRole(role: unknown): role is GoowinUserRole {
  return (
    role === 'GOOWIN_ADMIN' ||
    role === 'GOOWIN_EDITOR' ||
    role === 'CLIENT' ||
    role === 'AGENCY'
  );
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '=',
  );

  return atob(padded);
}
