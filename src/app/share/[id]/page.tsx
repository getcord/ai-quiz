import { fetchCordRESTApi } from '@/lib/fetchCordRESTApi';
import type { BaseQuizQuestion } from '@/lib/questions';
import type { ClientAnswers } from '@/ui/Quiz';
import { Scorecard } from '@/ui/Scorecard';
import StaticQuestion from '@/ui/StaticQuestion';
import { StaticThread } from '@/ui/StaticThread';
import type { TickerText } from '@/ui/TickerText';
import type { CoreMessageData, ServerUserData } from '@cord-sdk/types';

const error = <div>Invalid game ID.</div>;

const StaticText: typeof TickerText = ({ text }) => <>{text}</>;

export default async function Share({ params }: { params: { id: string } }) {
  const bot = 'b:' + params.id;

  let botData: ServerUserData;
  try {
    botData = await fetchCordRESTApi('/v1/users/' + bot, 'GET');
  } catch (e) {
    console.log(e);
    return error;
  }

  if (botData.metadata.locked !== true) {
    return error;
  }

  const questions: BaseQuizQuestion[] = JSON.parse(
    String(botData.metadata.questions),
  );

  const answers: ClientAnswers = JSON.parse(String(botData.metadata.answers));

  const cordThreadData = await Promise.all(
    questions.map(async (_q, n) => {
      const threadID = 't:' + params.id + ':' + n;
      return await fetchCordRESTApi<CoreMessageData[]>(
        `/v1/threads/${threadID}/messages?sortDirection=ascending`,
      );
    }),
  );

  return (
    <div>
      {questions.map((qq, idx) => (
        <StaticQuestion
          key={idx}
          active={false}
          final={true}
          idx={idx}
          qq={qq}
          numQuestions={questions.length}
          humanAnswer={answers[idx].humanAnswer}
          botAnswer={answers[idx].botAnswer}
          onChangeHumanAnswer={(_) => {}}
          onSubmit={(_a, _b) => {}}
          onNext={() => {}}
          Text={StaticText}
          Thread={() => <StaticThread thread={cordThreadData[idx]} />}
        />
      ))}
      <Scorecard answers={answers} questions={questions} />
    </div>
  );
}