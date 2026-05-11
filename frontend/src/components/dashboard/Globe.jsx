
const STAGE_LABELS = [
  '', 'Dark Ages', 'Stone Age', 'Ancient Civilization', 'Medieval',
  'Age of Discovery', 'Industrial Revolution', 'Modern City', 'Digital Age', 'Connected World'
]

function StageScene({ stage }) {
  switch (stage) {
    case 1: return (
      <svg viewBox="0 0 130 110" width="100%" style={{ display: 'block' }}>
        <rect width="130" height="110" fill="#0a0a1a" />
        <rect y="85" width="130" height="25" fill="#12120a" />
        <circle cx="98" cy="22" r="10" fill="#7a7040" opacity="0.4" />
        <circle cx="105" cy="19" r="10" fill="#0a0a1a" />
      </svg>
    )
    case 2: return (
      <svg viewBox="0 0 130 110" width="100%" style={{ display: 'block' }}>
        <rect width="130" height="110" fill="#0d1230" />
        <rect y="78" width="130" height="32" fill="#1a1208" />
        <circle cx="20" cy="14" r="0.8" fill="#fff" opacity="0.8" />
        <circle cx="50" cy="9"  r="0.6" fill="#fff" opacity="0.6" />
        <circle cx="75" cy="18" r="0.8" fill="#fff" opacity="0.7" />
        <circle cx="100" cy="8" r="0.6" fill="#fff" opacity="0.5" />
        <path d="M95,78 L80,48 L112,48 L112,78 Z" fill="#080808" />
        <ellipse cx="32" cy="78" rx="14" ry="6" fill="#ff6600" opacity="0.5" />
        <ellipse cx="32" cy="75" rx="7" ry="9" fill="#ffaa00" opacity="0.6" />
      </svg>
    )
    case 3: return (
      <svg viewBox="0 0 130 110" width="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#87ceeb" />
            <stop offset="100%" stopColor="#ffd580" />
          </linearGradient>
        </defs>
        <rect width="130" height="110" fill="url(#sky3)" />
        <rect y="74" width="130" height="36" fill="#c2a050" />
        <rect y="71" width="130" height="5" fill="#4a90d9" opacity="0.7" />
        <circle cx="14" cy="68" r="11" fill="#ffd700" opacity="0.9" />
        <polygon points="28,74 52,34 76,74" fill="#8b7355" />
        <polygon points="70,74 88,48 106,74" fill="#9b8365" />
        <rect x="57" y="52" width="4" height="22" fill="#6b5a35" />
        <polygon points="57,52 59,46 61,52" fill="#6b5a35" />
      </svg>
    )
    case 4: return (
      <svg viewBox="0 0 130 110" width="100%" style={{ display: 'block' }}>
        <rect width="130" height="110" fill="#6b7280" />
        <rect y="76" width="130" height="34" fill="#7c5914" />
        <path d="M0,90 Q65,82 130,90" stroke="#5a4010" strokeWidth="8" fill="none" />
        <rect x="46" y="46" width="38" height="30" fill="#9ca3af" />
        <rect x="50" y="36" width="10" height="14" fill="#9ca3af" />
        <rect x="74" y="36" width="10" height="14" fill="#9ca3af" />
        <rect x="51" y="33" width="3" height="5" fill="#9ca3af" />
        <rect x="56" y="33" width="3" height="5" fill="#9ca3af" />
        <rect x="75" y="33" width="3" height="5" fill="#9ca3af" />
        <rect x="80" y="33" width="3" height="5" fill="#9ca3af" />
        <rect x="56" y="56" width="6" height="6" fill="#fde047" opacity="0.85" />
        <rect x="68" y="56" width="6" height="6" fill="#fde047" opacity="0.85" />
        <rect x="10" y="63" width="20" height="13" fill="#b45309" />
        <polygon points="10,63 20,54 30,63" fill="#7c2d12" />
        <rect x="18" y="65" width="5" height="5" fill="#fde047" opacity="0.7" />
      </svg>
    )
    case 5: return (
      <svg viewBox="0 0 130 110" width="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="sky5" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="55%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
        </defs>
        <rect width="130" height="110" fill="url(#sky5)" />
        <rect y="66" width="130" height="44" fill="#0369a1" />
        <path d="M0,70 Q30,66 60,70 Q90,74 130,70" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
        <path d="M46,66 L82,66 L80,74 L48,74 Z" fill="#7c2d12" />
        <line x1="64" y1="40" x2="64" y2="66" stroke="#4a3728" strokeWidth="2" />
        <polygon points="65,42 65,63 88,54" fill="#f5f0e8" opacity="0.9" />
        <rect x="64" y="37" width="10" height="6" fill="#dc2626" />
        <rect x="106" y="55" width="10" height="20" fill="#e5e7eb" />
        <polygon points="106,55 111,48 116,55" fill="#ef4444" />
        <rect x="107" y="62" width="8" height="4" fill="#fde047" opacity="0.85" />
      </svg>
    )
    case 6: return (
      <svg viewBox="0 0 130 110" width="100%" style={{ display: 'block' }}>
        <rect width="130" height="110" fill="#92400e" />
        <rect y="78" width="130" height="32" fill="#1c1917" />
        <line x1="0" y1="84" x2="130" y2="84" stroke="#4b5563" strokeWidth="3" />
        <line x1="0" y1="90" x2="130" y2="90" stroke="#4b5563" strokeWidth="3" />
        <line x1="10" y1="82" x2="10" y2="92" stroke="#4b5563" strokeWidth="2" />
        <line x1="25" y1="82" x2="25" y2="92" stroke="#4b5563" strokeWidth="2" />
        <line x1="40" y1="82" x2="40" y2="92" stroke="#4b5563" strokeWidth="2" />
        <rect x="18" y="56" width="32" height="22" fill="#374151" />
        <rect x="60" y="46" width="36" height="32" fill="#374151" />
        <rect x="26" y="40" width="7" height="17" fill="#4b5563" />
        <rect x="36" y="34" width="7" height="23" fill="#4b5563" />
        <rect x="68" y="30" width="7" height="17" fill="#4b5563" />
        <rect x="80" y="24" width="7" height="23" fill="#4b5563" />
        <ellipse cx="29" cy="37" rx="8" ry="5" fill="#6b7280" opacity="0.7" />
        <ellipse cx="39" cy="30" rx="9" ry="6" fill="#9ca3af" opacity="0.5" />
        <ellipse cx="71" cy="26" rx="8" ry="5" fill="#6b7280" opacity="0.7" />
        <ellipse cx="83" cy="19" rx="10" ry="6" fill="#9ca3af" opacity="0.5" />
        <rect x="0" y="80" width="24" height="10" fill="#1f2937" />
        <circle cx="7"  cy="90" r="4" fill="#111827" />
        <circle cx="18" cy="90" r="4" fill="#111827" />
        <rect x="3" y="75" width="12" height="7" fill="#374151" />
        <ellipse cx="3" cy="73" rx="5" ry="3" fill="#e5e7eb" opacity="0.5" />
      </svg>
    )
    case 7: return (
      <svg viewBox="0 0 130 110" width="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="sky7" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <rect width="130" height="110" fill="url(#sky7)" />
        <rect y="88" width="130" height="22" fill="#374151" />
        <line x1="0" y1="99" x2="130" y2="99" stroke="#fde047" strokeWidth="1" strokeDasharray="8 4" />
        <rect x="5"   y="50" width="14" height="38" fill="#1e293b" />
        <rect x="22"  y="34" width="17" height="54" fill="#1e3a5f" />
        <rect x="42"  y="43" width="12" height="45" fill="#1e293b" />
        <rect x="58"  y="24" width="22" height="64" fill="#0f2744" />
        <rect x="83"  y="38" width="14" height="50" fill="#1e293b" />
        <rect x="100" y="30" width="17" height="58" fill="#1e3a5f" />
        <rect x="115" y="54" width="14" height="34" fill="#1e293b" />
        <rect x="8"  y="53" width="3" height="3" fill="#fde047" opacity="0.9" />
        <rect x="14" y="58" width="3" height="3" fill="#fde047" opacity="0.7" />
        <rect x="25" y="37" width="3" height="3" fill="#60a5fa" opacity="0.9" />
        <rect x="33" y="45" width="3" height="3" fill="#fde047" opacity="0.8" />
        <rect x="25" y="53" width="3" height="3" fill="#fde047" opacity="0.7" />
        <rect x="61" y="27" width="3" height="3" fill="#60a5fa" opacity="0.9" />
        <rect x="70" y="37" width="3" height="3" fill="#fde047" opacity="0.8" />
        <rect x="61" y="45" width="3" height="3" fill="#fde047" opacity="0.9" />
        <rect x="70" y="55" width="3" height="3" fill="#60a5fa" opacity="0.7" />
        <rect x="103" y="33" width="3" height="3" fill="#fde047" opacity="0.9" />
        <rect x="110" y="42" width="3" height="3" fill="#fde047" opacity="0.8" />
      </svg>
    )
    case 8: return (
      <svg viewBox="0 0 130 110" width="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="sky8" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f0f1a" />
            <stop offset="100%" stopColor="#1a0533" />
          </linearGradient>
        </defs>
        <rect width="130" height="110" fill="url(#sky8)" />
        <rect y="84" width="130" height="26" fill="#0f172a" />
        <rect x="4"  y="54" width="20" height="30" fill="#1e293b" />
        <rect x="27" y="44" width="25" height="40" fill="#0f2040" />
        <rect x="55" y="49" width="20" height="35" fill="#1e293b" />
        <rect x="78" y="40" width="28" height="44" fill="#0f2040" />
        <line x1="0"   y1="60" x2="55"  y2="60" stroke="#00f0ff" strokeWidth="1.5" opacity="0.7" />
        <line x1="55"  y1="60" x2="130" y2="46" stroke="#bf00ff" strokeWidth="1.5" opacity="0.6" />
        <line x1="30"  y1="74" x2="110" y2="74" stroke="#00f0ff" strokeWidth="1"   opacity="0.5" />
        <rect x="7"  y="57" width="3" height="1.5" fill="#00ff00" opacity="0.9" />
        <rect x="7"  y="61" width="3" height="1.5" fill="#00ff00" opacity="0.7" />
        <rect x="7"  y="65" width="3" height="1.5" fill="#ffaa00" opacity="0.9" />
        <rect x="30" y="47" width="3" height="1.5" fill="#00ff00" opacity="0.9" />
        <rect x="30" y="51" width="3" height="1.5" fill="#00ff00" opacity="0.9" />
        <rect x="82" y="43" width="3" height="1.5" fill="#00ff00" opacity="0.9" />
        <rect x="82" y="47" width="3" height="1.5" fill="#00ff00" opacity="0.7" />
        <path d="M112,66 Q124,54 129,64" stroke="#9ca3af" strokeWidth="2" fill="none" />
        <line x1="120" y1="60" x2="118" y2="72" stroke="#9ca3af" strokeWidth="1.5" />
        <rect x="115" y="72" width="6" height="10" fill="#9ca3af" />
      </svg>
    )
    case 9: return (
      <svg viewBox="0 0 130 110" width="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="earth9" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>
          <clipPath id="earthClip9"><rect width="130" height="110" /></clipPath>
        </defs>
        <rect width="130" height="110" fill="#000010" />
        <circle cx="15"  cy="14" r="0.8" fill="#fff" />
        <circle cx="40"  cy="7"  r="0.5" fill="#fff" />
        <circle cx="70"  cy="20" r="0.8" fill="#fff" />
        <circle cx="90"  cy="5"  r="0.5" fill="#fff" />
        <circle cx="115" cy="12" r="0.8" fill="#fff" />
        <circle cx="25"  cy="34" r="0.5" fill="#fff" />
        <circle cx="55"  cy="28" r="0.5" fill="#fff" />
        <circle cx="65" cy="140" r="60" fill="url(#earth9)" clipPath="url(#earthClip9)" />
        <rect x="54" y="24" width="8" height="5" fill="#9ca3af" />
        <rect x="44" y="24" width="10" height="4" fill="#1d4ed8" opacity="0.85" />
        <rect x="63" y="24" width="10" height="4" fill="#1d4ed8" opacity="0.85" />
        <line x1="44" y1="26" x2="54" y2="26" stroke="#9ca3af" strokeWidth="1.5" />
        <line x1="62" y1="26" x2="72" y2="26" stroke="#9ca3af" strokeWidth="1.5" />
        <circle cx="30"  cy="98" r="3" fill="#60a5fa" />
        <circle cx="65"  cy="92" r="3" fill="#60a5fa" />
        <circle cx="100" cy="98" r="3" fill="#60a5fa" />
        <line x1="30" y1="98" x2="65"  y2="92" stroke="#60a5fa" strokeWidth="1"   opacity="0.8" />
        <line x1="65" y1="92" x2="100" y2="98" stroke="#60a5fa" strokeWidth="1"   opacity="0.8" />
        <line x1="30" y1="98" x2="100" y2="98" stroke="#60a5fa" strokeWidth="0.7" opacity="0.5" />
        <line x1="58" y1="29" x2="30"  y2="98" stroke="#a78bfa" strokeWidth="0.7" opacity="0.5" />
        <line x1="58" y1="29" x2="65"  y2="92" stroke="#a78bfa" strokeWidth="0.7" opacity="0.6" />
        <line x1="58" y1="29" x2="100" y2="98" stroke="#a78bfa" strokeWidth="0.7" opacity="0.5" />
      </svg>
    )
    default: return null
  }
}

export default function Globe({ stage }) {
  return (
    <div className="globe-wrapper">
      <div className="globe-stage-label">
        Stage {stage} — {STAGE_LABELS[stage]}
      </div>

      <div className="globe-scene">
        <StageScene stage={stage} />
      </div>

      <input
        type="range"
        min={1}
        max={9}
        value={stage}
        readOnly
        style={{ width: '100%', cursor: 'default', pointerEvents: 'none' }}
      />

      <div className="globe-era-row">
        <span>Dark Ages</span>
        <span>Connected World</span>
      </div>
    </div>
  )
}
