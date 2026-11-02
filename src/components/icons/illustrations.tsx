type IllustrationProps = {
  size: number;
  className?: string;
};

export function CupIllustration({ size, className }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <ellipse cx="32" cy="59" rx="17" ry="3" fill="#3D3531" opacity=".12" />
      <path
        d="M17 21h30l-3.200 31.500a4 4 0 0 1-4 3.500H24.200a4 4 0 0 1-4-3.500z"
        fill="#FDFDFD"
      />
      <path d="M32 21h15l-3.200 31.500a4 4 0 0 1-4 3.500H32z" fill="#3D3531" opacity=".07" />
      <path d="M18 31h28l-1.300 13H19.300z" fill="#F5A65B" />
      <circle cx="32" cy="37.500" r="4" fill="#FDFDFD" />
      <rect x="14" y="14" width="36" height="8" rx="4" fill="#F5A65B" />
      <rect x="20" y="8" width="24" height="8" rx="3.500" fill="#F5A65B" />
      <rect x="23" y="10" width="12" height="2.500" rx="1.250" fill="#FDFDFD" opacity=".6" />
    </svg>
  );
}

export function BurgerIllustration({ size, className }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <ellipse cx="32" cy="59" rx="20" ry="3" fill="#3D3531" opacity=".12" />
      <path d="M10 30a22 18 0 0 1 44 0z" fill="#F5A65B" />
      <path
        d="M17 22a16 11 0 0 1 14-8"
        stroke="#FDFDFD"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity=".55"
      />
      <circle cx="30" cy="21" r="1.700" fill="#FDFDFD" />
      <circle cx="38" cy="18" r="1.700" fill="#FDFDFD" />
      <circle cx="43" cy="24" r="1.700" fill="#FDFDFD" />
      <rect x="8" y="30" width="48" height="7" rx="3.500" fill="#5AC7C3" />
      <rect x="11" y="37" width="42" height="8" rx="4" fill="#3D3531" />
      <rect x="10" y="45" width="44" height="11" rx="5.500" fill="#F5A65B" />
    </svg>
  );
}

export function TrainIllustration({ size, className }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <ellipse cx="32" cy="59" rx="18" ry="3" fill="#3D3531" opacity=".12" />
      <path d="M22 49l-4 8M42 49l4 8" stroke="#3D3531" strokeWidth="3.500" strokeLinecap="round" />
      <rect x="13" y="6" width="38" height="45" rx="11" fill="#55A4E3" />
      <path d="M32 6h8a11 11 0 0 1 11 11v23a11 11 0 0 1-11 11h-8z" fill="#3D3531" opacity=".08" />
      <rect x="19" y="13" width="26" height="15" rx="5" fill="#FDFDFD" />
      <rect x="19" y="32" width="26" height="4" rx="2" fill="#B9E6E8" />
      <circle cx="23" cy="43" r="3" fill="#F5A65B" />
      <circle cx="41" cy="43" r="3" fill="#F5A65B" />
    </svg>
  );
}

export function PinIllustration({ size, className }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <ellipse cx="32" cy="54" rx="19" ry="6" fill="#B9E6E8" />
      <ellipse cx="32" cy="54" rx="8" ry="2.500" fill="#3D3531" opacity=".15" />
      <path
        d="M32 5c-10 0-17 7.500-17 17 0 12 17 31 17 31s17-19 17-31c0-9.500-7-17-17-17z"
        fill="#F5A65B"
      />
      <path d="M32 5c10 0 17 7.500 17 17 0 12-17 31-17 31z" fill="#3D3531" opacity=".08" />
      <circle cx="32" cy="22" r="7.500" fill="#FDFDFD" />
    </svg>
  );
}

export function KioskIllustration({ size, className }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <ellipse cx="32" cy="59" rx="17" ry="3" fill="#3D3531" opacity=".15" />
      <rect x="28" y="44" width="8" height="10" fill="#3D3531" opacity=".55" />
      <rect x="20" y="52" width="24" height="5" rx="2.500" fill="#3D3531" />
      <rect x="17" y="5" width="30" height="41" rx="6" fill="#FDFDFD" />
      <rect x="21" y="9" width="22" height="24" rx="3" fill="#B9E6E8" />
      <rect x="24" y="12" width="7" height="7" rx="2" fill="#FDFDFD" />
      <rect x="33" y="12" width="7" height="7" rx="2" fill="#FDFDFD" />
      <rect x="24" y="22" width="16" height="7" rx="2.500" fill="#F5A65B" />
      <rect x="26" y="38" width="12" height="3" rx="1.500" fill="#3D3531" />
    </svg>
  );
}

export function BookIllustration({ size, className }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <ellipse cx="32" cy="58" rx="22" ry="3" fill="#3D3531" opacity=".15" />
      <path d="M6 14c8-3 17-3 26 2v38c-9-5-18-5-26-2z" fill="#FDFDFD" />
      <path d="M58 14c-8-3-17-3-26 2v38c9-5 18-5 26-2z" fill="#FDFDFD" />
      <path d="M58 14c-8-3-17-3-26 2v38c9-5 18-5 26-2z" fill="#3D3531" opacity=".08" />
      <path
        d="M12 24c5-1 10-.5 14 1M12 32c5-1 10-.5 14 1M12 40c5-1 10-.5 14 1M38 25c4-1.500 9-2 14-1M38 33c4-1.500 9-2 14-1"
        stroke="#F5A65B"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function FlagIllustration({ size, className }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <ellipse cx="22" cy="58" rx="14" ry="3" fill="#3D3531" opacity=".15" />
      <rect x="17" y="5" width="5" height="53" rx="2.500" fill="#3D3531" />
      <path d="M22 8h32l-8 12 8 12H22z" fill="#F5A65B" />
      <path d="M22 20h24l8 12H22z" fill="#3D3531" opacity=".08" />
      <circle cx="33" cy="20" r="5" fill="#FDFDFD" />
    </svg>
  );
}

export function StarIllustration({ size, className }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <ellipse cx="32" cy="59" rx="16" ry="3" fill="#3D3531" opacity=".15" />
      <path
        d="M32 5l7.800 16 17.700 2.500-12.800 12.400 3.100 17.600L32 45.200l-15.800 8.300 3.100-17.600L6.500 23.500 24.200 21z"
        fill="#F5A65B"
        stroke="#F5A65B"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M32 5l7.800 16 17.700 2.500-12.800 12.400 3.100 17.600L32 45.200z"
        fill="#3D3531"
        opacity=".08"
      />
      <path
        d="M22 27l3-5.500"
        stroke="#FDFDFD"
        strokeWidth="3.500"
        strokeLinecap="round"
        opacity=".6"
      />
    </svg>
  );
}
