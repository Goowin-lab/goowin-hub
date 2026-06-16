import { appConfig } from '@/lib/config';

type ApiFetchOptions = {
  body?: unknown;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
};

export class GoowinApiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GoowinApiConfigurationError';
  }
}

export class GoowinApiConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GoowinApiConnectionError';
  }
}

export class GoowinApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'GoowinApiRequestError';
  }
}

export function isApiConnectionError(error: unknown) {
  return (
    error instanceof GoowinApiConnectionError ||
    error instanceof GoowinApiConfigurationError
  );
}

export async function goowinApiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const apiToken = appConfig.apiToken;

  if (!apiToken) {
    throw new GoowinApiConfigurationError(
      'GOOWIN_API_TOKEN is required to call the Goowin Hub API.',
    );
  }

  const url = `${appConfig.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  let response: Response;

  try {
    response = await fetch(url, {
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      method: options.method ?? 'GET',
    });
  } catch {
    throw new GoowinApiConnectionError(
      'Could not connect to the Goowin Hub API.',
    );
  }

  if (!response.ok) {
    throw new GoowinApiRequestError(
      await getResponseErrorMessage(response),
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function getResponseErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as {
      message?: string | string[];
    };

    if (Array.isArray(payload.message)) {
      return payload.message.join(', ');
    }

    if (payload.message) {
      return payload.message;
    }
  } catch {
    return response.statusText;
  }

  return response.statusText;
}
