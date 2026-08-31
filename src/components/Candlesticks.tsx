const Candlesticks = ({ className = "text-accent-green" }: { className?: string }) => (
  <svg
    width="64"
    height="24"
    viewBox="0 0 64 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Candlestick 1 */}
    <rect x="4" y="10" width="4" height="8" rx="1" className="fill-current" />
    <rect x="5.5" y="6" width="1" height="16" className="fill-current" />
    {/* Candlestick 2 */}
    <rect x="16" y="6" width="4" height="12" rx="1" className="fill-current" />
    <rect x="17.5" y="2" width="1" height="20" className="fill-current" />
    {/* Candlestick 3 */}
    <rect x="28" y="12" width="4" height="6" rx="1" className="fill-current" />
    <rect x="29.5" y="8" width="1" height="14" className="fill-current" />
    {/* Candlestick 4 */}
    <rect x="40" y="5" width="4" height="14" rx="1" className="fill-current" />
    <rect x="41.5" y="1" width="1" height="22" className="fill-current" />
    {/* Candlestick 5 */}
    <rect x="52" y="9" width="4" height="10" rx="1" className="fill-current" />
    <rect x="53.5" y="4" width="1" height="18" className="fill-current" />
  </svg>
);

export default Candlesticks;
