import { goowinApiFetch, goowinPublicApiFetch } from './goowin-api';

export type AuthUserRole =
  | 'GOOWIN_ADMIN'
  | 'GOOWIN_EDITOR'
  | 'CLIENT'
  | 'AGENCY';

export type AuthUser = {
  clientId: string | null;
  email: string;
  fullName: string;
  id: string;
  role: AuthUserRole;
};

export type LoginResponse = {
  authenticated: boolean;
  redirectTo: string | null;
  token: string;
  user: AuthUser;
};

export type AuthSessionResponse = {
  authenticated: boolean;
  redirectTo: string | null;
  user: AuthUser;
};

export function login(email: string, password: string) {
  return goowinPublicApiFetch<LoginResponse>('/auth/login', {
    body: {
      email,
      password,
    },
    method: 'POST',
  });
}

export function logout() {
  return goowinApiFetch('/auth/logout', {
    method: 'POST',
  });
}

export function getSession() {
  return goowinApiFetch<AuthSessionResponse>('/auth/session');
}

export function getMe() {
  return goowinApiFetch<AuthUser>('/auth/me');
}
