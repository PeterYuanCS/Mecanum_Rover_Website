/** Draw the desktop mark directly so mobile fonts cannot substitute an emoji. */
export function RoverMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="0.75em"
      height="1em"
      viewBox="0 0 24 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 4v24M0 16h24M3.5 7.5l17 17M3.5 24.5l17-17" />
    </svg>
  );
}
