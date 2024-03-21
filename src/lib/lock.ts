import type { ServerUserData } from '@cord-sdk/types';
import { fetchCordRESTApi } from './fetchCordRESTApi';

export async function lockGame(id: string) {
  const bot = 'b:' + id;
  await fetchCordRESTApi(
    '/v1/users/' + bot,
    'PUT',
    JSON.stringify({
      metadata: { locked: true },
    }),
  );
}

export async function assertGameNotLocked(id: string) {
  return await assertGameLock(id, false);
}

export async function assertGameLocked(id: string) {
  return await assertGameLock(id, true);
}

async function assertGameLock(id: string, expectedLock: boolean) {
  const bot = 'b:' + id;
  const botData: ServerUserData = await fetchCordRESTApi(
    '/v1/users/' + bot,
    'GET',
  );

  const actualLock = botData.metadata?.locked ?? false;
  if (expectedLock === actualLock) {
    return;
  }

  throw new Error(
    `Invalid lock state for game ${id}. Expected: ${expectedLock} but it was ${actualLock}`,
  );
}