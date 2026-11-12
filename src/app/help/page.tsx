import type { ReactNode } from "react";
import { Header, HeaderLink } from "@/components/common/Header";
import { CloseIcon, MicIcon } from "@/components/icons/ui-icons";

const SERVICE_STEPS = [
  "홈에서 배우고 싶은 서비스 고르기",
  "연습모드 또는 실전모드 고르기",
  "화면의 안내에 따라 천천히 눌러 보기",
  "마지막에 결과 확인하기",
];

const VOICE_STEPS = [
  "버튼을 누르고 질문 말하기",
  "음성과 글자로 답변 확인",
  "[닫기]를 눌러 원래 화면으로",
];

function StepList({ steps, numberClass }: { steps: string[]; numberClass: string }) {
  return (
    <ol className="flex flex-col gap-2.5 text-17 leading-[1.45] short:gap-1.5">
      {steps.map((step, index) => (
        <li key={step} className="flex gap-2.5">
          <span
            className={`flex size-[26px] flex-none items-center justify-center rounded-full text-16 font-bold ${numberClass}`}
          >
            {index + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

function HelpSection({
  title,
  className,
  children,
}: {
  title: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`flex flex-col gap-3 rounded-[28px] p-5 short:gap-2 short:py-3.5 ${className}`}
    >
      <h2 className="text-20 font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function HelpPage() {
  return (
    <>
      <Header
        right={
          <HeaderLink href="/" label="도움말 닫기">
            <CloseIcon size={18} />
            닫기
          </HeaderLink>
        }
      />
      <main className="flex min-h-0 overflow-y-auto *:shrink-0 flex-1 flex-col gap-4 p-5 short:gap-3 short:py-4">
        <h1 className="text-30 leading-[1.3] font-bold">도움말</h1>
        <HelpSection title="서비스 이용 방법" className="bg-gray-1">
          <StepList steps={SERVICE_STEPS} numberClass="bg-primary text-white-pure" />
        </HelpSection>
        <HelpSection title="AI 음성 도우미 이용 방법" className="bg-mint-light">
          <p className="text-17 leading-[1.45]">
            실전모드의 주문·결제 화면에서 모르는 게 있으면 하단의 주황색 &apos;음성 도우미&apos;
            버튼을 누르세요
          </p>
          <div className="flex h-[52px] items-center justify-center gap-2.5 rounded-full bg-orange text-18 font-bold short:h-12">
            <span className="flex size-[34px] items-center justify-center rounded-full bg-white-pure">
              <MicIcon size={20} />
            </span>
            음성 도우미
          </div>
          <StepList steps={VOICE_STEPS} numberClass="bg-white" />
        </HelpSection>
      </main>
    </>
  );
}
