'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCISummary, useOptimizationScores } from '@/hooks/useContinuousImprovement'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { DonutChart } from '@/components/dashboard/DonutChart'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState } from '@/components/shared/LoadingState'
import type { FeedbackSeverity, RecommendationType, OptimizationMetricType } from '@/types'

const SEVERITY_COLORS: Record<FeedbackSeverity, string> = {
  LOW: 'text-gray-600 bg-gray-50 border-gray-200',
  MEDIUM: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  HIGH: 'text-orange-700 bg-orange-50 border-orange-200',
  CRITICAL: 'text-red-700 bg-red-50 border-red-200',
}

const TYPE_LABELS: Record<RecommendationType, string> = {
  PROCESS: 'Process',
  AI_MODEL: 'AI Model',
  WORKFLOW: 'Workflow',
  RISK_MITIGATION: 'Risk Mitigation',
}

const METRIC_LABELS: Record<OptimizationMetricType, string> = {
  EFFICIENCY: 'Efficiency',
  ACCURACY: 'Accuracy',
  RISK_MITIGATION: 'Risk Mitigation',
  AI_OUTPUT_QUALITY: 'AI Output Quality',
}

const RAG_COLORS = {
  GREEN: 'text-green-700 bg-green-50 border-green-200',
  AMBER: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  RED: 'text-red-700 bg-red-50 border-red-200',
}

const NAV_CARDS = [
  { href: 'continuous-improvement/feedback', title: 'Feedback Entries', description: 'View and manage feedback from hypercare, governance, and project delivery' },
  { href: 'continuous-improvement/recommendations', title: 'Recommendations', description: 'Review AI-generated optimization recommendations and approve actions' },
  { href: 'continuous-improvement/scores', title: 'Optimization Scores', description: 'View efficiency, accuracy, risk mitigation, and AI quality scores with trends' },
]

export default function ContinuousImprovementPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: summary, isLoading: loadingSummary } = useCISummary(projectId)
  const { data: scores = [], isLoading: loadingScores } = useOptimizationScores(projectId)

  if (loadingSummary) return <LoadingState />

  return (
    <div className="space-y-8">
      <PageHeader
        title="Continuous Improvement"
        description="AI-assisted feedback loops, learning from project execution, and optimization scoring."
      />

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {NAV_CARDS.map(card => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <p className="font-semibold text-gray-900 text-sm">{card.title}</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{card.description}</p>
          </Link>
        ))}
      </div>

      {/* KPI Summary */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard label="Total Feedback Entries" value={summary.totalFeedback} color="blue" />
          <KpiCard
            label="Critical Feedback"
            value={summary.criticalFeedback}
            color={summary.criticalFeedback > 0 ? 'red' : 'green'}
          />
          <KpiCard
            label="Pending Recommendations"
            value={summary.pendingRecommendations}
            color={summary.pendingRecommendations > 0 ? 'yellow' : 'green'}
          />
        </div>
      )}

      {/* Optimization Scores */}
      {!loadingScores && scores.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Optimization Scores</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {scores.map(s => (
              <div key={s.metricType} className="rounded-lg border border-gray-200 p-4 text-center space-y-2">
                <DonutChart
                  segments={[
                    { label: 'Score', value: Math.round(s.score), color: s.ragStatus === 'GREEN' ? '#22c55e' : s.ragStatus === 'AMBER' ? '#f59e0b' : '#ef4444' },
                    { label: 'Remaining', value: 100 - Math.round(s.score), color: '#f3f4f6' },
                  ]}
                  size={80}
                  thickness={14}
                />
                <div>
                  <div className="text-lg font-bold text-gray-900">{Math.round(s.score)}<span className="text-xs text-gray-400">/100</span></div>
                  <div className="text-xs text-gray-500 mt-0.5">{METRIC_LABELS[s.metricType]}</div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium mt-1 ${RAG_COLORS[s.ragStatus]}`}>
                    {s.ragStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <Link href="continuous-improvement/scores" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View trends &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Recent Feedback & Top Recommendations side-by-side */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Feedback */}
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Recent Feedback</h2>
              <Link href="continuous-improvement/feedback" className="text-xs text-blue-600 hover:text-blue-800">
                View all &rarr;
              </Link>
            </div>
            {summary.recentFeedback.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">No feedback yet</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {summary.recentFeedback.map(f => (
                  <div key={f.id} className="px-5 py-3 flex items-start gap-3">
                    <span className={`flex-shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${SEVERITY_COLORS[f.severity]}`}>
                      {f.severity}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800 truncate">{f.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {f.feedbackType.replace(/_/g, ' ')} · {f.createdByUser?.name ?? ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Recommendations */}
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Top Recommendations</h2>
              <Link href="continuous-improvement/recommendations" className="text-xs text-blue-600 hover:text-blue-800">
                View all &rarr;
              </Link>
            </div>
            {summary.topRecommendations.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">No recommendations yet</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {summary.topRecommendations.map(r => (
                  <div key={r.id} className="px-5 py-3 flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {TYPE_LABELS[r.recommendationType]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800 line-clamp-2">{r.description}</p>
                      {r.impactScore != null && (
                        <p className="text-xs text-gray-400 mt-0.5">Impact: {Math.round(r.impactScore)}/100</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
