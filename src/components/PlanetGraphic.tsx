import type { FC } from 'react';

interface PlanetGraphicProps {
  planetId: string;
  size?: number;
  className?: string;
  animate?: boolean;
}

export const PlanetGraphic: FC<PlanetGraphicProps> = ({
  planetId,
  size = 120,
  className = '',
  animate = false,
}) => {
  const normalizedId = planetId.toLowerCase();

  switch (normalizedId) {
    case 'saturn':
      return (
        <svg
          width={size * 1.5}
          height={size}
          viewBox="0 0 240 160"
          className={`overflow-visible ${className}`}
        >
          <defs>
            <radialGradient id="saturnBody" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="45%" stopColor="#FCD34D" />
              <stop offset="75%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </radialGradient>
            <linearGradient id="saturnBands" x1="0" y1="0" x2="0" y2="1">
              <stop offset="15%" stopColor="#F59E0B" stopOpacity="0.3" />
              <stop offset="35%" stopColor="#B45309" stopOpacity="0.4" />
              <stop offset="55%" stopColor="#FDE68A" stopOpacity="0.25" />
              <stop offset="75%" stopColor="#92400E" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="saturnRingGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#D97706" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0B1329" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#FBBF24" stopOpacity="0.8" />
              <stop offset="85%" stopColor="#92400E" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.2" />
            </linearGradient>
            <filter id="saturnGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Back half of the rings */}
          <g transform="rotate(-18 120 80)">
            <ellipse
              cx="120"
              cy="80"
              rx="105"
              ry="32"
              fill="none"
              stroke="url(#saturnRingGrad)"
              strokeWidth="20"
              strokeDasharray="660"
              strokeDashoffset="330"
              opacity="0.85"
            />
            {/* Cassini division gap */}
            <ellipse
              cx="120"
              cy="80"
              rx="98"
              ry="30"
              fill="none"
              stroke="#050B1A"
              strokeWidth="2"
              strokeDasharray="660"
              strokeDashoffset="330"
            />
          </g>

          {/* Planet sphere */}
          <circle
            cx="120"
            cy="80"
            r="44"
            fill="url(#saturnBody)"
            filter="url(#saturnGlow)"
          />
          <circle
            cx="120"
            cy="80"
            r="44"
            fill="url(#saturnBands)"
            className={animate ? 'animate-pulse' : ''}
          />

          {/* Planet shadow on front of rings */}
          <ellipse
            cx="110"
            cy="82"
            rx="44"
            ry="44"
            fill="black"
            opacity="0.25"
            clipPath="url(#ringFrontClip)"
          />

          {/* Front half of the rings */}
          <g transform="rotate(-18 120 80)">
            <ellipse
              cx="120"
              cy="80"
              rx="105"
              ry="32"
              fill="none"
              stroke="url(#saturnRingGrad)"
              strokeWidth="20"
              strokeDasharray="330"
              strokeDashoffset="0"
              opacity="0.95"
            />
            {/* Cassini division gap in front */}
            <ellipse
              cx="120"
              cy="80"
              rx="98"
              ry="30"
              fill="none"
              stroke="#050B1A"
              strokeWidth="2"
              strokeDasharray="330"
              strokeDashoffset="0"
            />
          </g>

          {/* Atmospheric limb glow */}
          <circle
            cx="120"
            cy="80"
            r="44"
            fill="none"
            stroke="#FEF08A"
            strokeWidth="1.5"
            opacity="0.4"
          />
        </svg>
      );

    case 'jupiter':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className={`overflow-visible ${className}`}
        >
          <defs>
            <radialGradient id="jupiterBase" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="45%" stopColor="#FB923C" />
              <stop offset="75%" stopColor="#C2410C" />
              <stop offset="100%" stopColor="#431407" />
            </radialGradient>
            <linearGradient id="jupiterBands" x1="0" y1="0" x2="0" y2="1">
              <stop offset="10%" stopColor="#7C2D12" stopOpacity="0.4" />
              <stop offset="22%" stopColor="#FED7AA" stopOpacity="0.2" />
              <stop offset="35%" stopColor="#9A3412" stopOpacity="0.5" />
              <stop offset="48%" stopColor="#FFEDD5" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#7C2D12" stopOpacity="0.55" />
              <stop offset="72%" stopColor="#EA580C" stopOpacity="0.3" />
              <stop offset="85%" stopColor="#9A3412" stopOpacity="0.4" />
            </linearGradient>
            <radialGradient id="greatRedSpot" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="70%" stopColor="#B91C1C" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </radialGradient>
          </defs>
          {/* Main sphere */}
          <circle cx="80" cy="80" r="64" fill="url(#jupiterBase)" />
          {/* Atmospheric stripes */}
          <circle cx="80" cy="80" r="64" fill="url(#jupiterBands)" />
          {/* Great Red Spot */}
          <ellipse
            cx="105"
            cy="100"
            rx="14"
            ry="8"
            fill="url(#greatRedSpot)"
            transform="rotate(-5 105 100)"
            opacity="0.9"
          />
          <ellipse
            cx="105"
            cy="100"
            rx="17"
            ry="10"
            fill="none"
            stroke="#EA580C"
            strokeWidth="1.5"
            opacity="0.6"
          />
          {/* Edge shadow / atmospheric rim */}
          <circle
            cx="80"
            cy="80"
            r="64"
            fill="none"
            stroke="#FED7AA"
            strokeWidth="1.5"
            opacity="0.4"
          />
        </svg>
      );

    case 'earth':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className={`overflow-visible ${className}`}
        >
          <defs>
            <radialGradient id="earthOcean" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="40%" stopColor="#0284C7" />
              <stop offset="75%" stopColor="#0369A1" />
              <stop offset="100%" stopColor="#082F49" />
            </radialGradient>
            <radialGradient id="earthAtmoGlow" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor="#38BDF8" stopOpacity="0" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.7" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="60" fill="url(#earthOcean)" />
          {/* Continents illustration */}
          <path
            d="M55 45 Q65 40 85 50 Q95 60 90 75 Q75 80 65 70 Z"
            fill="#10B981"
            opacity="0.7"
          />
          <path
            d="M75 90 Q85 85 105 95 Q115 115 95 125 Q80 120 75 105 Z"
            fill="#059669"
            opacity="0.7"
          />
          <path
            d="M40 70 Q50 65 55 80 Q45 95 38 85 Z"
            fill="#10B981"
            opacity="0.6"
          />
          {/* Swirling Clouds */}
          <path
            d="M35 55 Q65 45 95 55 Q125 65 115 75 Q85 65 55 75 Z"
            fill="#FFFFFF"
            opacity="0.5"
          />
          <path
            d="M50 95 Q80 85 110 95 Q130 105 110 115 Q75 105 45 110 Z"
            fill="#FFFFFF"
            opacity="0.45"
          />
          {/* Atmospheric Glow */}
          <circle cx="80" cy="80" r="62" fill="url(#earthAtmoGlow)" />
          <circle
            cx="80"
            cy="80"
            r="60"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            opacity="0.6"
          />
        </svg>
      );

    case 'mars':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className={`overflow-visible ${className}`}
        >
          <defs>
            <radialGradient id="marsBody" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FCA5A5" />
              <stop offset="40%" stopColor="#EF4444" />
              <stop offset="75%" stopColor="#B91C1C" />
              <stop offset="100%" stopColor="#450A0A" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="56" fill="url(#marsBody)" />
          {/* Dark Canyon regions */}
          <path
            d="M45 75 Q75 65 115 80 Q95 95 65 85 Z"
            fill="#7F1D1D"
            opacity="0.6"
          />
          <circle cx="60" cy="65" r="12" fill="#7F1D1D" opacity="0.4" />
          <circle cx="105" cy="95" r="10" fill="#7F1D1D" opacity="0.4" />
          {/* Polar ice cap */}
          <ellipse cx="80" cy="28" rx="16" ry="6" fill="#F8FAFC" opacity="0.85" />
          {/* Atmospheric edge */}
          <circle
            cx="80"
            cy="80"
            r="56"
            fill="none"
            stroke="#FCA5A5"
            strokeWidth="1.5"
            opacity="0.5"
          />
        </svg>
      );

    case 'neptune':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className={`overflow-visible ${className}`}
        >
          <defs>
            <radialGradient id="neptuneBody" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="40%" stopColor="#2563EB" />
              <stop offset="75%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#172554" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="58" fill="url(#neptuneBody)" />
          {/* Deep dark storm spot */}
          <ellipse cx="95" cy="70" rx="12" ry="6" fill="#1E3A8A" opacity="0.8" />
          {/* White cirrus methane clouds */}
          <path
            d="M50 75 Q80 70 110 75"
            stroke="#DBEAFE"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M60 90 Q90 85 120 92"
            stroke="#DBEAFE"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
          {/* Glowing azure atmospheric rim */}
          <circle
            cx="80"
            cy="80"
            r="58"
            fill="none"
            stroke="#93C5FD"
            strokeWidth="2"
            opacity="0.6"
          />
        </svg>
      );

    case 'uranus':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className={`overflow-visible ${className}`}
        >
          <defs>
            <radialGradient id="uranusBody" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#A5F3FC" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="85%" stopColor="#0E7490" />
              <stop offset="100%" stopColor="#164E63" />
            </radialGradient>
          </defs>
          {/* Vertical ring arc */}
          <ellipse
            cx="80"
            cy="80"
            rx="18"
            ry="72"
            fill="none"
            stroke="#A5F3FC"
            strokeWidth="2"
            opacity="0.4"
          />
          <circle cx="80" cy="80" r="55" fill="url(#uranusBody)" />
          <circle
            cx="80"
            cy="80"
            r="55"
            fill="none"
            stroke="#A5F3FC"
            strokeWidth="1.5"
            opacity="0.5"
          />
        </svg>
      );

    case 'venus':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className={`overflow-visible ${className}`}
        >
          <defs>
            <radialGradient id="venusBody" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="80%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="56" fill="url(#venusBody)" />
          {/* Swirling thick greenhouse cloud bands */}
          <path
            d="M40 60 Q80 50 120 65 Q90 75 50 70 Z"
            fill="#D97706"
            opacity="0.3"
          />
          <path
            d="M45 90 Q85 80 125 95 Q95 105 55 100 Z"
            fill="#B45309"
            opacity="0.35"
          />
          <circle
            cx="80"
            cy="80"
            r="56"
            fill="none"
            stroke="#FDE68A"
            strokeWidth="1.5"
            opacity="0.6"
          />
        </svg>
      );

    case 'mercury':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className={`overflow-visible ${className}`}
        >
          <defs>
            <radialGradient id="mercuryBody" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="45%" stopColor="#94A3B8" />
              <stop offset="80%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0F172A" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="46" fill="url(#mercuryBody)" />
          {/* Craters */}
          <circle cx="65" cy="65" r="7" fill="#334155" opacity="0.6" />
          <circle cx="95" cy="75" r="10" fill="#334155" opacity="0.6" />
          <circle cx="75" cy="95" r="8" fill="#334155" opacity="0.5" />
          <circle cx="90" cy="55" r="5" fill="#334155" opacity="0.5" />
          <circle
            cx="80"
            cy="80"
            r="46"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1"
            opacity="0.4"
          />
        </svg>
      );

    case 'pluto':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className={`overflow-visible ${className}`}
        >
          <defs>
            <radialGradient id="plutoBody" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#F5EBE1" />
              <stop offset="45%" stopColor="#C4B5A5" />
              <stop offset="80%" stopColor="#786B5D" />
              <stop offset="100%" stopColor="#292524" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="42" fill="url(#plutoBody)" />
          {/* Heart shaped Tombaugh Regio */}
          <path
            d="M72 70 C72 62 82 62 82 70 C82 62 92 62 92 70 C92 78 82 86 82 88 C82 86 72 78 72 70 Z"
            fill="#FFFFFF"
            opacity="0.8"
          />
          <circle
            cx="80"
            cy="80"
            r="42"
            fill="none"
            stroke="#E7E5E4"
            strokeWidth="1"
            opacity="0.4"
          />
        </svg>
      );

    case 'sedna':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className={`overflow-visible ${className}`}
        >
          <defs>
            <radialGradient id="sednaBody" cx="28%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#FDA4AF" />
              <stop offset="40%" stopColor="#E11D48" />
              <stop offset="75%" stopColor="#9F1239" />
              <stop offset="100%" stopColor="#4C0519" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="42" fill="url(#sednaBody)" />
          {/* Icy Tholin organic reddish terrain patches */}
          <path
            d="M60 65 Q75 55 90 70 Q105 85 85 95 Q65 90 60 75 Z"
            fill="#881337"
            opacity="0.6"
          />
          <circle
            cx="80"
            cy="80"
            r="42"
            fill="none"
            stroke="#FB7185"
            strokeWidth="1.5"
            opacity="0.5"
          />
        </svg>
      );

    case 'planet-x':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className={`overflow-visible ${className}`}
        >
          <defs>
            <radialGradient id="planetXBody" cx="30%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="35%" stopColor="#8B5CF6" />
              <stop offset="70%" stopColor="#5B21B6" />
              <stop offset="95%" stopColor="#2E1065" />
              <stop offset="100%" stopColor="#0B031E" />
            </radialGradient>
            <linearGradient id="planetXBands" x1="0" y1="0" x2="0" y2="1">
              <stop offset="25%" stopColor="#38BDF8" stopOpacity="0.25" />
              <stop offset="45%" stopColor="#A855F7" stopOpacity="0.3" />
              <stop offset="65%" stopColor="#06B6D4" stopOpacity="0.2" />
              <stop offset="85%" stopColor="#4C1D95" stopOpacity="0.35" />
            </linearGradient>
            <radialGradient id="planetXGlow" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor="#8B5CF6" stopOpacity="0" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="62" fill="url(#planetXBody)" />
          <circle cx="80" cy="80" r="62" fill="url(#planetXBands)" />
          {/* Subtle faint rings of cold dust */}
          <ellipse
            cx="80"
            cy="80"
            rx="82"
            ry="24"
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
            transform="rotate(-15 80 80)"
          />
          {/* Atmospheric Violet Halo */}
          <circle cx="80" cy="80" r="64" fill="url(#planetXGlow)" />
          <circle
            cx="80"
            cy="80"
            r="62"
            fill="none"
            stroke="#C084FC"
            strokeWidth="2"
            opacity="0.7"
          />
        </svg>
      );

    case 'sun':
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className={`overflow-visible ${className}`}
        >
          <defs>
            <radialGradient id="sunCore" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="30%" stopColor="#FEF08A" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#DC2626" />
            </radialGradient>
            <radialGradient id="sunCorona" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="70" fill="url(#sunCorona)" />
          <circle cx="80" cy="80" r="54" fill="url(#sunCore)" />
          <circle
            cx="80"
            cy="80"
            r="54"
            fill="none"
            stroke="#FEF08A"
            strokeWidth="2"
            opacity="0.7"
          />
        </svg>
      );
  }
};

