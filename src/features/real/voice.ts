import type { RealScreen } from "@/features/real/flow";
import type { PracticeService } from "@/features/practice/types";

type VoiceSample = { question: string; answer: string };

/**
 * 음성 도우미 시트에 보여 줄 예시 질문·답변 (mock).
 * 음성 인식과 AI 답변은 API 연동 때 붙이고, 지금은 화면마다 정해진 예시만 보여 준다.
 */
export const VOICE_SAMPLES: Record<RealScreen, VoiceSample> = {
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
  setChoice: {
    question: "세트가 뭐예요?",
    answer: "버거에 감자튀김과 콜라가 함께 나와요. 세트를 누르세요.",
  },
  setCompose: {
    question: "콜라는 어디서 골라요?",
    answer: "음료 줄에서 콜라를 누르고 선택 완료를 누르세요.",
  },
  burgerConfirm: {
    question: "이대로 담으면 되나요?",
    answer: "맞으면 장바구니 담기를 누르세요.",
  },
  orderReview: {
    question: "이제 결제하면 되나요?",
    answer: "주문 내역이 맞으면 주문 확인을 누르세요.",
  },
  paymentMethod: {
    question: "카드로 내려면요?",
    answer: "신용·체크카드를 누르면 돼요.",
  },
  payMobile: {
    question: "휴대폰을 어디에 대요?",
    answer: "키오스크 아래쪽 리더기에 휴대폰 뒷면을 가까이 대 주세요.",
  },
  payGiftCard: {
    question: "바코드는 어디 있어요?",
    answer: "기프트카드 뒷면에 있어요. 스캐너에 보여 주세요.",
  },
  payCard: {
    question: "카드는 어디에 넣나요?",
    answer: "카드는 화면 아래쪽 투입구에 넣어 주세요.",
  },
  done: {
    question: "이제 끝났나요?",
    answer: "네, 결제가 끝났어요. 결제 완료 확인을 누르세요.",
  },
  result: {
    question: "다시 해 볼 수 있나요?",
    answer: "다시 도전하기를 누르면 처음부터 할 수 있어요.",
  },
};

/** 카페와 문구가 다른 패스트푸드 화면 */
const FASTFOOD_SAMPLES: Partial<Record<RealScreen, VoiceSample>> = {
  dine: {
    question: "매장에서 먹으려면요?",
    answer: "매장에서 먹기를 누르면 돼요.",
  },
  menu: {
    question: "불고기버거는 어디 있어요?",
    answer: "메뉴판 첫 번째 칸에 있어요.",
  },
  done: {
    question: "이제 끝났나요?",
    answer: "네, 결제가 끝났어요. 영수증을 챙기고 주문번호 확인을 누르세요.",
  },
};

export function voiceSample(service: PracticeService, screen: RealScreen): VoiceSample {
  return (service === "fastfood" && FASTFOOD_SAMPLES[screen]) || VOICE_SAMPLES[screen];
}
