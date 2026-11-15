import type { RealScreen } from "@/features/real/flow";

/**
 * 음성 도우미 시트에 보여 줄 예시 질문·답변 (mock).
 * 음성 인식과 AI 답변은 API 연동 때 붙이고, 지금은 화면마다 정해진 예시만 보여 준다.
 */
export const VOICE_SAMPLES: Record<RealScreen, { question: string; answer: string }> = {
  intro: {
    question: "무엇부터 하면 되나요?",
    answer: "미션 시작하기를 누르면 주문이 시작돼요.",
  },
  dine: {
    question: "포장은 어디서 골라요?",
    answer: "포장해서 갈래요를 누르면 돼요.",
  },
  menu: {
    question: "아메리카노는 어디 있어요?",
    answer: "커피 분류의 첫 번째 칸에 있어요.",
  },
  options: {
    question: "차갑게는 어떻게 해요?",
    answer: "온도에서 ICE를 누르면 차가운 음료가 돼요.",
  },
  paidOptions: {
    question: "꼭 골라야 하나요?",
    answer: "유료 옵션은 고르지 않아도 돼요. 선택 완료를 누르세요.",
  },
  freeOptions: {
    question: "그냥 넘어가도 되나요?",
    answer: "고르지 않으면 기본값으로 만들어 드려요.",
  },
  cart: {
    question: "2잔으로 바꾸려면요?",
    answer: "수량 옆 ＋를 누르면 한 잔씩 늘어나요.",
  },
  membership: {
    question: "쿠폰이 없으면요?",
    answer: "다음을 누르면 혜택 없이 결제로 넘어가요.",
  },
};
