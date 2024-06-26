/* eslint-disable @next/next/no-img-element */
'use client';

import type { CoreMessageData } from '@cord-sdk/types';

import questionStyles from '@/ui/Question.module.css';
import styles from '@/ui/StaticThread.module.css';
import { betaV2 } from '@cord-sdk/react';
import classNames from 'classnames';

function StaticMessage({ message }: { message: CoreMessageData }) {
  const isHuman = message.authorID.startsWith('h:');
  return (
    <div className="cord-message cord-no-reactions">
      <div className="cord-avatar-container cord-present">
        <img
          className="cord-avatar-image"
          src={isHuman ? '/avatar-black.svg' : '/bot-black.svg'}
          alt="avatar"
        />
      </div>
      <div className="cord-author-name cord-font-body-emphasis">
        {isHuman ? 'You' : 'GPT-4'}
      </div>
      <betaV2.MessageContent
        content={message.content as any}
        attachments={[]}
        edited={false}
        authorData={undefined}
      />
    </div>
  );
}

export function StaticThread({ thread }: { thread: CoreMessageData[] }) {
  return (
    <div
      className={classNames(
        questionStyles.cordThread,
        styles.staticThread,
        'cord-component',
        'cord-v1',
      )}
    >
      {thread.map((m) => (
        <StaticMessage key={m.id} message={m} />
      ))}{' '}
    </div>
  );
}
