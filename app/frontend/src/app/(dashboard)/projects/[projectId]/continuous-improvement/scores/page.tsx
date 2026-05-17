'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useOptimizationScores, useOptimizationTrends } from '@/hooks/useContinuousImprovement'
import { DonutChart } from '@/components/dashboard/DonutChart'
import { MiniBarChart } from '@/components/dashboard/MiniBarChart'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState } from '@/components/shared/LoadingState'
import type { OptimizationMetricType } from '@/types'

const METRIC_LABELS: Record<OptimizationMetricType, string> = {
  EFFICIENCY: 'Efficiency',
  ACCURACY: 'Accuracy',
  RISK_MITIGATION: 'Risk Mitigation',
  AI_OUTPUT_QUALITY: 'AI Output Quality',
}

const METRIC_DESCRIPTIONS: Record<OptimizationMetricType, string> = {
  EFFICIENCY: 'Task and milestone completion rate vs total assigned work',
  ACCURACY: 'AI output validation pass rate across all generated outputs',
  RISK_MITIGATION: 'Inverse of open issues, RAID items, and critical feedback entries',
  AI_OUTPUT_QUALITY: 'Validation pass rate minus hallucination penalty',
}

const RAG_BADGE: Record<string, string> = {
  GREEN: 'text-green-700 bg-green-50 border-green-200',
  AMBER: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  RED: 'text-red-700 bg-red-50 border-red-200',
}

const RAG_DONUT_COLORS: Record<string, string> = {
  GREEN: '#22c55e',
  AMBER: '#f59e0b',
  RED: '#ef4444',
}

const METRICS: OptimizationMetricType[] = [
  'EFFICIENCY', 'ACCURACY', 'RISK_MITIGATION', 'AI_OUTPUT_QUALITY',
]

export default function OptimizationScoresPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [selectedMetric, setSelectedMetric] = useState<OptimizationMetricType>('EFFICIENCY')

  const { data: scores = [], isLoading: loadingScores } = useOptimizationScores(projectId)
  const { data: trends = [], isLoading: loadingTrends } = useOptimizationTrends(projectId, {
    metricType: selectedMetric,
    timeRange: 30,
  })

  if (loadingScores) return <LoadingState />

  const scoreMap = scores.reduce<Record<string, (typeof scores)[0]>>((acc, s) => {
    acc[s.metricType] = s
    return acc
  }, {})

  const overallScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
    : 0

  const overallRag = overallScore >= 70 ? 'GREEN' : overallScore >= 40 ? 'AMBER' : 'RED'

  return (
    <div className="space-y-8">
      <PageHeader
        title="Optimization Scores"
        description="Efficiency, accuracy, risk mitigation, and AI output quality scores with historical trends."
      />

      {/* Overall Score */}
      {scores.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0 text-center">
              <DonutChart
                segments={[
                  { label: 'Score', value: overallScore, color: RAG_DONUT_COLORS[overallRag] },
                  { label: 'Remaining', value: 100 - overallScore, color: '#f3f4f6' },
                ]}
                size={100}
                thickness={18}
              />
              <div className="text-xs text-gray-500 mt-1">Overall</div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">{overallScore}</span>
                <span className="text-gray-400 text-lg">/100</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${RAG_BADGE[overallRag]}`}>
                  {overallRag}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Average optimization score across all metrics</p>
            </div>
          </div>
        </div>
      )}

      {/* Individual Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map(metric => {
          const s = scoreMap[metric]
          const score = s ? Math.round(s.score) : null
          const rag = s?.ragStatus ?? 'AMBER'

          return (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`rounded-lg border p-5 text-left transition-all ${
                selectedMetric === metric
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {METRIC_LABELS[metric]}
                </span>
                {s && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${RAG_BADGE[rag]}`}>
                    {rag}
                  </span>
                )}
              </div>
              {score !== null ? (
                <>
                  <div className="text-3xl font-bold text-gray-900">
                    {score}<span className="text-sm text-gray-400 font-normal">/100</span>
                  </div>
                  {/* Mini progress bar */}
                  <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${score}%`,
                        backgroundColor: RAG_DONUT_COLORS[rag],
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-400">Not yet calculated</div>
              )}
              <p className="text-xs text-gray-400 mt-2 leading-tight">{METRIC_DESCRIPTIONS[metric]}</p>
            </button>
          )
        })}
      </div>

      {/* Trend Chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {METRIC_LABELS[selectedMetric]} Trend (Last 30 Days)
          </h2>
          <div className="flex gap-2">
            {METRICS.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMetric(m)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  selectedMetric === m
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {METRIC_LABELS[m].split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {loadingTrends ? (
          <LoadingState />
        ) : trends.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-400">No trend data yet. Run a score calculation to start tracking.</p>
          </div>
        ) : (
          <MiniBarChart
            height={100}
            bars={trends.slice(-14).map((t, i) => ({
              label: `D${i + 1}`,
              value: Math.round(t.score),
              color: RAG_DONUT_COLORS[t.ragStatus] ?? '#3b82f6',
            }))}
          />
        )}

        <p className="text-xs text-gray-400">
          {METRIC_DESCRIPTIONS[selectedMetric]}
        </p>
      </div>
    </div>
  )
}
