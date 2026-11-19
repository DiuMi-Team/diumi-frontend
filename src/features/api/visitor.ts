import { apiRequest, ApiRequestError } from "@/features/api/client";

/**
 * 방문자 등록. 로그인 없이 브라우저마다 visitorId(UUID)를 하나 받아 저장해 두고,
 * 다른 API를 부를 때 X-Visitor-Id 헤더로 보낸다.
 */

export type Visitor = {
  visitorId: string;
  isNew: boolean;
  createdAt: string;
  lastAccessedAt: string;
};

export const VISITOR_STORAGE_KEY = "diumi.visitorId";

/** 처음이면 새로 만들고, 저장해 둔 visitorId가 있으면 재방문으로 등록한다 */
export function registerVisitor(visitorId?: string): Promise<Visitor> {
  return apiRequest<Visitor>("/visitors", {
    method: "POST",
    body: visitorId ? { visitorId } : {},
  });
}

function readStoredVisitorId(): string | undefined {
  try {
    return window.localStorage.getItem(VISITOR_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function storeVisitorId(visitorId: string) {
  try {
    window.localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
  } catch {
    /* 저장을 못 하면 다음 방문 때 새 방문자로 등록된다 */
  }
}

let pending: Promise<Visitor> | null = null;

/** 저장된 ID가 형식이 틀려 거절되면(400 INVALID_REQUEST) 버리고 새 방문자로 등록한다 */
async function registerWithStoredId(): Promise<Visitor> {
  const storedId = readStoredVisitorId();
  try {
    return await registerVisitor(storedId);
  } catch (error) {
    if (storedId && error instanceof ApiRequestError && error.code === "INVALID_REQUEST") {
      return registerVisitor();
    }
    throw error;
  }
}

/**
 * 저장된 방문자로 등록하고(없으면 새로) 받은 visitorId를 저장한다. 동시에 불러도 한 번만 요청한다.
 * 서버에 없는 ID를 보내면 서버가 새 ID를 주므로, 저장값은 항상 응답으로 덮어쓴다.
 */
export function ensureVisitor(): Promise<Visitor> {
  pending ??= registerWithStoredId()
    .then((visitor) => {
      storeVisitorId(visitor.visitorId);
      return visitor;
    })
    .catch((error: unknown) => {
      pending = null;
      throw error;
    });
  return pending;
}
