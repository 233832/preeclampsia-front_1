"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Heart, Thermometer, Droplets } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts"

interface VitalSignData {
  week: string
  value: number
}

interface VitalSignsChartProps {
  title: string
  data: VitalSignData[]
  unit: string
  normalMin: number
  normalMax: number
  currentValue: number
  icon: "bp" | "hr" | "temp" | "bmi"
  color?: string
}

const iconMap = {
  bp: Activity,
  hr: Heart,
  temp: Thermometer,
  bmi: Droplets,
}

export function VitalSignsChart({
  title,
  data,
  unit,
  normalMin,
  normalMax,
  currentValue,
  icon,
  color = "var(--primary)",
}: VitalSignsChartProps) {
  const Icon = iconMap[icon]
  const isInRange = currentValue >= normalMin && currentValue <= normalMax

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="pb-2 px-3 pt-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-semibold min-w-0">
            <Icon className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">{title}</span>
          </CardTitle>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-xl font-bold" style={{ color: isInRange ? "var(--risk-low)" : "var(--risk-high)" }}>
              {currentValue}
            </span>
            <span className="text-xs text-muted-foreground">{unit}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Normal: {normalMin}-{normalMax} {unit}
        </p>
      </CardHeader>
      <CardContent className="pt-2 px-2 pb-3">
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id={`gradient-${icon}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis 
                domain={[normalMin - 10, normalMax + 10]}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={{ stroke: "var(--border)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              <ReferenceLine 
                y={normalMin} 
                stroke="var(--risk-low)" 
                strokeDasharray="5 5" 
                strokeOpacity={0.7}
              />
              <ReferenceLine 
                y={normalMax} 
                stroke="var(--risk-low)" 
                strokeDasharray="5 5" 
                strokeOpacity={0.7}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${icon})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
