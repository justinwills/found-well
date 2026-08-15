/**
 * fetch with retry-on-transient-failure. Retries on 502/503/504 responses
 * and on network-level errors (connection drops, timeouts) with exponential
 * backoff. Does not retry on 4xx or other permanent failures — those won't
 * succeed on a second try and shouldn't cost the user extra wait time.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2,
  delayMs = 1000,
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if ((response.status === 502 || response.status === 503 || response.status === 504) && attempt < retries) {
        if (options.signal?.aborted) throw new Error("aborted");
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
        continue;
      }
      return response;
    } catch (err) {
      if (options.signal?.aborted) throw err;
      const isNetworkError =
        err instanceof Error &&
        (err.name === "TypeError" ||
          err.message.includes("ECONNRESET") ||
          err.message.includes("ETIMEDOUT") ||
          err.message.includes("fetch failed"));

      if (isNetworkError && attempt < retries) {
        console.warn(
          `Fetch to ${url} failed with transient error (${err instanceof Error ? err.message : String(err)}). Retrying attempt ${attempt + 1}/${retries}...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
        continue;
      }
      throw err;
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}
