/**
 * 디우미 백엔드 API 공통 호출.
 *
 * - 브라우저는 같은 주소의 /api/v1 로 부르고, src/app/api/v1/[...path]/route.ts 가 백엔드로 넘긴다.
 *   백엔드 CORS가 배포 주소만 허용해서 로컬에서도 막히지 않게 하려는 것이다.
 * - 백엔드는 요청·응답 키를 snake_case로 쓴다(Swagger 표기는 camelCase지만 실제는 다르다).
 *   요청은 snake_case로 바꿔 보내고, 응답은 camelCase로 바꿔 돌려준다.
 * - 응답은 { success, data, error } 공통 형식이다. 실패하면 ApiRequestError를 던진다.
 */

export const API_BASE_PATH = "/api/v1";

export type ApiErrorBody = { code: string; message: string };

export class ApiRequestError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(status: number, error: ApiErrorBody) {
    super(error.message);
    this.name = "ApiRequestError";
    this.code = error.code;
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  /** 방문자 등록 외 모든 API에 필요한 X-Visitor-Id */
  visitorId?: string;
  signal?: AbortSignal;
  /** 탭을 닫거나 페이지를 떠나도 요청이 끝까지 가게 한다 */
  keepalive?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, visitorId, signal, keepalive } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (visitorId) headers["X-Visitor-Id"] = visitorId;

  const response = await fetch(`${API_BASE_PATH}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(toSnakeKeys(body)),
    signal,
    keepalive,
  });

  let envelope: { success?: boolean; data?: unknown; error?: ApiErrorBody | null };
  try {
    envelope = await response.json();
  } catch {
    throw new ApiRequestError(response.status, {
      code: "INVALID_RESPONSE",
      message: "서버 응답을 읽을 수 없어요.",
    });
  }

  if (!response.ok || !envelope.success) {
    throw new ApiRequestError(
      response.status,
      envelope.error ?? { code: "UNKNOWN_ERROR", message: "요청을 처리하지 못했어요." },
    );
  }
  return toCamelKeys(envelope.data) as T;
}

const snakeToCamel = (key: string) => key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
const camelToSnake = (key: string) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

function mapKeys(value: unknown, rename: (key: string) => string): unknown {
  if (Array.isArray(value)) return value.map((item) => mapKeys(item, rename));
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [rename(key), mapKeys(inner, rename)]),
    );
  }
  return value;
}

export const toCamelKeys = (value: unknown) => mapKeys(value, snakeToCamel);
export const toSnakeKeys = (value: unknown) => mapKeys(value, camelToSnake);
