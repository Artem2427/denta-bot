type LogoProps = {
  withLabel?: boolean;
};

export function Logo({ withLabel = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2 group">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-primary-foreground"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
      {withLabel && <span className="font-semibold text-lg">Garage Hub</span>}
    </div>
  );
}
