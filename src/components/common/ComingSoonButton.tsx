"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/common/Button";
import { Dialog } from "@/components/common/Dialog";

type ComingSoonButtonProps = {
  className?: string;
  label: string;
  children: ReactNode;
};

/** 아직 만들지 않은 화면으로 가는 자리. 누르면 준비 중 안내를 띄운다. */
export function ComingSoonButton({ className, label, children }: ComingSoonButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" aria-label={label} className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="준비 중이에요"
        description="조금만 기다려 주세요."
      >
        <Button onClick={() => setOpen(false)}>확인</Button>
      </Dialog>
    </>
  );
}
