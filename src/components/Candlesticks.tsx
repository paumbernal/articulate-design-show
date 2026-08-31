const Candlesticks = ({ className = "text-foreground" }: { className?: string }) => (
  <svg
    width="42"
    height="16"
    viewBox="0 0 42 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Candlestick 1 */}
    <rect x="4" y="6" width="3" height="6" rx="0.5" className="fill-current" />
    <rect x="5" y="3" width="1" height="11" className="fill-current" />
    {/* Candlestick 2 */}
    <rect x="18" y="4" width="3" height="8" rx="0.5" className="fill-current" />
    <rect x="19" y="1" width="1" height="14" className="fill-current" />
    {/* Candlestick 3 */}
    <rect x="32" y="7" width="3" height="5" rx="0.5" className="fill-current" />
    <rect x="33" y="4" width="1" height="11" className="fill-current" />
  </svg>
);

export default Candlesticks;
