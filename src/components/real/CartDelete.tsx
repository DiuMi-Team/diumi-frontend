"use client";

import { useState } from "react";
import { Button } from "@/components/common/Button";
import { Dialog } from "@/components/common/Dialog";
import { TrashIcon } from "@/components/icons/ui-icons";
import { useReal } from "@/components/real/RealContext";
import { getCafeMenu } from "@/features/cafe/catalog";
import { itemName, itemUnit, type CartItem } from "@/features/order/order";
import { objectParticle } from "@/features/real/judge";

/** 지울 대상. 메뉴 하나(index) 또는 장바구니 전체 */
type DeleteTarget = { kind: "item"; index: number } | { kind: "all" };

/** 확인 창 제목에 쓰는 짧은 이름. 음료는 온도·사이즈를 빼고 "카페라떼", 버거는 "불고기버거 세트" */
function shortName(item: CartItem): string {
  return item.type === "drink" ? getCafeMenu(item.menuId).name : itemName(item);
}

/** "카페라떼 1잔을\n삭제할까요?", "불고기버거 세트 2개를\n삭제할까요?" */
function deleteTitle(item: CartItem): string {
  const count = `${item.quantity}${itemUnit(item)}`;
  return `${shortName(item)} ${count}${objectParticle(count)}\n삭제할까요?`;
}

/**
 * 장바구니 메뉴 삭제 (XCart, XCartDel). 실전 카페 장바구니와 패스트푸드 주문 확인 화면이 함께 쓴다.
 * 메뉴마다 '삭제', 제목 옆 '전체 삭제'를 두고, 누르면 확인 창으로 한 번 더 묻는다.
 * 지운 뒤 금액은 주문 상태에서 다시 계산된다.
 */
export function useCartDelete() {
  const { order, act } = useReal();
  const [target, setTarget] = useState<DeleteTarget | null>(null);
  const close = () => setTarget(null);

  const item = target?.kind === "item" ? order.cart[target.index] : undefined;
  const confirm = () => {
    if (target?.kind === "item")
      act({ type: "removeCartItem", index: target.index }, `cart:${target.index}:remove`);
    if (target?.kind === "all") act({ type: "clearCart" }, "cart:clear");
    close();
  };

  const dialog = (
    <Dialog
      open={target !== null}
      onClose={close}
      tone="danger"
      icon={<TrashIcon size={36} strokeWidth={2} />}
      title={item ? deleteTitle(item) : "메뉴를 모두\n삭제할까요?"}
      description={item ? "삭제하면 장바구니에서 빠져요." : "담은 메뉴가 모두 빠져요."}
    >
      <button
        type="button"
        onClick={confirm}
        className="flex h-[60px] w-full items-center justify-center rounded-full border-2 border-error bg-error-bg text-21 font-bold text-error-text"
      >
        삭제하기
      </button>
      <Button variant="outline" onClick={close}>
        취소
      </Button>
    </Dialog>
  );

  return {
    askItem: (index: number) => setTarget({ kind: "item", index }),
    askAll: () => setTarget({ kind: "all" }),
    dialog,
  };
}

/** 메뉴 카드 오른쪽 위의 '삭제'. 보이는 높이는 32px이고 터치 영역만 48px로 넓힌다 */
export function CartDeleteButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={`${label} 삭제`}
      onClick={onClick}
      className="relative flex h-8 flex-none items-center gap-[3px] self-start rounded-full border-[1.5px] border-error-text bg-white-pure px-2.5 text-16 font-bold text-error-text after:absolute after:-inset-2"
    >
      <TrashIcon size={15} />
      삭제
    </button>
  );
}

/** 제목 + 오른쪽 '전체 삭제' 글자 버튼 (밑줄, 보조 글자색) */
export function CartHeading({ title, onClearAll }: { title: string; onClearAll?: () => void }) {
  return (
    <div className="mt-0.5 flex items-center justify-between gap-2">
      <h2 className="text-22 font-bold">{title}</h2>
      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="relative h-9 flex-none px-1 text-16 font-bold text-text-sub underline after:absolute after:-inset-x-1 after:-inset-y-1.5"
        >
          전체 삭제
        </button>
      )}
    </div>
  );
}

/** 메뉴를 다 지웠을 때 목록 자리 */
export function EmptyCart() {
  return (
    <p className="rounded-3xl bg-gray-1 px-5 py-8 text-center text-18 leading-normal text-text-sub short:py-5">
      장바구니가 비었어요.
      <br />
      메뉴를 다시 담아 주세요.
    </p>
  );
}
