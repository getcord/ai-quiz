function env(k: string): string {
  const v = process.env[k];
  if (v !== undefined) {
    return v;
  }

  throw new Error('Missing key from .env: ' + k);
}

export const CORD_APPLICATION_ID = env('CORD_APPLICATION_ID');
export const CORD_API_SECRET = env('CORD_API_SECRET');

export const CLACK_APPLICATION_ID = process.env.CLACK_APPLICATION_ID;
export const CLACK_API_SECRET = process.env.CLACK_API_SECRET;
export const CLACK_CHANNEL = process.env.CLACK_CHANNEL;

export const CORD_SERVER = env('CORD_SERVER');

export const OPENAI_API_SECRET = env('OPENAI_API_SECRET');
export const SERVER = env('SERVER');

export const IPSTACK_API_SECRET = process.env.IPSTACK_API_SECRET;
