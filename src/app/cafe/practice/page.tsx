import { CouponIcon, MenuIcon } from "@/components/icons/kiosk-icons";
import { MissionSelect } from "@/components/practice/MissionSelect";

export default function CafePracticeSelectPage() {
  return (
    <MissionSelect
      serviceName="카페"
      missions={[
        {
          title: "아메리카노 1잔 담기",
          description: "기본 · 옵션 없음",
          icon: <MenuIcon menuId="americano" size={48} />,
          href: "/cafe/practice/basic",
        },
        {
          title: "아메리카노 2잔, 카페모카 1잔 담기",
          description: "옵션 포함 · 온도·사이즈·휘핑크림",
          icon: <MenuIcon menuId="mocha" size={48} />,
        },
        {
          title: "쿠폰 쓰고 결제하기",
          description: "심화",
          icon: <CouponIcon size={48} tone="orange" />,
        },
      ]}
    />
  );
}
