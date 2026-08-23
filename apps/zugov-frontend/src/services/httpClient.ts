// Shared HTTP error-handling for every service file's authenticated writes
// (/plan-eng-review, 2026-08-23, Batch 1 of the 401-detect wrapper rollout — see
// TODOS.md's "Roll out shared 401-detect wrapper to remaining write call sites"). Before this
// file, 4 service files each had a byte-identical `parseErrorOr` copy that threw a bare `Error`
// with no status code, so nothing could tell a 401 (session expired) apart from any other
// failure without every file inventing its own status-check.

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Same contract every service file's local copy had: throws on !res.ok, returns parsed JSON
 * otherwise. Falls back to `fallback` (not a SyntaxError) if the error body isn't valid JSON —
 * the backend has no app.onError handler, so an uncaught 500 can return a non-JSON body. */
export async function parseErrorOr<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    let message = fallback;
    try {
      const data = (await res.json()) as { error: string };
      message = data.error ?? fallback;
    } catch {
      // Non-JSON error body — keep the generic fallback instead of throwing a confusing
      // SyntaxError that would swallow the caller's own error message entirely.
    }
    throw new HttpError(res.status, message);
  }
  return res.json() as Promise<T>;
}

export function isAuthError(err: unknown): boolean {
  return err instanceof HttpError && err.status === 401;
}

/** Opt-in wrapper every write call site adds around its existing API call — no catch-block
 * changes needed. On a 401, fires signOut() without awaiting it (matching every existing call
 * site's non-blocking behavior — signOut() has no timeout, so awaiting it here would freeze the
 * caller's error display on a slow/hanging /api/auth/logout) and rethrows the SAME error object
 * unchanged, so existing `instanceof OwnershipError`/`err.message` catches keep working exactly
 * as before. */
export async function withAuthDetect<T>(action: () => Promise<T>, signOut: () => Promise<void>): Promise<T> {
  try {
    return await action();
  } catch (err) {
    if (isAuthError(err)) {
      void signOut();
    }
    throw err;
  }
}
