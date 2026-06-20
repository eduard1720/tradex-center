interface AreaChartProps {
  data: number[];
  height?: number;
  className?: string;
}

/**
 * Minimalist white line + soft fill area chart, matching the "Total Balance"
 * hero chart in the reference design. Scales to its container width.
 */
export function AreaChart({ data, height = 220, className = "" }: AreaChartProps) {
  const width = 1000; // viewBox width; SVG scales via preserveAspectRatio
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pad = 12;

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`w-full ${className}`}
      style={{ height }}
    >
      <defs>
        <linearGradient id="area-hero" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* horizontal guide lines */}
      {[0.25, 0.5, 0.75].map((p) => (
        <line
          key={p}
          x1={0}
          x2={width}
          y1={height * p}
          y2={height * p}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={1}
        />
      ))}
      <path d={`${line} L${width},${height} L0,${height} Z`} fill="url(#area-hero)" />
      <path d={line} fill="none" stroke="#ffffff" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r={4} fill="#F7931A" />
      <circle cx={last[0]} cy={last[1]} r={9} fill="#F7931A" fillOpacity="0.18" />
    </svg>
  );
}
