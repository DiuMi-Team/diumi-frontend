import { BurgerIcon, CouponIcon, FriesIcon } from "@/components/icons/kiosk-icons";
import { MissionSelect } from "@/components/practice/MissionSelect";

export default function FastfoodPracticeSelectPage() {
  return (
    <MissionSelect
      serviceName="패스트푸드"
      missions={[
        {
          title: "불고기버거 단품 담기",
          description: "기본 · 옵션 없음",
          icon: <BurgerIcon burgerId="bulgogi" size={48} />,
          href: "/fastfood/practice/basic",
        },
        {
          title: "불고기버거 세트, 치즈버거 단품 담기",
          description: "옵션 포함 · 세트 구성·음료 변경",
          icon: <FriesIcon size={48} />,
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
