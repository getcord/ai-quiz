'use client';

import { BotFetti } from '@/ui/BotFetti';

import styles from '@/ui/Scorecard.module.css';
import classNames from 'classnames';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type ClientAnswers, resetTokenAndRestartGame } from './Quiz';
import type { BaseQuizQuestion } from '@/lib/questions';
import { parseThreadID } from '@/lib/threadID';
import { title } from '@/lib/meta';

const emojiNumbers = [
  '0️⃣1️⃣',
  '0️⃣2️⃣',
  '0️⃣3️⃣',
  '0️⃣4️⃣',
  '0️⃣5️⃣',
  '0️⃣6️⃣',
  '0️⃣7️⃣',
  '0️⃣8️⃣',
  '0️⃣9️⃣',
  '1️⃣0️⃣',
  '1️⃣1️⃣',
  '1️⃣2️⃣',
  '1️⃣3️⃣',
  '1️⃣4️⃣',
  '1️⃣5️⃣',
];

const GAME_URL = 'https://quiz.cord.com/';

export function getShareURL(firstThreadID: string | undefined) {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!firstThreadID) {
    return window.location.href;
  }

  const [id] = parseThreadID(firstThreadID);
  const url = new URL(window.location.href);
  url.pathname = `/share/${id}`;
  return url.toString();
}

function useCopyCallback(s: string): [boolean, () => void] {
  const [copied, setCopied] = useState(false);
  const callback = useCallback(() => {
    setCopied(true);
    navigator.clipboard.writeText(s).catch((_e) => {});
    setTimeout(() => setCopied(false), 3000);
  }, [s]);
  return [copied, callback];
}

export function Scorecard({
  questions,
  answers,
  firstThreadID,
}: {
  questions: BaseQuizQuestion[];
  answers: ClientAnswers;
  firstThreadID?: string;
}) {
  const readOnly = firstThreadID === undefined;
  const [shareURL, setShareURL] = useState<string | null>(null);
  useEffect(() => {
    setShareURL(getShareURL(firstThreadID));
  }, [setShareURL, firstThreadID]);

  const shellRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!readOnly && shellRef.current) {
      shellRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [readOnly]);

  let points = 0;
  let copyString = title + '\n';
  const output: React.ReactNode[] = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (answers[i]?.botAnswer === q.correctAnswerIndex) {
      points += 1;
    }

    copyString +=
      `🧩 ${emojiNumbers[i]} ` +
      `${answers[i]?.botAnswer === q.correctAnswerIndex ? '✅' : '❌'}\n`;

    output.push(
      <div key={q.question}>
        🧩 {emojiNumbers[i]}&nbsp;
        {answers[i]?.botAnswer === q.correctAnswerIndex ? '✅' : '❌'}
      </div>,
    );
  }
  copyString +=
    'You got ' +
    points +
    ' out of ' +
    questions.length +
    ' (' +
    Math.round((points / questions.length) * 100) +
    '%).\n\n';
  copyString += `Play here! ${GAME_URL}\n`;

  const didSendResult = useRef(false);
  useEffect(() => {
    if (readOnly || didSendResult.current) {
      return;
    }

    didSendResult.current = true;

    void fetch('/api/result', {
      body: JSON.stringify({
        answers,
        copyString,
        threadID: firstThreadID,
      }),
      method: 'POST',
    });
  });

  const [copiedScores, copyScores] = useCopyCallback(copyString);
  const [copiedShareURL, copyShareURL] = useCopyCallback(shareURL ?? '');

  return (
    <div
      ref={shellRef}
      style={{
        backgroundColor: `hsl(${256 - questions.length * 10}, 66%, 34%)`,
      }}
    >
      <div className={styles.scorecard}>
        <BotFetti score={Math.round((points / questions.length) * 100)} />
        <div className={styles.card}>
          <div className={classNames(styles.section, styles.heading)}>
            You got {points} out of {questions.length} (
            {Math.round((points / questions.length) * 100)}%).
          </div>
          <div className={styles.section}>{output}</div>
          <div className={classNames([styles.section, styles.small])}>
            Did you learn something?
            <br />
            Gain a better understanding of how GPT-4 and other LLMs work?
            <br />
            <br />
            Share this quiz with your friends:
          </div>
          <div className={classNames(styles.section, styles.buttons)}>
            <button onClick={copyScores}>
              {!copiedScores ? (
                <>
                  <Image src="/copy.svg" width={18} height={18} alt="Copy" />
                  &nbsp;Copy scores
                </>
              ) : (
                <>Copied!</>
              )}
            </button>
            {shareURL && (
              <button onClick={copyShareURL}>
                {!copiedShareURL ? (
                  <>
                    <Image src="/share.svg" width={18} height={18} alt="Copy" />
                    &nbsp;Copy link to these results
                  </>
                ) : (
                  <>Copied!</>
                )}
              </button>
            )}
          </div>
          <div className={classNames(styles.section, styles.buttons)}>
            <a
              // Don't need URL here since it's already part of the copyString.
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                copyString,
              )}`}
              target="_blank"
              className={styles.shareLink}
            >
              <Image
                src="/twitter.svg"
                width={18}
                height={18}
                alt="Twitter Logo"
              />
              Share to Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                GAME_URL,
              )}`}
              target="_blank"
              className={styles.shareLink}
            >
              <Image src="/fb.svg" width={18} height={18} alt="Facebook Logo" />
              Share to Facebook
            </a>
          </div>
          <div className={classNames([styles.section, styles.buttons])}>
            <button
              onClick={resetTokenAndRestartGame}
              className={styles.playAgain}
            >
              Play Again?
            </button>
          </div>
          <div className={classNames(styles.section, styles.footer)}></div>
        </div>
        <div className={styles.poweredBy}>
          Powered by the Cord SDK
          <br />
          for chat and message streaming
          <br />
          <a href="https://cord.com/" title="React chat UI library and backend">
            <Image
              className={styles.logo}
              src="/cord-logo.svg"
              width={180}
              height={59}
              alt={'Cord Logo'}
              title={
                'Cord offers the most feature-rich chat SDK on the internet'
              }
            />
          </a>
        </div>
      </div>
    </div>
  );
}
