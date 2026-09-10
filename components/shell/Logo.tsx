export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span aria-hidden className="grid place-items-center rounded-[9px] bg-brand font-bold text-[#173f28]" style={{ width: size, height: size, fontSize: size * 0.52 }}>
      N
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="text-[18px] font-bold tracking-[-0.05em] text-ink">Nira</span>
      <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-ink">profit OS</span>
    </span>
  );
}
