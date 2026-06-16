'use server';

import { redirect } from 'next/navigation';

import { createClient, parseCommercialStatus } from '@/lib/api/clients';
import { isApiConnectionError } from '@/lib/api/goowin-api';

export async function createClientAction(formData: FormData) {
  let target = '/clients?created=1';

  try {
    const name = getRequiredString(formData.get('name'));

    await createClient({
      commercialStatus: parseCommercialStatus(formData.get('commercialStatus')),
      name,
      taxId: getOptionalString(formData.get('taxId')),
    });
  } catch (error) {
    target = isApiConnectionError(error)
      ? '/clients/new?error=connection'
      : '/clients/new?error=create';
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
