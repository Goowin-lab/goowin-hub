'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { login } from '@/lib/api/auth';
import { getApiErrorType, GoowinApiRequestError } from '@/lib/api/goowin-api';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

const ONE_HOUR_IN_SECONDS = 60 * 60;

export async function loginAction(formData: FormData) {
  let target = '/login?error=credentials';

  try {
    const email = getRequiredString(formData.get('email')).toLowerCase();
    const password = getRequiredString(formData.get('password'));
    const session = await login(email, password);

    if (!session.redirectTo) {
      target = '/login?error=role';
    } else {
      cookies().set(SESSION_COOKIE_NAME, session.token, {
        httpOnly: true,
        maxAge: ONE_HOUR_IN_SECONDS,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      target = session.redirectTo;
    }
  } catch (error) {
    target = getLoginErrorTarget(error, await getApiErrorType(error));
  }

  redirect(target);
}

function getRequiredString(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();

  if (!text) {
    throw new Error('Required value is missing.');
  }

  return text;
}

function getLoginErrorTarget(
  error: unknown,
  type: 'api' | 'connection',
) {
  if (type === 'connection') {
    return '/login?error=connection';
  }

  if (error instanceof GoowinApiRequestError && error.status === 403) {
    return '/login?error=role';
  }

  return '/login?error=credentials';
}
