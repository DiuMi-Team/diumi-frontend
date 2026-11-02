import { useEffect, useRef } from "react";

/** open 값에 맞춰 <dialog>를 모달로 열고 닫는다. 포커스 가두기와 Esc는 브라우저가 처리한다. */
export function useNativeDialog(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return ref;
}
