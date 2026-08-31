const Candlesticks = ({ className = "text-foreground" }: { className?: string }) => (
  <svg
    width="46"
    height="18"
    viewBox="0 0 46 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Candlestick 1 */}
    <rect x="5" y="7" width="3" height="6" rx="0.5" className="fill-current" />
    <rect x="6" y="3" width="1" height="12" className="fill-current" />
    {/* Candlestick 2 */}
    <rect x="19" y="5" width="3" height="8" rx="0.5" className="fill-current" />
    <rect x="20" y="1" width="1" height="16" className="fill-current" />
    {/* Candlestick 3 */}
    <rect x="33" y="8" width="3" height="5" rx="0.5" className="fill-current" />
    <rect x="34" y="4" width="1" height="11" className="fill-current" />
  </svg>
);

export default Candlesticks;
