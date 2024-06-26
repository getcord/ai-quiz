import { fetchCordRESTApi } from '@/lib/fetchCordRESTApi';
import { loadGameProgress } from '@/lib/progress';
import { Scorecard } from '@/ui/Scorecard';
import StaticQuestion from '@/ui/StaticQuestion';
import { StaticThread } from '@/ui/StaticThread';
import type { TickerText } from '@/ui/TickerText';
import type { CoreMessageData } from '@cord-sdk/types';

const StaticText: typeof TickerText = ({ text }) => <>{text}</>;

export default async function Share({ params }: { params: { id: string } }) {
  const progress = await loadGameProgress(params.id);
  if (!progress) {
    return <div>Invalid game ID.</div>;
  }
  const { questions, answers } = progress;

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
          botAnswer={answers[idx]?.botAnswer}
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
