import { describe, it, expect, vi } from "vitest";
import { HttpError, parseErrorOr, isAuthError, isForbiddenError, withAuthDetect } from "./httpClient";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("parseErrorOr", () => {
  it("returns the parsed JSON body on a 2xx response", async () => {
    const res = jsonResponse(200, { hello: "world" });
    await expect(parseErrorOr(res, "fallback")).resolves.toEqual({ hello: "world" });
  });

  it("throws an HttpError carrying the status and server message on a non-2xx response", async () => {
    const res = jsonResponse(403, { error: "not authorized" });
    await expect(parseErrorOr(res, "fallback")).rejects.toMatchObject({ status: 403, message: "not authorized" });
  });

  it("falls back to the generic message when the server omits an error field", async () => {
    const res = jsonResponse(500, {});
    await expect(parseErrorOr(res, "fallback message")).rejects.toMatchObject({
      status: 500,
      message: "fallback message",
    });
  });

  // Reported/verified during /plan-eng-review (2026-08-23): the backend has no app.onError
  // handler, so an uncaught exception can return a non-JSON body (e.g. Hono's default plain-text
  // error page). Without this guard, res.json() would throw a SyntaxError that swallows the
  // caller's own fallback message entirely.
  it("falls back to the generic message instead of throwing on a non-JSON error body", async () => {
    const res = new Response("Internal Server Error", { status: 500 });
    await expect(parseErrorOr(res, "fallback message")).rejects.toMatchObject({
      status: 500,
      message: "fallback message",
    });
  });
});

describe("isAuthError", () => {
  it("returns true for an HttpError with status 401", () => {
    expect(isAuthError(new HttpError(401, "nope"))).toBe(true);
  });

  it("returns false for an HttpError with a different status", () => {
    expect(isAuthError(new HttpError(403, "nope"))).toBe(false);
  });

  it("returns false for a plain Error", () => {
    expect(isAuthError(new Error("network blip"))).toBe(false);
  });

  it("returns false for a non-Error value", () => {
    expect(isAuthError("just a string")).toBe(false);
  });
});

describe("isForbiddenError", () => {
  it("returns true for an HttpError with status 403", () => {
    expect(isForbiddenError(new HttpError(403, "nope"))).toBe(true);
  });

  it("returns false for an HttpError with a different status", () => {
    expect(isForbiddenError(new HttpError(401, "nope"))).toBe(false);
  });

  it("returns false for a plain Error", () => {
    expect(isForbiddenError(new Error("network blip"))).toBe(false);
  });

  it("returns false for a non-Error value", () => {
    expect(isForbiddenError("just a string")).toBe(false);
  });
});

describe("withAuthDetect", () => {
  it("returns the action's value on success without calling signOut", async () => {
    const signOut = vi.fn().mockResolvedValue(undefined);
    const result = await withAuthDetect(() => Promise.resolve("ok"), signOut);
    expect(result).toBe("ok");
    expect(signOut).not.toHaveBeenCalled();
  });

  it("fires signOut without awaiting it, then rethrows the same error, on a 401", async () => {
    const signOut = vi.fn().mockResolvedValue(undefined);
    const authError = new HttpError(401, "Authentication required");

    await expect(withAuthDetect(() => Promise.reject(authError), signOut)).rejects.toBe(authError);
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it("does not call signOut and rethrows unchanged on a non-401 HttpError", async () => {
    const signOut = vi.fn().mockResolvedValue(undefined);
    const forbiddenError = new HttpError(403, "Not authorized");

    await expect(withAuthDetect(() => Promise.reject(forbiddenError), signOut)).rejects.toBe(forbiddenError);
    expect(signOut).not.toHaveBeenCalled();
  });

  it("does not call signOut and rethrows unchanged on a plain (non-HTTP) error", async () => {
    const signOut = vi.fn().mockResolvedValue(undefined);
    const networkError = new Error("Failed to fetch");

    await expect(withAuthDetect(() => Promise.reject(networkError), signOut)).rejects.toBe(networkError);
    expect(signOut).not.toHaveBeenCalled();
  });

  it("does not block the rejection on signOut resolving (fire-and-forget)", async () => {
    let resolveSignOut: () => void = () => {};
    const signOut = vi.fn(() => new Promise<void>((resolve) => (resolveSignOut = resolve)));
    const authError = new HttpError(401, "Authentication required");

    const promise = withAuthDetect(() => Promise.reject(authError), signOut).catch((err: unknown) => err);
    // The rejection resolves even though signOut()'s own promise is still pending.
    await expect(promise).resolves.toBe(authError);

    resolveSignOut();
  });
});
