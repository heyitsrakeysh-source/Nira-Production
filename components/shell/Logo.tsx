export function Logo({ size = 22 }: { size?: number }) {
  return <img src="/nira-mark.svg" width={size} height={size} alt="" aria-hidden />;
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <img src="/nira-wordmark.svg" width="104" height="30" alt="Nira" className="h-7 w-auto object-contain object-left" />
    </span>
  );
}
