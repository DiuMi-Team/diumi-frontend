import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const STORAGE_KEY = "diumi.visitorId";

function visitorResponse(visitorId: string, isNew: boolean) {
  return new Response(
    JSON.stringify({
      success: true,
      data: { visitor_id: visitorId, is_new: isNew, created_at: "", last_accessed_at: "" },
      error: null,
    }),
    { status: isNew ? 201 : 200 },
  );
}

const invalidResponse = () =>
  new Response(
    JSON.stringify({
      success: false,
      data: null,
      error: { code: "INVALID_REQUEST", message: "요청 형식이 올바르지 않습니다." },
    }),
    { status: 400 },
  );

let store: Map<string, string>;

beforeEach(() => {
  vi.resetModules();
  store = new Map();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const sentBody = (fetchMock: ReturnType<typeof vi.fn>, call = 0) =>
  JSON.parse(fetchMock.mock.calls[call][1].body);

describe("ensureVisitor", () => {
  it("처음이면 빈 본문으로 등록하고 받은 visitorId를 저장한다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(visitorResponse("new-id", true));
    vi.stubGlobal("fetch", fetchMock);
    const { ensureVisitor } = await import("@/features/api/visitor");

    const visitor = await ensureVisitor();

    expect(visitor).toMatchObject({ visitorId: "new-id", isNew: true });
    expect(sentBody(fetchMock)).toEqual({});
    expect(store.get(STORAGE_KEY)).toBe("new-id");
  });

  it("저장된 visitorId가 있으면 snake_case로 보내 재방문으로 등록하고, 동시에 불러도 한 번만 요청한다", async () => {
    store.set(STORAGE_KEY, "saved-id");
    const fetchMock = vi.fn().mockResolvedValue(visitorResponse("saved-id", false));
    vi.stubGlobal("fetch", fetchMock);
    const { ensureVisitor } = await import("@/features/api/visitor");

    const [first, second] = await Promise.all([ensureVisitor(), ensureVisitor()]);

    expect(first).toBe(second);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sentBody(fetchMock)).toEqual({ visitor_id: "saved-id" });
  });

  it("저장된 ID가 형식 오류로 거절되면 새 방문자로 다시 등록한다", async () => {
    store.set(STORAGE_KEY, "broken");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(invalidResponse())
      .mockResolvedValueOnce(visitorResponse("fresh-id", true));
    vi.stubGlobal("fetch", fetchMock);
    const { ensureVisitor } = await import("@/features/api/visitor");

    await expect(ensureVisitor()).resolves.toMatchObject({ visitorId: "fresh-id" });
    expect(sentBody(fetchMock, 1)).toEqual({});
    expect(store.get(STORAGE_KEY)).toBe("fresh-id");
  });

  it("실패하면 다음 호출에서 다시 시도한다", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("network"))
      .mockResolvedValueOnce(visitorResponse("retry-id", true));
    vi.stubGlobal("fetch", fetchMock);
    const { ensureVisitor } = await import("@/features/api/visitor");

    await expect(ensureVisitor()).rejects.toThrow("network");
    await expect(ensureVisitor()).resolves.toMatchObject({ visitorId: "retry-id" });
  });
});
