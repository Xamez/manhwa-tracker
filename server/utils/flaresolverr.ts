const config = useRuntimeConfig();
const FLARESOLVERR_URL = config.flaresolverrUrl || 'http://localhost:8191/v1';

interface FlareSolverrResponse {
  status: string;
  message?: string;
  solution?: {
    url: string;
    status: number;
    response: string;
    cookies: any[];
    userAgent: string;
  };
  session?: string;
  startTimestamp?: number;
  endTimestamp?: number;
  version?: string;
}

let currentSession: string | null = null;
let sessionCreationPromise: Promise<string> | null = null;
let sessionCreatedAt = 0;
let requestCount = 0;

const SESSION_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 10; // Recycle session after 10 requests

async function createSession(): Promise<string> {
  try {
    const response = await fetch(FLARESOLVERR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'sessions.create' }),
    });
    const json = (await response.json()) as FlareSolverrResponse;
    if (json.status === 'ok' && json.session) {
      console.log(`Created new FlareSolverr session: ${json.session}`);
      return json.session;
    }
    throw new Error('Failed to create session: ' + JSON.stringify(json));
  } catch (e) {
    console.error('Error creating FlareSolverr session:', e);
    throw e;
  }
}

async function destroySession(session: string) {
  try {
    await fetch(FLARESOLVERR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'sessions.destroy', session }),
    });
    console.log(`Destroyed FlareSolverr session: ${session}`);
  } catch (e) {
    console.warn(`Failed to destroy session ${session}:`, e);
  }
}

async function getSession(): Promise<string> {
  const now = Date.now();
  if (currentSession && now - sessionCreatedAt < SESSION_TTL && requestCount < MAX_REQUESTS) {
    return currentSession;
  }

  if (sessionCreationPromise) {
    return sessionCreationPromise;
  }

  sessionCreationPromise = (async () => {
    if (currentSession) {
      await destroySession(currentSession);
      currentSession = null;
    }

    try {
      const session = await createSession();
      currentSession = session;
      sessionCreatedAt = Date.now();
      requestCount = 0;
      return session;
    } finally {
      sessionCreationPromise = null;
    }
  })();

  return sessionCreationPromise;
}

export async function fetchWithFlareSolverr(url: string): Promise<string> {
  let session = await getSession();
  requestCount++;

  try {
    const response = await fetch(FLARESOLVERR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cmd: 'request.get',
        url: url,
        maxTimeout: 60000,
        session: session,
      }),
    });

    const json = (await response.json()) as FlareSolverrResponse;

    if (json.status === 'ok' && json.solution) {
      return json.solution.response;
    } else {
      // If it fails, it might be a session issue. Try once more with a new session.
      console.warn('FlareSolverr request failed, retrying with new session...', json);

      // Force new session
      if (currentSession) {
        await destroySession(currentSession);
        currentSession = null;
      }
      session = await getSession();

      const retryResponse = await fetch(FLARESOLVERR_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cmd: 'request.get',
          url: url,
          maxTimeout: 60000,
          session: session,
        }),
      });

      const retryJson = (await retryResponse.json()) as FlareSolverrResponse;
      if (retryJson.status === 'ok' && retryJson.solution) {
        return retryJson.solution.response;
      }

      throw new Error('FlareSolverr failed after retry: ' + JSON.stringify(retryJson));
    }
  } catch (e) {
    console.error('FlareSolverr error:', e);
    throw e;
  }
}
