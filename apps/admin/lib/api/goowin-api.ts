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
    public readonly responseBody?: string,
  ) {
    super(message);
    this.name = 'GoowinApiRequestError';
  }
}

export function isApiConnectionError(error: unknown) {
  return error instanceof GoowinApiConnectionError;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(buildApiUrl('/health'), {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
      method: 'GET',
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function getApiErrorType(
  error: unknown,
): Promise<'api' | 'connection'> {
  if (error instanceof GoowinApiConnectionError) {
    return (await checkApiHealth()) ? 'api' : 'connection';
  }

  if (error instanceof GoowinApiConfigurationError) {
    return 'api';
  }

  return 'api';
}

export async function goowinApiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const apiToken = appConfig.apiToken;
  const method = options.method ?? 'GET';
  const url = buildApiUrl(path);

  if (!apiToken) {
    logApiDebug('configuration-error', {
      error: 'GOOWIN_API_TOKEN is required to call the Goowin Hub API.',
      method,
      payload: options.body,
      url,
    });

    throw new GoowinApiConfigurationError(
      'GOOWIN_API_TOKEN is required to call the Goowin Hub API.',
    );
  }

  let response: Response;

  logApiDebug('request', {
    authorizationHeader: 'Bearer <redacted>',
    method,
    payload: options.body,
    url,
  });

  try {
    response = await fetch(url, {
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      method,
    });
  } catch (error) {
    logApiDebug('connection-error', {
      error: getExactErrorMessage(error),
      method,
      payload: options.body,
      url,
    });

    throw new GoowinApiConnectionError(
      'Could not connect to the Goowin Hub API.',
    );
  }

  const responseBody = await response.text();

  logApiDebug('response', {
    body: responseBody,
    method,
    status: response.status,
    url,
  });

  if (!response.ok) {
    throw new GoowinApiRequestError(
      getResponseErrorMessage(response, responseBody),
      response.status,
      responseBody,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return JSON.parse(responseBody) as T;
}

function buildApiUrl(path: string) {
  return `${appConfig.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function getResponseErrorMessage(response: Response, responseBody: string) {
  try {
    const payload = JSON.parse(responseBody) as {
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

function getExactErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function logApiDebug(
  event: 'configuration-error' | 'connection-error' | 'request' | 'response',
  details: Record<string, unknown>,
) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  console.info(`[goowin-api:${event}]`, details);
}
