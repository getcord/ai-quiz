'use client';

import { useCallback, useEffect, useState } from 'react';
import { CordProvider } from '@cord-sdk/react';

import Question from '@/ui/Question';
import { Start } from '@/ui/Start';
import type { ClientQuizQuestion } from '@/app/page';

export function Quiz({
  questions,
  accessToken,
}: {
  questions: ClientQuizQuestion[];
  accessToken: string;
}) {
  return (
    <CordProvider clientAuthToken={accessToken}>
      <QuizImpl questions={questions} />
    </CordProvider>
  );
}

function QuizImpl({ questions }: { questions: ClientQuizQuestion[] }) {
  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [answers, setAnswers] = useState<
    { humanAnswer: number; botAnswer: number }[]
  >([]);

  useEffect(() => {
    window.location.hash = '';
  }, []);

  const showNextQuestion = useCallback(() => {
    const nextQuestion = currentQuestion + 1;
    void fetch('/api/begin-question', {
      body: JSON.stringify({ threadID: questions[nextQuestion].cordThreadID }),
      method: 'POST',
    });
    setCurrentQuestion(nextQuestion);
  }, [questions, currentQuestion]);

  if (currentQuestion === -1) {
    return <Start onStart={showNextQuestion} />;
  }

  let qs: React.ReactNode[] = [];
  for (let i = 0; i <= Math.min(questions.length - 1, currentQuestion); i++) {
    qs.push(
      <Question
        idx={i}
        key={questions[i].question}
        qq={questions[i]}
        {...answers[i]}
        onSubmit={(humanAnswer: number, botAnswer: number) => {
          const newAnswers = [...answers];
          newAnswers[i] = { humanAnswer, botAnswer };
          setAnswers(newAnswers);
        }}
        onNext={showNextQuestion}
      />,
    );
  }

  if (currentQuestion === questions.length) {
    qs.push(<p>All done!</p>);
  }

  return <>{qs}</>;
}
