'use server';

import { redirect } from 'next/navigation';

import { createClient, parseCommercialStatus } from '@/lib/api/clients';
import { GoowinApiRequestError, getApiErrorType } from '@/lib/api/goowin-api';

export async function createClientAction(formData: FormData) {
  let target = '/clients?created=1';

  try {
    const name = getRequiredString(formData.get('name'));
    const payload = {
      commercialStatus: parseCommercialStatus(formData.get('commercialStatus')),
      name,
      taxId: getOptionalString(formData.get('taxId')),
    };

    logCreateClientDebug('payload', payload);

    await createClient(payload);
  } catch (error) {
    const errorType = await getApiErrorType(error);
    const exactError = getExactActionError(error);

    logCreateClientDebug('error', {
      error: exactError,
      responseBody:
        error instanceof GoowinApiRequestError ? error.responseBody : undefined,
      status: error instanceof GoowinApiRequestError ? error.status : undefined,
    });

    const params = new URLSearchParams({
      error: errorType === 'connection' ? 'connection' : 'create',
    });

    if (process.env.NODE_ENV !== 'production') {
      params.set('detail', exactError);
    }

    target = `/clients/new?${params.toString()}`;
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

function getOptionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();

  return text || undefined;
}

function getExactActionError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function logCreateClientDebug(
  event: 'error' | 'payload',
  details: Record<string, unknown>,
) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  console.info(`[clients:create:${event}]`, details);
}
