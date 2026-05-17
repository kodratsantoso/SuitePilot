import type { CreateCustomerInput, UpdateCustomerInput } from './schema.js'
import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'
import { parsePagination, paginationMeta } from '../../types/index.js'

export async function listCustomers(
  organizationId: string,
  query: { page?: string; perPage?: string; status?: string; search?: string }
) {
  const { page, perPage, skip } = parsePagination(query)
  const where = {
    organizationId,
    ...(query.status && { status: query.status as any }),
    ...(query.search && {
      name: { contains: query.search, mode: 'insensitive' as const },
    }),
  }

  const [total, customers] = await prisma.$transaction([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: perPage,
      include: { _count: { select: { projects: true } } },
    }),
  ])

  return { customers, meta: paginationMeta(total, page, perPage) }
}

export async function getCustomer(organizationId: string, customerId: string) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, organizationId },
    include: {
      _count: { select: { projects: true } },
      creator: { select: { id: true, name: true } },
    },
  })
  if (!customer) throw Errors.notFound('Customer')
  return customer
}

export async function createCustomer(
  organizationId: string,
  actorId: string,
  input: CreateCustomerInput
) {
  const customer = await prisma.customer.create({
    data: { ...input, organizationId, createdBy: actorId },
  })

  await writeAuditLog({
    organizationId,
    actorUserId: actorId,
    entityType: 'Customer',
    entityId: customer.id,
    action: 'CREATE',
    afterData: { name: customer.name },
  })

  return customer
}

export async function updateCustomer(
  organizationId: string,
  customerId: string,
  actorId: string,
  input: UpdateCustomerInput
) {
  const existing = await prisma.customer.findFirst({ where: { id: customerId, organizationId } })
  if (!existing) throw Errors.notFound('Customer')

  const customer = await prisma.customer.update({
    where: { id: customerId },
    data: { ...input, updatedBy: actorId },
  })

  await writeAuditLog({
    organizationId,
    actorUserId: actorId,
    entityType: 'Customer',
    entityId: customerId,
    action: 'UPDATE',
    beforeData: { name: existing.name, status: existing.status },
    afterData: { name: customer.name, status: customer.status },
  })

  return customer
}

export async function deleteCustomer(organizationId: string, customerId: string, actorId: string) {
  const existing = await prisma.customer.findFirst({ where: { id: customerId, organizationId } })
  if (!existing) throw Errors.notFound('Customer')

  const projectCount = await prisma.project.count({ where: { customerId, organizationId } })
  if (projectCount > 0) {
    throw Errors.conflict('Cannot delete customer with active projects')
  }

  await prisma.customer.delete({ where: { id: customerId } })

  await writeAuditLog({
    organizationId,
    actorUserId: actorId,
    entityType: 'Customer',
    entityId: customerId,
    action: 'DELETE',
    beforeData: { name: existing.name },
  })
}
