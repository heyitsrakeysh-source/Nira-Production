export function Logo({ size = 22 }: { size?: number }) {
  return <img src="/nira-icon.png" width={size} height={size} alt="" aria-hidden />;
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <img src="/nira-logo.png" width="118" height="32" alt="Nira" className="h-7 w-auto object-contain object-left" />
    </span>
  );
}
