import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline";

const baseClass = "flex h-[60px] w-full items-center justify-center rounded-full text-21 font-bold";

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white-pure",
  outline: "border-2 border-primary bg-white text-primary",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = "primary", className = "", type, ...props }: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={`${baseClass} ${variantClass[variant]} ${className}`}
      {...props}
    />
  );
}

type LinkButtonProps = {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

export function LinkButton({
  href,
  variant = "primary",
  className = "",
  children,
}: LinkButtonProps) {
  return (
    <Link href={href} className={`${baseClass} ${variantClass[variant]} ${className}`}>
      {children}
    </Link>
  );
}
