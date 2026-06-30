import { cookies } from 'next/headers';

import {
  AuthSession,
  decodeSessionToken,
  SESSION_COOKIE_NAME,
} from './session';

type ClientAuthSession = AuthSession & {
  clientId: string;
  role: 'CLIENT';
};

export function getSessionToken() {
  return cookies().get(SESSION_COOKIE_NAME)?.value ?? null;
}

export function getCurrentSession() {
  return decodeSessionToken(getSessionToken());
}

export function requireClientSession(): ClientAuthSession | null {
  const session = getCurrentSession();

  if (!session || session.role !== 'CLIENT' || !session.clientId) {
    return null;
  }

  return {
    ...session,
    clientId: session.clientId,
    role: 'CLIENT',
  };
}
