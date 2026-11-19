/**
 * 백엔드 API 프록시. 브라우저는 같은 주소의 /api/v1/* 를 부르고, 서버에서 백엔드로 넘긴다.
 *
 * 백엔드 CORS가 배포 주소만 허용하고, 허용 안 된 Origin 헤더가 붙은 요청은 403으로 막는다.
 * next.config rewrites는 브라우저의 Origin 헤더를 그대로 넘겨 로컬에서 막히므로,
 * 여기서 필요한 헤더만 골라 보낸다.
 */

/** 백엔드 API Base URL (/api/v1 까지). Vercel·.env.local의 DIUMI_API_BASE_URL로 바꿀 수 있다 */
const API_BASE_URL = (
  process.env.DIUMI_API_BASE_URL ?? "https://diumi-api.up.railway.app/api/v1"
).replace(/\/+$/, "");

/** 백엔드로 넘기는 요청 헤더 */
const FORWARDED_HEADERS = ["accept", "content-type", "x-visitor-id"];

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: Request, { params }: RouteContext): Promise<Response> {
  const { path } = await params;
  const { search } = new URL(request.url);
  const target = `${API_BASE_URL}/${path.map(encodeURIComponent).join("/")}${search}`;

  const headers = new Headers();
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return Response.json(
      {
        success: false,
        data: null,
        error: { code: "UPSTREAM_UNAVAILABLE", message: "서버에 연결하지 못했어요." },
      },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
