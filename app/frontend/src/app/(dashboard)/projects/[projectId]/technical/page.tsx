'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTechnicalWorkstreams } from '@/hooks/useTechnicalWorkstreams'
import { useIntegrationMappings } from '@/hooks/useIntegrationMappings'
import { useRestletDesigns } from '@/hooks/useRestletDesigns'
import { useApiContracts } from '@/hooks/useApiContracts'
import { usePayloadValidations } from '@/hooks/usePayloadValidations'
import { useTechnicalDeliverables } from '@/hooks/useTechnicalDeliverables'
import { WorkstreamStatusBadge } from '@/components/ai/WorkstreamStatusBadge'
import { TechnicalStatusBadge } from '@/components/ai/TechnicalStatusBadge'
import { LoadingState } from '@/components/shared/LoadingState'

const NAV_CARDS = [
  { href: 'technical/workstreams', title: 'Workstreams', description: 'Manage technical workstreams and track delivery progress' },
  { href: 'technical/integration-mappings', title: 'Integration Mappings', description: 'Document system integrations, data flows and auth methods' },
  { href: 'technical/restlet-designs', title: 'RESTlet Designs', description: 'Design and document NetSuite RESTlet endpoints' },
  { href: 'technical/api-contracts', title: 'API Contracts', description: 'Define API schemas, request/response contracts and error handling' },
  { href: 'technical/payload-validations', title: 'Payload Validations', description: 'Manage JSON schema validation rules and sample payloads' },
  { href: 'technical/technical-deliverables', title: 'Technical Deliverables', description: 'Track all technical deliverables: migration plans, security plans, and more' },
]

export default function TechnicalDashboardPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const { data: workstreams = [], isLoading: loadingWS } = useTechnicalWorkstreams(projectId)
  const { data: integrations = [] } = useIntegrationMappings(projectId)
  const { data: restlets = [] } = useRestletDesigns(projectId)
  const { data: contracts = [] } = useApiContracts(projectId)
  const { data: validations = [] } = usePayloadValidations(projectId)
  const { data: deliverables = [] } = useTechnicalDeliverables(projectId)

  if (loadingWS) return <LoadingState message="Loading technical workspace..." />

  const recentIntegrations = integrations.slice(0, 3)
  const recentRestlets = restlets.slice(0, 3)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Technical Delivery</h1>
        <p className="mt-1 text-sm text-gray-500">Technical implementation workspace — integrations, RESTlets, API contracts and validations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
        {[
          { label: 'Workstreams', value: workstreams.length },
          { label: 'Integrations', value: integrations.length },
          { label: 'RESTlets', value: restlets.length },
          { label: 'API Contracts', value: contracts.length },
          { label: 'Payload Validations', value: validations.length },
          { label: 'Deliverables', value: deliverables.length },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Workstreams */}
      {workstreams.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Workstreams</h2>
          <div className="space-y-2">
            {workstreams.map((ws) => (
              <div key={ws.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <WorkstreamStatusBadge status={ws.status} />
                  <span className="font-medium text-gray-900 text-sm">{ws.name}</span>
                  {ws.owner && <span className="text-xs text-gray-400">· {ws.owner.name}</span>}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xs text-gray-400">{ws._count?.technicalDeliverables ?? 0} deliverables</div>
                  <div className="w-24">
                    <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                      <span>{ws.progressPercentage}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div
                        className="h-1.5 bg-blue-500 rounded-full transition-all"
                        style={{ width: `${ws.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Integration Mappings */}
      {recentIntegrations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Recent Integration Mappings</h2>
            <Link href="technical/integration-mappings" className="text-xs text-blue-600 hover:text-blue-800">View all</Link>
          </div>
          <div className="space-y-2">
            {recentIntegrations.map((im) => (
              <div key={im.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                <div>
                  <span className="font-medium text-gray-900 text-sm">{im.name}</span>
                  <span className="ml-2 text-xs text-gray-400">{im.sourceSystem} → {im.targetSystem}</span>
                </div>
                <TechnicalStatusBadge status={im.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent RESTlet Designs */}
      {recentRestlets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Recent RESTlet Designs</h2>
            <Link href="technical/restlet-designs" className="text-xs text-blue-600 hover:text-blue-800">View all</Link>
          </div>
          <div className="space-y-2">
            {recentRestlets.map((rd) => (
              <div key={rd.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                <div>
                  <span className="font-medium text-gray-900 text-sm">{rd.name}</span>
                  {rd.endpointUrl && <code className="ml-2 text-xs text-gray-400 font-mono">{rd.endpointUrl}</code>}
                </div>
                <TechnicalStatusBadge status={rd.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Cards */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Technical Tools</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NAV_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="font-medium text-gray-900 text-sm">{card.title}</div>
              <div className="text-xs text-gray-500 mt-1">{card.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
