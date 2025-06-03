import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sites first
  const site1 = await prisma.site.upsert({
    where: { code: 'HQ001' },
    update: {},
    create: {
      name: 'Corporate Headquarters',
      code: 'HQ001',
    },
  });

  const site2 = await prisma.site.upsert({
    where: { code: 'BR001' },
    update: {},
    create: {
      name: 'Branch Office',
      code: 'BR001',
    },
  });

  console.log('✅ Sites created');

  // Create users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@startpoint.com' },
    update: {},
    create: {
      email: 'admin@startpoint.com',
      name: 'System Administrator',
      employeeId: 'EMP001',
      siteId: site1.id,
      department: 'IT',
      jobTitle: 'IT Manager',
      status: 'ACTIVE',
      startDate: new Date('2024-01-01'),
    },
  });

  const johnDoe = await prisma.user.upsert({
    where: { email: 'john.doe@startpoint.com' },
    update: {},
    create: {
      email: 'john.doe@startpoint.com',
      name: 'John Doe',
      employeeId: 'EMP002',
      siteId: site1.id,
      department: 'IT',
      jobTitle: 'IT Technician',
      status: 'ACTIVE',
      startDate: new Date('2024-01-15'),
    },
  });

  const janeDoe = await prisma.user.upsert({
    where: { email: 'jane.doe@startpoint.com' },
    update: {},
    create: {
      email: 'jane.doe@startpoint.com',
      name: 'Jane Doe',
      employeeId: 'EMP003',
      siteId: site1.id,
      department: 'HR',
      jobTitle: 'HR Specialist',
      status: 'ACTIVE',
      startDate: new Date('2024-01-10'),
    },
  });

  console.log('✅ Users created');

  // Create some assets
  const laptop1 = await prisma.asset.upsert({
    where: { assetTag: 'LAP001' },
    update: {},
    create: {
      assetTag: 'LAP001',
      name: 'Dell Latitude 7420',
      type: 'LAPTOP',
      manufacturer: 'Dell',
      model: 'Latitude 7420',
      serialNumber: 'DL001234',
      siteId: site1.id,
      status: 'AVAILABLE',
      condition: 'Good',
      location: 'IT Storage',
      purchaseDate: new Date('2024-01-01'),
      purchasePrice: 1200.00,
    },
  });

  const laptop2 = await prisma.asset.upsert({
    where: { assetTag: 'LAP002' },
    update: {},
    create: {
      assetTag: 'LAP002',
      name: 'MacBook Pro 14"',
      type: 'LAPTOP',
      manufacturer: 'Apple',
      model: 'MacBook Pro 14-inch',
      serialNumber: 'MB001234',
      siteId: site1.id,
      userId: johnDoe.id,
      status: 'ASSIGNED',
      condition: 'Excellent',
      location: 'Assigned to John Doe',
      purchaseDate: new Date('2024-01-15'),
      purchasePrice: 2500.00,
      assignedDate: new Date('2024-01-16'),
    },
  });

  console.log('✅ Assets created');

  // Create department baselines
  await prisma.departmentBaseline.upsert({
    where: { 
      department_siteId: {
        department: 'IT',
        siteId: site1.id,
      }
    },
    update: {},
    create: {
      department: 'IT',
      siteId: site1.id,
      standardAssets: [
        { type: 'LAPTOP', specs: 'Dell Latitude or MacBook Pro', required: true },
        { type: 'MONITOR', specs: '24" or larger', required: false }
      ],
      requiredGroups: [
        'IT_Admin',
        'Domain_Users',
        'VPN_Users'
      ],
      commonLicenses: [
        'Microsoft 365',
        'Windows 11 Pro',
        'Adobe Creative Suite'
      ],
    },
  });

  console.log('✅ Department baselines created');

  // Create sample tasks
  const taskCount = await prisma.task.count();
  
  if (taskCount === 0) {
    await prisma.task.createMany({
      data: [
        {
          id: 'task1',
          taskNumber: 'TSK-000001',
          title: 'Onboard new employee - Jane Doe',
          description: 'Set up computer, accounts, and access for new HR employee Jane Doe starting January 10th.',
          category: 'USER_ONBOARDING',
          priority: 'HIGH',
          status: 'COMPLETED',
          createdBy: adminUser.id,
          assignedTo: johnDoe.id,
          siteId: site1.id,
          department: 'HR',
          userId: janeDoe.id,
          dueDate: new Date('2024-01-10'),
          completedAt: new Date('2024-01-09'),
          estimatedHours: 4,
          actualHours: 3.5,
        },
        {
          id: 'task2',
          taskNumber: 'TSK-000002',
          title: 'Monthly security compliance audit',
          description: 'Review user access rights, update security policies, and ensure all systems are compliant with company security standards.',
          category: 'COMPLIANCE_CHECK',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          createdBy: adminUser.id,
          assignedTo: johnDoe.id,
          siteId: site1.id,
          department: 'IT',
          dueDate: new Date('2024-02-15'),
          estimatedHours: 8,
        },
        {
          id: 'task3',
          taskNumber: 'TSK-000003',
          title: 'Asset inventory verification',
          description: 'Physical verification of all IT assets in HQ location, update asset database with current locations and conditions.',
          category: 'INVENTORY_AUDIT',
          priority: 'LOW',
          status: 'TODO',
          createdBy: adminUser.id,
          siteId: site1.id,
          department: 'IT',
          dueDate: new Date('2024-03-01'),
          estimatedHours: 12,
        },
        {
          id: 'task4',
          taskNumber: 'TSK-000004',
          title: 'Update workstation for John Doe',
          description: 'Upgrade RAM and install additional software on John\'s workstation to support new development projects.',
          category: 'ASSET_MAINTENANCE',
          priority: 'MEDIUM',
          status: 'WAITING',
          createdBy: adminUser.id,
          assignedTo: johnDoe.id,
          siteId: site1.id,
          department: 'IT',
          userId: johnDoe.id,
          assetId: laptop2.id,
          dueDate: new Date('2024-02-20'),
          estimatedHours: 2,
        },
      ],
    });

    console.log('✅ Sample tasks created');
  }

  // Create some access anomalies for demonstration
  await prisma.accessAnomaly.upsert({
    where: { id: 'anomaly1' },
    update: {},
    create: {
      id: 'anomaly1',
      userId: janeDoe.id,
      type: 'MISSING_STANDARD_ITEM',
      description: 'User Jane Doe does not have the standard HR software license assigned',
      suggestion: 'Assign Microsoft 365 license with HR-specific tools',
      severity: 'MEDIUM',
      status: 'OPEN',
    },
  });

  console.log('✅ Sample anomalies created');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Sites: 2`);
  console.log(`- Users: 3`);
  console.log(`- Assets: 2`);
  console.log(`- Tasks: 4`);
  console.log(`- Anomalies: 1`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 