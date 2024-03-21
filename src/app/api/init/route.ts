import { getClientAuthToken } from '@cord-sdk/server';

import { questions } from '@/lib/questions';
import { uuid } from '@/lib/uuid';
import { fetchCordRESTApi } from '@/lib/fetchCordRESTApi';
import { CORD_API_SECRET, CORD_APPLICATION_ID, SERVER } from '@/lib/env';
import { NextResponse } from 'next/server';
import type { ClientQuizQuestion } from '@/app/page';

export type QuizData = {
  cordAccessToken: string;
  questions: ClientQuizQuestion[];
};

async function getQuizData(): Promise<QuizData> {
  const id = uuid();

  const human = 'h:' + id;
  const bot = 'b:' + id;
  const group = 'g:' + id;
  const thread = async (n: number) => {
    const threadID = 't:' + id + ':' + String(n);

    await fetchCordRESTApi(
      '/v1/threads',
      'POST',
      JSON.stringify({
        id: threadID,
        name: 'Question ' + String(n),
        url: SERVER,
        groupID: group,
        location: { id, n },
      }),
    );

    return threadID;
  };

  await fetchCordRESTApi(
    '/v1/groups/' + group,
    'PUT',
    JSON.stringify({
      name: 'Quiz Group for ' + id,
    }),
  );

  const [_humans, _bots, questionsWithThreadID] = await Promise.all([
    fetchCordRESTApi(
      '/v1/users/' + human,
      'PUT',
      JSON.stringify({
        name: 'You',
        profilePictureURL: SERVER + '/avatar-black.svg',
        addGroups: [group],
      }),
    ),
    fetchCordRESTApi(
      '/v1/users/' + bot,
      'PUT',
      JSON.stringify({
        name: 'AI',
        profilePictureURL: SERVER + '/bot-black.svg',
        addGroups: [group],
      }),
    ),
    // Work around Cord issue with serializable txns when concurrently creating
    // threads by doing them serially. Flooey is looking into it -- when fixed,
    // we can replace this loop with simply:
    // Promise.all(questions.map(async (q, n) => ({ ...q, cordThreadID: await thread(n) })))
    (async () => {
      const result = [];
      for (let n = 0; n < questions.length; n++) {
        result.push({ ...questions[n], cordThreadID: await thread(n) });
      }
      return result;
    })(),
  ]);

  return {
    cordAccessToken: getClientAuthToken(CORD_APPLICATION_ID, CORD_API_SECRET, {
      user_id: human,
    }),
    questions: questionsWithThreadID,
  };
}

export async function POST(req: Request) {
  const data = await getQuizData();
  return NextResponse.json(data);
}
