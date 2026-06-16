export default function LogoMark({ size = 26, isDark = false }) {
  const ink = isDark ? "#e8e4cc" : "#1a160c";
  const gold = isDark ? "#c9a84c" : "#a07830";

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Gold beam */}
      <line x1="2" y1="9" x2="22" y2="9" stroke={gold} strokeWidth="2" strokeLinecap="round"/>

      {/* Center pivot — filled gold circle */}
      <circle cx="12" cy="9" r="2.5" fill={gold}/>
      <circle cx="12" cy="9" r="1" fill={isDark ? "#0a0a0a" : "#dcdcdc"}/>

      {/* Left pan string */}
      <line x1="3.5" y1="9" x2="3.5" y2="16" stroke={ink} strokeWidth="1.5" strokeLinecap="round"/>
      {/* Left pan arc */}
      <path d="M1 16 Q3.5 20 6 16" stroke={ink} strokeWidth="1.8" fill="none" strokeLinecap="round"/>

      {/* Right pan string */}
      <line x1="20.5" y1="9" x2="20.5" y2="16" stroke={ink} strokeWidth="1.5" strokeLinecap="round"/>
      {/* Right pan arc */}
      <path d="M18 16 Q20.5 20 23 16" stroke={ink} strokeWidth="1.8" fill="none" strokeLinecap="round"/>

      {/* Stand */}
      <line x1="12" y1="11.5" x2="12" y2="22" stroke={ink} strokeWidth="1.8" strokeLinecap="round"/>

      {/* Base */}
      <line x1="7" y1="22" x2="17" y2="22" stroke={ink} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  );
}
