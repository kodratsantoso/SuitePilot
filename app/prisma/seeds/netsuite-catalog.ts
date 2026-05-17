import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const NETSUITE_MODULES = [
  {
    moduleName: 'Financial Management',
    category: 'Finance',
    description:
      'Core general ledger, chart of accounts, accounting periods, journal entries, budgets, and financial reporting. The foundational module for all NetSuite implementations.',
    dependencies: [],
    implementationNotes:
      'Always implemented first. Includes GL, trial balance, financial statements. Configure chart of accounts carefully — restructuring post-go-live is costly.',
  },
  {
    moduleName: 'Accounts Payable',
    category: 'Finance',
    description:
      'Vendor bill entry, approval workflows, payment processing, vendor credits, aging reports, and 1099 management.',
    dependencies: ['Financial Management'],
    implementationNotes:
      'Requires vendor records and payment methods. Configure approval workflows before go-live. Consider ACH/EFT payment setup.',
  },
  {
    moduleName: 'Accounts Receivable',
    category: 'Finance',
    description:
      'Customer invoicing, payment application, collections management, aging reports, dunning letters, and credit limits.',
    dependencies: ['Financial Management'],
    implementationNotes:
      'Integrates with Order Management. Plan payment terms and credit limit rules early.',
  },
  {
    moduleName: 'Procurement',
    category: 'Procurement',
    description:
      'Purchase requisitions, purchase orders, vendor management, receiving, three-way matching (PO/receipt/bill), and vendor performance.',
    dependencies: ['Financial Management', 'Accounts Payable'],
    implementationNotes:
      'Define approval hierarchies and spending limits early. Consider punch-out catalog integration if needed.',
  },
  {
    moduleName: 'Inventory Management',
    category: 'Supply Chain',
    description:
      'Item records, inventory tracking by location, stock adjustments, cycle counts, reorder points, and inventory valuation (FIFO/LIFO/Average Cost).',
    dependencies: ['Financial Management'],
    implementationNotes:
      'Costing method selection is critical and difficult to change. Evaluate lot/serial tracking requirements early.',
  },
  {
    moduleName: 'Warehouse Management System',
    category: 'Supply Chain',
    description:
      'Bin and zone management, directed put-away and picking, mobile scanning, wave picking, and packing station management.',
    dependencies: ['Inventory Management'],
    implementationNotes:
      'Requires warehouse layout planning before configuration. Mobile device setup and barcode/RFID integration add complexity.',
  },
  {
    moduleName: 'Order Management',
    category: 'Sales',
    description:
      'Sales orders, order fulfillment, shipping integration, return authorizations, and drop shipping. Central hub connecting sales and fulfillment.',
    dependencies: ['Financial Management', 'Inventory Management'],
    implementationNotes:
      'Map existing order-to-cash process carefully. Shipping carrier integrations (FedEx, UPS, ShipStation) are common.',
  },
  {
    moduleName: 'CRM',
    category: 'Sales',
    description:
      'Customer relationship management, contact and company management, activity tracking, cases, email marketing, and support cases.',
    dependencies: ['Financial Management'],
    implementationNotes:
      'Customer data migration is usually the most complex part. Map legacy CRM fields carefully.',
  },
  {
    moduleName: 'Sales Force Automation',
    category: 'Sales',
    description:
      'Opportunity management, sales pipeline, forecasting, quotes/estimates, sales commissions, and territory management.',
    dependencies: ['CRM'],
    implementationNotes:
      'Commission calculation rules can be complex. Define forecast categories and pipeline stages before configuration.',
  },
  {
    moduleName: 'Revenue Recognition',
    category: 'Finance',
    description:
      'ASC 606 / IFRS 15 compliant revenue recognition, revenue schedules, deferred revenue, performance obligations, and revenue arrangements.',
    dependencies: ['Financial Management', 'Order Management'],
    implementationNotes:
      'High accounting complexity. Engage accounting team early. Revenue recognition templates must be tested extensively.',
  },
  {
    moduleName: 'Fixed Assets',
    category: 'Finance',
    description:
      'Asset register, depreciation calculation (straight-line, declining balance, etc.), asset disposal, impairment, and asset tracking.',
    dependencies: ['Financial Management'],
    implementationNotes:
      'Legacy asset data migration requires detailed asset schedules. Depreciation method migration mid-year is complex.',
  },
  {
    moduleName: 'Manufacturing',
    category: 'Manufacturing',
    description:
      'Bill of materials (BOM), work orders, routing, production scheduling, shop floor control, assembly builds, and manufacturing costs.',
    dependencies: ['Inventory Management', 'Financial Management'],
    implementationNotes:
      'High complexity. Requires manufacturing process mapping workshops. BOM structure and routing accuracy critical for cost accuracy.',
  },
  {
    moduleName: 'SuiteAnalytics',
    category: 'Analytics',
    description:
      'Saved searches, custom reports, dashboards, KPIs, SuiteAnalytics Workbook, and SuiteAnalytics Connect (ODBC/JDBC access to data warehouse).',
    dependencies: ['Financial Management'],
    implementationNotes:
      'Plan reporting requirements during design phase. Custom reports are a significant workload — budget accordingly.',
  },
  {
    moduleName: 'SuiteProjects',
    category: 'Professional Services',
    description:
      'Project management, time and expense tracking, project billing, resource planning, project P&L, and milestone billing.',
    dependencies: ['Financial Management', 'Accounts Receivable'],
    implementationNotes:
      'Suitable for service-based businesses. Integrates with billing for project-based invoicing.',
  },
  {
    moduleName: 'SuitePeople',
    category: 'HR',
    description:
      'Human resources, employee records, payroll processing, benefits administration, and time-off management.',
    dependencies: ['Financial Management'],
    implementationNotes:
      'Payroll setup is jurisdiction-specific and time-consuming. Plan for significant testing before first payroll run.',
  },
  {
    moduleName: 'Multi-Currency',
    category: 'Finance',
    description:
      'Foreign currency transactions, exchange rate management, unrealized/realized gains and losses, revaluation, and multi-currency reporting.',
    dependencies: ['Financial Management'],
    implementationNotes:
      'Enable early in the project. Exchange rate source (manual, automatic ECB/Fed) must be decided during design.',
  },
  {
    moduleName: 'Multi-Subsidiary / OneWorld',
    category: 'Finance',
    description:
      'Multi-entity/subsidiary management, intercompany transactions, elimination, consolidated reporting, and global tax management.',
    dependencies: ['Financial Management', 'Multi-Currency'],
    implementationNotes:
      'Requires OneWorld license. Intercompany workflow mapping is complex. Plan elimination rules carefully.',
  },
  {
    moduleName: 'SuiteFlow / Workflow',
    category: 'Platform',
    description:
      'Point-and-click workflow automation for approvals, notifications, field updates, and record creation. No-code business process automation.',
    dependencies: ['Financial Management'],
    implementationNotes:
      'Document all workflow requirements before configuration. Complex workflows may require SuiteScript for full capability.',
  },
  {
    moduleName: 'SuiteBuilder / Customization',
    category: 'Platform',
    description:
      'Custom fields, custom records, custom forms, custom lists, and custom segments. Extends NetSuite data model without code.',
    dependencies: ['Financial Management'],
    implementationNotes:
      'Minimize custom fields — use standard fields where possible. Custom segment performance impact must be evaluated.',
  },
  {
    moduleName: 'Integration / Connector',
    category: 'Integration',
    description:
      'Integration with external systems via REST/SOAP APIs, SuiteScript integrations, pre-built connectors, and iPaaS platforms (MuleSoft, Boomi, etc.).',
    dependencies: ['Financial Management'],
    implementationNotes:
      'Each integration requires detailed interface design. Plan for significant testing effort. Token-based authentication recommended.',
  },
]

export async function seedNetsuiteCatalog() {
  console.log('Seeding NetSuite module catalog...')

  for (const module of NETSUITE_MODULES) {
    await prisma.netsuiteModuleCatalog.upsert({
      where: { moduleName: module.moduleName },
      update: {
        category: module.category,
        description: module.description,
        dependencies: module.dependencies as any,
        implementationNotes: module.implementationNotes,
      },
      create: {
        moduleName: module.moduleName,
        category: module.category,
        description: module.description,
        dependencies: module.dependencies as any,
        implementationNotes: module.implementationNotes,
      },
    })
  }

  console.log(`✓ Seeded ${NETSUITE_MODULES.length} NetSuite modules`)
}

// Run if called directly
seedNetsuiteCatalog()
  .then(() => {
    console.log('Catalog seed complete.')
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
