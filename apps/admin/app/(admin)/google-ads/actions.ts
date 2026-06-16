'use server';

import { redirect } from 'next/navigation';

import {
  createGoogleAdsAccount,
  createGoogleAdsConsumption,
  createGoogleAdsDailyMovement,
  createGoogleAdsTopUp,
  parseGoogleAdsStatus,
  updateGoogleAdsAccount,
} from '@/lib/api/google-ads';
import { isApiConnectionError } from '@/lib/api/goowin-api';

export async function createGoogleAdsAccountAction(formData: FormData) {
  let target = '/google-ads?accountCreated=1';

  try {
    await createGoogleAdsAccount({
      accountName: getRequiredString(formData.get('accountName')),
      clientId: getRequiredString(formData.get('clientId')),
      cpcMultiplier: getOptionalString(formData.get('cpcMultiplier')),
      currencyCode: getOptionalString(formData.get('currencyCode')) ?? 'COP',
      customerId: getOptionalString(formData.get('customerId')),
      notes: getOptionalString(formData.get('notes')),
      status: parseGoogleAdsStatus(formData.get('status')),
    });
  } catch (error) {
    target = isApiConnectionError(error)
      ? '/google-ads?error=connection'
      : '/google-ads?error=account';
  }

  redirect(target);
}

export async function updateGoogleAdsAccountAction(formData: FormData) {
  let target = '/google-ads?accountUpdated=1';

  try {
    await updateGoogleAdsAccount(getRequiredString(formData.get('accountId')), {
      cpcMultiplier: getRequiredString(formData.get('cpcMultiplier')),
    });
  } catch (error) {
    target = isApiConnectionError(error)
      ? '/google-ads?error=connection'
      : '/google-ads?error=accountUpdate';
  }

  redirect(target);
}

export async function createGoogleAdsTopUpAction(formData: FormData) {
  let target = '/google-ads?topUpCreated=1';

  try {
    await createGoogleAdsTopUp(getRequiredString(formData.get('accountId')), {
      amount: getRequiredString(formData.get('amount')),
      notes: getOptionalString(formData.get('notes')),
      reference: getOptionalString(formData.get('reference')),
      toppedUpAt: getDateTimeString(formData.get('operationDate')),
    });
  } catch (error) {
    target = isApiConnectionError(error)
      ? '/google-ads?error=connection'
      : '/google-ads?error=topUp';
  }

  redirect(target);
}

export async function createGoogleAdsDailyMovementAction(formData: FormData) {
  let target = '/google-ads?movementCreated=1';

  try {
    await createGoogleAdsDailyMovement(
      getRequiredString(formData.get('accountId')),
      {
        balance: getOptionalString(formData.get('balance')),
        clicks: getOptionalNumber(formData.get('clicks')),
        consumption: getOptionalString(formData.get('consumption')),
        conversions: getOptionalNumber(formData.get('conversions')),
        cpcCost: getRequiredString(formData.get('cpcCost')),
        movementDate: getRequiredString(formData.get('movementDate')),
        notes: getOptionalString(formData.get('notes')),
        topUp: getOptionalString(formData.get('topUp')),
      },
    );
  } catch (error) {
    target = isApiConnectionError(error)
      ? '/google-ads?error=connection'
      : '/google-ads?error=movement';
  }

  redirect(target);
}

export async function createGoogleAdsConsumptionAction(formData: FormData) {
  let target = '/google-ads?consumptionCreated=1';

  try {
    await createGoogleAdsConsumption(
      getRequiredString(formData.get('accountId')),
      {
        amount: getRequiredString(formData.get('amount')),
        consumedAt: getDateTimeString(formData.get('operationDate')),
        notes: getOptionalString(formData.get('notes')),
      },
    );
  } catch (error) {
    target = isApiConnectionError(error)
      ? '/google-ads?error=connection'
      : '/google-ads?error=consumption';
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

function getDateTimeString(value: FormDataEntryValue | null) {
  const date = getOptionalString(value);

  if (!date) {
    return undefined;
  }

  return new Date(`${date}T12:00:00.000Z`).toISOString();
}

function getOptionalNumber(value: FormDataEntryValue | null) {
  const text = getOptionalString(value);

  if (!text) {
    return undefined;
  }

  const number = Number(text);

  if (!Number.isFinite(number)) {
    throw new Error('Numeric value is invalid.');
  }

  return number;
}
