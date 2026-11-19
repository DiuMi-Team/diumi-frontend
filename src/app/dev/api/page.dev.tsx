import { ApiConnectionCheck } from "./ApiConnectionCheck";

/** 백엔드 API 연결을 개발 중에 확인하는 페이지. 배포본에는 라우트가 없다. */
export default function ApiConnectionCheckPage() {
  return <ApiConnectionCheck />;
}
