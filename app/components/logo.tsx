export const CVRefineLogo = <Size extends keyof typeof sizes>({ size = 'medium' as Size, className = '' }: { size: Size; className?: string })  => {
  const sizes = {
    small: { container: 'h-12', icon: 'w-8 h-8', text: 'text-xl' },
    medium: { container: 'h-16', icon: 'w-12 h-12', text: 'text-2xl' },
    large: { container: 'h-20', icon: 'w-16 h-16', text: 'text-3xl' }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${currentSize.icon} bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg`}>
        <svg viewBox="0 0 36 36" className="w-2/3 h-2/3" fill="none">
          {/* Document */}
          <rect x="6" y="4" width="18" height="24" rx="2" fill="white" stroke="currentColor" strokeWidth="0.5" className="text-blue-500"/>
          <rect x="9" y="8" width="12" height="1.5" fill="currentColor" className="text-blue-400" opacity="0.8"/>
          <rect x="9" y="11" width="9" height="1.5" fill="currentColor" className="text-blue-400" opacity="0.6"/>
          <rect x="9" y="14" width="10" height="1.5" fill="currentColor" className="text-blue-400" opacity="0.6"/>
          <rect x="9" y="17" width="8" height="1.5" fill="currentColor" className="text-blue-400" opacity="0.6"/>
          
          {/* Refinement arrow */}
          <path d="M26 12 L30 16 L26 20" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M28 16 L32 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div className={`${currentSize.text} font-bold`}>
        <span className="text-blue-500">CV</span>
        <span className="text-cyan-500">Refine</span>
      </div>
    </div>
  );
};