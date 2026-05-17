/**
 * Development seed script
 * Creates fictional organizations, users, customers, and projects
 * for local development. DO NOT run against production.
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding development database...')

  // ── Organization 1 ──────────────────────────────────────────────────────────
  const org1 = await prisma.organization.upsert({
    where: { slug: 'apex-consulting' },
    update: {},
    create: { name: 'Apex Consulting Group', slug: 'apex-consulting', status: 'ACTIVE' },
  })
  console.log(`✓ Organization: ${org1.name}`)

  // ── Admin user for org1 ─────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: org1.id, email: 'admin@apex-consulting.dev' } },
    update: {},
    create: {
      organizationId: org1.id,
      name: 'Alex Johnson',
      email: 'admin@apex-consulting.dev',
      passwordHash: await bcrypt.hash('devpassword123', 12),
      status: 'ACTIVE',
    },
  })
  console.log(`✓ User: ${adminUser.name} (${adminUser.email})`)

  // ── PM user ─────────────────────────────────────────────────────────────────
  const pmUser = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: org1.id, email: 'pm@apex-consulting.dev' } },
    update: {},
    create: {
      organizationId: org1.id,
      name: 'Sarah Mitchell',
      email: 'pm@apex-consulting.dev',
      passwordHash: await bcrypt.hash('devpassword123', 12),
      status: 'ACTIVE',
    },
  })
  console.log(`✓ User: ${pmUser.name}`)

  // ── Consultant user ─────────────────────────────────────────────────────────
  const consultantUser = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: org1.id, email: 'consultant@apex-consulting.dev' } },
    update: {},
    create: {
      organizationId: org1.id,
      name: 'David Chen',
      email: 'consultant@apex-consulting.dev',
      passwordHash: await bcrypt.hash('devpassword123', 12),
      status: 'ACTIVE',
    },
  })
  console.log(`✓ User: ${consultantUser.name}`)

  // ── Customer 1 ──────────────────────────────────────────────────────────────
  const customer1 = await prisma.customer.upsert({
    where: { id: '00000000-0000-0000-0001-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0001-000000000001',
      organizationId: org1.id,
      name: 'Horizon Manufacturing Ltd',
      industry: 'Manufacturing',
      companySize: '501-1000',
      country: 'Australia',
      status: 'CUSTOMER',
      createdBy: adminUser.id,
    },
  })
  console.log(`✓ Customer: ${customer1.name}`)

  // ── Customer 2 ──────────────────────────────────────────────────────────────
  const customer2 = await prisma.customer.upsert({
    where: { id: '00000000-0000-0000-0001-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0001-000000000002',
      organizationId: org1.id,
      name: 'Pacific Wholesale Distribution',
      industry: 'Wholesale Distribution',
      companySize: '101-500',
      country: 'Australia',
      status: 'PROSPECT',
      createdBy: adminUser.id,
    },
  })
  console.log(`✓ Customer: ${customer2.name}`)

  // ── Project 1 — Active ──────────────────────────────────────────────────────
  const project1 = await prisma.project.upsert({
    where: { id: '00000000-0000-0000-0002-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0002-000000000001',
      organizationId: org1.id,
      customerId: customer1.id,
      projectCode: 'HML-001',
      name: 'Horizon Manufacturing — NetSuite Implementation',
      description:
        'Full NetSuite ERP implementation covering Finance, Procurement, Inventory, and Order Management.',
      projectType: 'NEW_IMPLEMENTATION',
      status: 'ACTIVE',
      health: 'AMBER',
      currentPhase: 'DESIGN',
      startDate: new Date('2026-02-01'),
      targetGoLiveDate: new Date('2026-08-01'),
      progressPercentage: 35,
      projectManagerId: pmUser.id,
      createdBy: adminUser.id,
    },
  })
  console.log(`✓ Project: ${project1.name}`)

  // ── Project 2 — Planned ─────────────────────────────────────────────────────
  const project2 = await prisma.project.upsert({
    where: { id: '00000000-0000-0000-0002-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0002-000000000002',
      organizationId: org1.id,
      customerId: customer2.id,
      projectCode: 'PWD-001',
      name: 'Pacific Wholesale — NetSuite Assessment',
      description: 'Pre-implementation assessment and fit-gap analysis.',
      projectType: 'ASSESSMENT',
      status: 'PLANNED',
      health: 'GREEN',
      currentPhase: 'PRESALES',
      targetGoLiveDate: new Date('2026-12-01'),
      progressPercentage: 5,
      createdBy: adminUser.id,
    },
  })
  console.log(`✓ Project: ${project2.name}`)

  // ── Project members ─────────────────────────────────────────────────────────
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project1.id, userId: pmUser.id } },
    update: {},
    create: { projectId: project1.id, userId: pmUser.id, role: 'PROJECT_MANAGER' },
  })
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project1.id, userId: consultantUser.id } },
    update: {},
    create: { projectId: project1.id, userId: consultantUser.id, role: 'FUNCTIONAL_CONSULTANT' },
  })

  // ── Tasks for project 1 ─────────────────────────────────────────────────────
  const taskData = [
    { title: 'Conduct chart of accounts design workshop', status: 'DONE' as const, priority: 'HIGH' as const },
    { title: 'Document AP approval workflow requirements', status: 'IN_PROGRESS' as const, priority: 'HIGH' as const },
    { title: 'Complete vendor master data template', status: 'TODO' as const, priority: 'MEDIUM' as const },
    { title: 'Configure financial periods and fiscal year', status: 'BLOCKED' as const, priority: 'HIGH' as const },
    { title: 'Review inventory valuation method with client', status: 'BACKLOG' as const, priority: 'MEDIUM' as const },
  ]

  for (const task of taskData) {
    await prisma.projectTask.create({
      data: {
        projectId: project1.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        ownerId: consultantUser.id,
        createdBy: pmUser.id,
      },
    })
  }
  console.log(`✓ Tasks created for ${project1.name}`)

  // ── Milestones for project 1 ────────────────────────────────────────────────
  const milestoneData = [
    {
      name: 'Solution Design Approved',
      targetDate: new Date('2026-04-30'),
      status: 'COMPLETED' as const,
      completionPercentage: 100,
    },
    {
      name: 'UAT Start',
      targetDate: new Date('2026-06-15'),
      status: 'NOT_STARTED' as const,
      completionPercentage: 0,
    },
    {
      name: 'Go-Live',
      targetDate: new Date('2026-08-01'),
      status: 'NOT_STARTED' as const,
      completionPercentage: 0,
    },
  ]

  for (const ms of milestoneData) {
    await prisma.projectMilestone.create({
      data: {
        projectId: project1.id,
        name: ms.name,
        targetDate: ms.targetDate,
        status: ms.status,
        completionPercentage: ms.completionPercentage,
        ownerId: pmUser.id,
        createdBy: pmUser.id,
      },
    })
  }
  console.log(`✓ Milestones created for ${project1.name}`)

  // ── RAID items for project 1 ────────────────────────────────────────────────
  const raidData = [
    {
      type: 'RISK' as const,
      title: 'Customer finance team limited availability during year-end close',
      description: 'Finance team will be unavailable for workshops during June close period.',
      severity: 'HIGH' as const,
      probability: 'HIGH' as const,
      impact: 'HIGH' as const,
      status: 'OPEN' as const,
      mitigation: 'Schedule all finance workshops before June 1. Confirm availability with CFO.',
    },
    {
      type: 'ASSUMPTION' as const,
      title: 'Single subsidiary, single currency (AUD)',
      description: 'Implementation assumes one legal entity operating in AUD. Multi-entity not in scope.',
      status: 'OPEN' as const,
    },
    {
      type: 'ISSUE' as const,
      title: 'Item master data quality in legacy system is poor',
      description: 'Sample extract showed ~30% of items have missing or incorrect UoM values.',
      severity: 'MEDIUM' as const,
      status: 'MONITORING' as const,
      mitigation: 'Client IT team to run data cleansing script before migration. Due: 2026-05-30.',
    },
  ]

  for (const item of raidData) {
    await prisma.raidItem.create({
      data: {
        projectId: project1.id,
        type: item.type,
        title: item.title,
        description: item.description,
        status: item.status,
        severity: 'severity' in item ? item.severity : undefined,
        probability: 'probability' in item ? item.probability : undefined,
        impact: 'impact' in item ? item.impact : undefined,
        mitigation: 'mitigation' in item ? item.mitigation : undefined,
        ownerId: pmUser.id,
        createdBy: pmUser.id,
      },
    })
  }
  console.log(`✓ RAID items created for ${project1.name}`)

  console.log('\n✅ Seed complete.')
  console.log('\n📋 Dev credentials:')
  console.log('  Admin:      admin@apex-consulting.dev / devpassword123')
  console.log('  PM:         pm@apex-consulting.dev / devpassword123')
  console.log('  Consultant: consultant@apex-consulting.dev / devpassword123')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
