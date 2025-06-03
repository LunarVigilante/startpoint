import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a site
  const site = await prisma.site.upsert({
    where: { code: 'ANLIN_CLOVIS' },
    update: {},
    create: {
      name: 'Anlin Windows & Doors - Clovis',
      code: 'ANLIN_CLOVIS',
    },
  });

  console.log('✅ Site created:', site.name);

  // Create users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john.smith@anlinwindows.com' },
      update: {},
      create: {
        email: 'john.smith@anlinwindows.com',
        employeeId: 'EMP001',
        name: 'John Smith',
        siteId: site.id,
        department: 'Engineering',
        jobTitle: 'Senior Software Engineer',
        manager: 'Alice Johnson',
        status: 'ACTIVE',
        startDate: new Date('2023-01-15'),
        lastReviewed: new Date('2024-01-15'),
      },
    }),
    prisma.user.upsert({
      where: { email: 'sarah.johnson@anlinwindows.com' },
      update: {},
      create: {
        email: 'sarah.johnson@anlinwindows.com',
        employeeId: 'EMP002',
        name: 'Sarah Johnson',
        siteId: site.id,
        department: 'Marketing',
        jobTitle: 'Marketing Manager',
        manager: 'Bob Wilson',
        status: 'ACTIVE',
        startDate: new Date('2022-08-20'),
        lastReviewed: new Date('2024-01-10'),
      },
    }),
    prisma.user.upsert({
      where: { email: 'mike.davis@anlinwindows.com' },
      update: {},
      create: {
        email: 'mike.davis@anlinwindows.com',
        employeeId: 'EMP003',
        name: 'Mike Davis',
        siteId: site.id,
        department: 'Sales',
        jobTitle: 'Sales Representative',
        manager: 'Carol Brown',
        status: 'ACTIVE',
        startDate: new Date('2023-06-01'),
        lastReviewed: new Date('2023-12-20'),
      },
    }),
    prisma.user.upsert({
      where: { email: 'emma.wilson@anlinwindows.com' },
      update: {},
      create: {
        email: 'emma.wilson@anlinwindows.com',
        employeeId: 'EMP004',
        name: 'Emma Wilson',
        siteId: site.id,
        department: 'Engineering',
        jobTitle: 'Frontend Developer',
        manager: 'Alice Johnson',
        status: 'ACTIVE',
        startDate: new Date('2024-01-08'),
        lastReviewed: new Date('2024-01-08'),
      },
    }),
    prisma.user.upsert({
      where: { email: 'alex.chen@anlinwindows.com' },
      update: {},
      create: {
        email: 'alex.chen@anlinwindows.com',
        employeeId: 'EMP005',
        name: 'Alex Chen',
        siteId: site.id,
        department: 'IT',
        jobTitle: 'System Administrator',
        manager: 'David Lee',
        status: 'ACTIVE',
        startDate: new Date('2023-03-15'),
        lastReviewed: new Date('2024-01-12'),
      },
    }),
  ]);

  console.log('✅ Users created:', users.length);

  // Create assets
  const assets = await Promise.all([
    prisma.asset.create({
      data: {
        assetTag: 'LP-2024-001',
        name: 'Dell Latitude 5520',
        type: 'LAPTOP',
        status: 'ASSIGNED',
        siteId: site.id,
        userId: users[0].id,
        serialNumber: 'DL5520001',
        manufacturer: 'Dell',
        model: 'Latitude 5520',
        assignedDate: new Date('2024-01-15'),
        warrantyExpiry: new Date('2025-12-31'),
        location: 'Clovis Office',
        purchaseDate: new Date('2024-01-01'),
        purchasePrice: 1200.00,
        vendor: 'Dell Technologies',
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: 'MN-2024-015',
        name: 'Dell UltraSharp 27"',
        type: 'MONITOR',
        status: 'AVAILABLE',
        siteId: site.id,
        serialNumber: 'DU27015',
        manufacturer: 'Dell',
        model: 'UltraSharp U2723QE',
        warrantyExpiry: new Date('2026-06-15'),
        location: 'IT Storage',
        purchaseDate: new Date('2024-02-01'),
        purchasePrice: 350.00,
        vendor: 'Dell Technologies',
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: 'PH-2024-032',
        name: 'iPhone 15 Pro',
        type: 'PHONE',
        status: 'ASSIGNED',
        siteId: site.id,
        userId: users[1].id,
        serialNumber: 'IP15032',
        manufacturer: 'Apple',
        model: 'iPhone 15 Pro',
        assignedDate: new Date('2024-01-10'),
        warrantyExpiry: new Date('2025-09-20'),
        location: 'Clovis Office',
        purchaseDate: new Date('2024-01-05'),
        purchasePrice: 999.00,
        vendor: 'Apple Inc.',
      },
    }),
  ]);

  console.log('✅ Assets created:', assets.length);

  // Create user licenses
  await Promise.all([
    prisma.userLicense.create({
      data: {
        userId: users[0].id,
        name: 'Visual Studio Professional',
        type: 'Development',
        assignedDate: new Date('2023-01-15'),
        notes: 'For software development',
      },
    }),
    prisma.userLicense.create({
      data: {
        userId: users[1].id,
        name: 'Adobe Creative Suite',
        type: 'Design',
        assignedDate: new Date('2022-08-20'),
        notes: 'For marketing materials',
      },
    }),
  ]);

  // Create user groups
  await Promise.all([
    prisma.userGroup.create({
      data: {
        userId: users[0].id,
        groupName: 'Engineering-All',
        groupType: 'Department',
        system: 'Active Directory',
        addedDate: new Date('2023-01-15'),
        critical: true,
      },
    }),
    prisma.userGroup.create({
      data: {
        userId: users[1].id,
        groupName: 'Marketing-All',
        groupType: 'Department',
        system: 'Active Directory',
        addedDate: new Date('2022-08-20'),
        critical: true,
      },
    }),
  ]);

  // Create access anomalies
  await Promise.all([
    prisma.accessAnomaly.create({
      data: {
        userId: users[0].id,
        type: 'MISSING_STANDARD_ITEM',
        description: 'Missing standard laptop configuration',
        suggestion: 'Assign standard Dell Latitude with required specifications',
        severity: 'HIGH',
        status: 'OPEN',
      },
    }),
    prisma.accessAnomaly.create({
      data: {
        userId: users[1].id,
        type: 'EXCESSIVE_ACCESS',
        description: 'Has admin access to multiple systems',
        suggestion: 'Review and remove unnecessary admin privileges',
        severity: 'MEDIUM',
        status: 'OPEN',
      },
    }),
  ]);

  // Create department baselines
  await prisma.departmentBaseline.create({
    data: {
      department: 'Engineering',
      siteId: site.id,
      standardAssets: JSON.stringify([
        { type: 'LAPTOP', specs: 'Dell Latitude 5520 or equivalent' },
        { type: 'MONITOR', specs: 'Dell UltraSharp 27" 4K' },
        { type: 'KEYBOARD', specs: 'Mechanical keyboard preferred' },
        { type: 'MOUSE', specs: 'Wireless mouse' },
      ]),
      requiredGroups: JSON.stringify([
        'Engineering-All',
        'VPN-Access',
        'Git-Access',
        'Development-Tools',
      ]),
      commonLicenses: JSON.stringify([
        'Visual Studio Professional',
        'JetBrains IntelliJ',
        'Adobe Creative (limited)',
      ]),
    },
  });

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 