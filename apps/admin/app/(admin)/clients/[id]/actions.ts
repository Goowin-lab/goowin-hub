'use server';

import { redirect } from 'next/navigation';

import {
  changeClientCommercialStatus,
  getClient,
  parseCommercialStatus,
  updateClient,
} from '@/lib/api/clients';
import { isApiConnectionError } from '@/lib/api/goowin-api';

export async function updateClientAction(id: string, formData: FormData) {
  let target = `/clients/${id}?updated=1`;

  try {
    const currentClient = await getClient(id);
    const commercialStatus = parseCommercialStatus(
      formData.get('commercialStatus'),
    );

    await updateClient(id, {
      name: getRequiredString(formData.get('name')),
      taxId: getOptionalString(formData.get('taxId')),
    });

    if (commercialStatus !== currentClient.commercialStatus) {
      await changeClientCommercialStatus(id, commercialStatus);
    }
  } catch (error) {
    target = isApiConnectionError(error)
      ? `/clients/${id}?error=connection`
      : `/clients/${id}?error=update`;
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
