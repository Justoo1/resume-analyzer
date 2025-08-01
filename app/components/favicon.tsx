export const CVRefineIcon = ({ size = 48, className = '' }) => {
  return (
    <div className={`inline-block ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="url(#gradient-bg)"/>
        <rect x="12" y="10" width="20" height="26" rx="2" fill="white" opacity="0.95"/>
        <rect x="15" y="15" width="14" height="2" fill="#3b82f6"/>
        <rect x="15" y="19" width="10" height="1.5" fill="#3b82f6" opacity="0.7"/>
        <rect x="15" y="22" width="12" height="1.5" fill="#3b82f6" opacity="0.7"/>
        <rect x="15" y="25" width="9" height="1.5" fill="#3b82f6" opacity="0.7"/>
        <path d="M34 20 L38 24 L34 28" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="gradient-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa"/>
            <stop offset="100%" stopColor="#06b6d4"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
