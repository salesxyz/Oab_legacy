interface IconProps {
  size?: number;
}

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function HomeIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" {...base}>
      <path d="M3 9.5L10 3l7 6.5" />
      <path d="M5 8.5V17h10V8.5" />
    </svg>
  );
}

export function BookIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" {...base}>
      <path d="M4 4.5c0-.6.4-1 1-1h4.5v13H5c-.6 0-1 .4-1 1z" />
      <path d="M16 4.5c0-.6-.4-1-1-1H10.5v13H15c.6 0 1 .4 1 1z" />
    </svg>
  );
}

export function ClipboardIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" {...base}>
      <rect x="4.5" y="3.5" width="11" height="14" rx="1.5" />
      <path d="M7.5 3v-.5a1 1 0 011-1h3a1 1 0 011 1V3" />
      <path d="M7 8.5h6M7 11.5h6M7 14.5h3.5" />
    </svg>
  );
}

export function ClockIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" {...base}>
      <circle cx="10" cy="10.5" r="7" />
      <path d="M10 6.5v4l2.5 2" />
    </svg>
  );
}

export function TrophyIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" {...base}>
      <path d="M6 4h8v4a4 4 0 01-8 0z" />
      <path d="M6 5H3.5v1A2.5 2.5 0 006 8.5M14 5h2.5v1A2.5 2.5 0 0114 8.5" />
      <path d="M10 12v3M7 17h6M8.5 15h3" />
    </svg>
  );
}

export function UserIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" {...base}>
      <circle cx="10" cy="7" r="3" />
      <path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" />
    </svg>
  );
}

export function LogoutIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" {...base}>
      <path d="M8 17H4.5a1 1 0 01-1-1V4a1 1 0 011-1H8" />
      <path d="M13 13.5l3.5-3.5-3.5-3.5M16.5 10H8" />
    </svg>
  );
}

export function FlameIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2c1 3-2.5 3.5-2.5 7a2.5 2.5 0 005 0c0-.9-.4-1.5-.7-2 .2 1.2-.5 1.8-1 1.5.6-1.5-.7-2.7-1.2-5.2-.1-.5-.1-.9.4-1.3z" />
      <path d="M6 12a4 4 0 108 0c0-1.3-.6-2.2-1.2-3 .3 2-1 3-2.3 2.6C11 10 9.8 8.5 9.2 6.7 7.3 8 6 9.8 6 12z" opacity="0.55" />
    </svg>
  );
}

export function AwardIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" {...base}>
      <circle cx="10" cy="7.5" r="4" />
      <path d="M7.3 11 6 17.5 10 15.5 14 17.5 12.7 11" />
    </svg>
  );
}

export function LockIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" {...base}>
      <rect x="4.5" y="9" width="11" height="8" rx="1.5" />
      <path d="M6.5 9V6.5a3.5 3.5 0 017 0V9" />
    </svg>
  );
}

export function CheckCircleIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" {...base}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M6.8 10.2l2.2 2.2 4.2-4.7" />
    </svg>
  );
}

export function CircleDotIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" {...base}>
      <circle cx="10" cy="10" r="7.5" />
      <circle cx="10" cy="10" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <path d="M6 3.5L10.5 8 6 12.5" />
    </svg>
  );
}

export function ChevronLeftIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <path d="M10 3.5L5.5 8l4.5 4.5" />
    </svg>
  );
}
