/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  REPO_STORE?: DurableObjectNamespaceLike;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface DurableObjectNamespaceLike {
  idFromName(name: string): unknown;
  get(id: unknown): { fetch(request: Request): Promise<Response> };
}

interface DurableObjectStateLike {
  storage: {
    get<T>(key: string): Promise<T | undefined>;
    put<T>(key: string, value: T): Promise<void>;
  };
}

type Repo = {
  id: string;
  name: string;
  description: string;
  icon: string;
  githubUrl: string;
  cloudflareUrl: string;
  tone: string;
};

type RepoCollection = {
  repos: Repo[];
  updatedAt: string;
};

const REPO_STORAGE_KEY = "repos";
const SHARED_REPO_NAME = "pika-repo-shared-v1";
const JSON_HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
};

function json(data: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isHttpUrl(value: string, allowEmpty = false) {
  if (allowEmpty && value === "") return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isRepo(value: unknown): value is Repo {
  if (!isRecord(value)) return false;
  return typeof value.id === "string" && value.id.length > 0 && value.id.length <= 100
    && typeof value.name === "string" && value.name.trim().length > 0 && value.name.length <= 120
    && typeof value.description === "string" && value.description.length <= 500
    && typeof value.icon === "string" && value.icon.length <= 24
    && typeof value.githubUrl === "string" && value.githubUrl.length <= 500 && isHttpUrl(value.githubUrl)
    && typeof value.cloudflareUrl === "string" && value.cloudflareUrl.length <= 500 && isHttpUrl(value.cloudflareUrl, true)
    && typeof value.tone === "string" && value.tone.length <= 30;
}

function isRepoCollection(value: unknown): value is RepoCollection {
  if (!isRecord(value) || !Array.isArray(value.repos)) return false;
  if (value.repos.length > 200 || typeof value.updatedAt !== "string" || !Number.isFinite(Date.parse(value.updatedAt))) return false;
  const ids = new Set<string>();
  for (const repo of value.repos) {
    if (!isRepo(repo) || ids.has(repo.id)) return false;
    ids.add(repo.id);
  }
  return true;
}

export class RepoStore {
  constructor(private readonly state: DurableObjectStateLike) {}

  async fetch(request: Request): Promise<Response> {
    if (request.method === "GET") {
      const collection = await this.state.storage.get<RepoCollection>(REPO_STORAGE_KEY);
      return collection ? json(collection) : json({ error: "No repository data" }, 404);
    }

    if (request.method === "PUT") {
      const contentLength = Number(request.headers.get("content-length") ?? "0");
      if (contentLength > 500_000) return json({ error: "Payload too large" }, 413);

      let collection: unknown;
      try {
        collection = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }

      if (!isRepoCollection(collection)) return json({ error: "Invalid repository data" }, 400);
      await this.state.storage.put(REPO_STORAGE_KEY, collection);
      return json(collection);
    }

    return json({ error: "Method not allowed" }, 405, { allow: "GET, PUT" });
  }
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/repos") {
      if (!env.REPO_STORE) return json({ error: "Repository sync is unavailable" }, 503);
      const id = env.REPO_STORE.idFromName(SHARED_REPO_NAME);
      return env.REPO_STORE.get(id).fetch(request);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
