"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";

export const chartTheme = {
  grid: "var(--surface-glass-border)",
  axis: "var(--foreground-subtle)",
  tooltipBg: "var(--surface-1)",
  tooltipBorder: "var(--surface-glass-border)",
  mint: "var(--mint)",
  plasma: "var(--plasma)",
  gold: "var(--gold)",
};

export function ChartTooltipStyle() {
  return {
    backgroundColor: chartTheme.tooltipBg,
    border: `1px solid ${chartTheme.tooltipBorder}`,
    borderRadius: 8,
    color: "var(--foreground)",
  };
}

export {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  chartTheme as theme,
};
