import { z } from 'zod'

export const createTechnicalWorkstreamSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  ownerId: z.string().uuid().optional(),
  status: z.enum(['PLANNED','ACTIVE','BLOCKED','COMPLETED','ON_HOLD']).optional(),
})
export const updateTechnicalWorkstreamSchema = createTechnicalWorkstreamSchema.partial().extend({
  progressPercentage: z.number().int().min(0).max(100).optional(),
})

export const createIntegrationMappingSchema = z.object({
  name: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  sourceSystem: z.string().min(1).max(200),
  targetSystem: z.string().min(1).max(200),
  integrationMethod: z.enum(['REST','SOAP','FILE_BASED']).optional(),
  dataFlowNotes: z.string().max(3000).optional(),
  authMethod: z.string().max(200).optional(),
  frequencyNotes: z.string().max(500).optional(),
  assumptions: z.string().max(2000).optional(),
  risks: z.string().max(2000).optional(),
})
export const updateIntegrationMappingSchema = createIntegrationMappingSchema.partial().extend({
  status: z.enum(['DRAFT','IN_REVIEW','APPROVED','REJECTED','PUBLISHED']).optional(),
})

export const createRestletDesignSchema = z.object({
  name: z.string().min(1).max(300),
  endpointUrl: z.string().max(500).optional(),
  method: z.enum(['GET','POST','PUT','DELETE']).optional(),
  requestSchema: z.record(z.unknown()).optional(),
  responseSchema: z.record(z.unknown()).optional(),
  authenticationType: z.string().max(100).optional(),
  errorHandlingStrategy: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
})
export const updateRestletDesignSchema = createRestletDesignSchema.partial().extend({
  status: z.enum(['DRAFT','IN_REVIEW','APPROVED','REJECTED','PUBLISHED']).optional(),
})

export const createApiContractSchema = z.object({
  endpoint: z.string().min(1).max(500),
  method: z.enum(['GET','POST','PUT','DELETE']).optional(),
  requestSchema: z.record(z.unknown()).optional(),
  responseSchema: z.record(z.unknown()).optional(),
  queryParams: z.record(z.unknown()).optional(),
  headers: z.record(z.unknown()).optional(),
  statusCodes: z.record(z.unknown()).optional(),
  errorHandling: z.string().max(2000).optional(),
  authRequired: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
})
export const updateApiContractSchema = createApiContractSchema.partial().extend({
  status: z.enum(['DRAFT','IN_REVIEW','APPROVED','REJECTED','PUBLISHED']).optional(),
})

export const createPayloadValidationSchema = z.object({
  name: z.string().min(1).max(300),
  payloadType: z.enum(['REQUEST','RESPONSE']).optional(),
  schema: z.record(z.unknown()).optional(),
  validationRules: z.record(z.unknown()).optional(),
  samplePayload: z.string().max(10000).optional(),
  notes: z.string().max(2000).optional(),
})
export const updatePayloadValidationSchema = createPayloadValidationSchema.partial().extend({
  status: z.enum(['DRAFT','IN_REVIEW','APPROVED','REJECTED','PUBLISHED']).optional(),
})

export const createTechnicalDeliverableSchema = z.object({
  deliverableType: z.enum(['INTEGRATION_MAPPING','RESTLET_DESIGN','API_CONTRACT','PAYLOAD_VALIDATION','DATA_MIGRATION_PLAN','SECURITY_PLAN']),
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  workstreamId: z.string().uuid().optional(),
  status: z.enum(['DRAFT','IN_REVIEW','APPROVED','REJECTED','PUBLISHED']).optional(),
})

export type CreateTechnicalWorkstreamInput = z.infer<typeof createTechnicalWorkstreamSchema>
export type UpdateTechnicalWorkstreamInput = z.infer<typeof updateTechnicalWorkstreamSchema>
export type CreateIntegrationMappingInput = z.infer<typeof createIntegrationMappingSchema>
export type UpdateIntegrationMappingInput = z.infer<typeof updateIntegrationMappingSchema>
export type CreateRestletDesignInput = z.infer<typeof createRestletDesignSchema>
export type UpdateRestletDesignInput = z.infer<typeof updateRestletDesignSchema>
export type CreateApiContractInput = z.infer<typeof createApiContractSchema>
export type UpdateApiContractInput = z.infer<typeof updateApiContractSchema>
export type CreatePayloadValidationInput = z.infer<typeof createPayloadValidationSchema>
export type UpdatePayloadValidationInput = z.infer<typeof updatePayloadValidationSchema>
export type CreateTechnicalDeliverableInput = z.infer<typeof createTechnicalDeliverableSchema>
