const Candlesticks = ({ className = "text-foreground" }: { className?: string }) => (
  <svg
    width="48"
    height="20"
    viewBox="0 0 48 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Candlestick 1 — short body, long wicks */}
    <rect x="5" y="9" width="3" height="5" rx="0.5" className="fill-current" />
    <rect x="6" y="3" width="1" height="14" className="fill-current" />
    {/* Candlestick 2 — tall bullish body */}
    <rect x="21" y="4" width="4" height="10" rx="0.5" className="fill-current" />
    <rect x="22.5" y="1" width="1" height="18" className="fill-current" />
    {/* Candlestick 3 — small body near top */}
    <rect x="38" y="6" width="3" height="6" rx="0.5" className="fill-current" />
    <rect x="39" y="2" width="1" height="16" className="fill-current" />
  </svg>
);

export default Candlesticks;
