import { NextRequest, NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    // Get departments with their users, assets, and baselines
    let departments;
    if (siteId) {
      departments = await withRetry(() => {
        return prisma.$queryRaw`
          SELECT 
            d.department,
            d."siteId",
            COUNT(DISTINCT u.id) as "userCount",
            COUNT(DISTINCT CASE WHEN u.status = 'ACTIVE' THEN u.id END) as "activeUsers",
            COUNT(DISTINCT a.id) as "totalAssets",
            COUNT(DISTINCT t.id) as "totalTasks",
            COUNT(DISTINCT CASE WHEN t.status = 'TODO' THEN t.id END) as "todoTasks",
            COUNT(DISTINCT aa.id) as "anomalies",
            MAX(u."lastReviewed") as "lastReviewed",
            db."standardAssets",
            db."requiredGroups",
            db."requiredLists", 
            db."commonLicenses"
          FROM (
            SELECT DISTINCT department, "siteId" 
            FROM users 
            WHERE "siteId" = ${siteId}
          ) d
          LEFT JOIN users u ON u.department = d.department AND u."siteId" = d."siteId"
          LEFT JOIN assets a ON a."userId" = u.id
          LEFT JOIN tasks t ON t."userId" = u.id
          LEFT JOIN access_anomalies aa ON aa."userId" = u.id AND aa.status = 'OPEN'
          LEFT JOIN department_baselines db ON db.department = d.department AND db."siteId" = d."siteId"
          GROUP BY d.department, d."siteId", db."standardAssets", db."requiredGroups", db."requiredLists", db."commonLicenses"
          ORDER BY d.department
        `;
      }) as any[];
    } else {
      departments = await withRetry(() => {
        return prisma.$queryRaw`
          SELECT 
            d.department,
            d."siteId",
            COUNT(DISTINCT u.id) as "userCount",
            COUNT(DISTINCT CASE WHEN u.status = 'ACTIVE' THEN u.id END) as "activeUsers",
            COUNT(DISTINCT a.id) as "totalAssets",
            COUNT(DISTINCT t.id) as "totalTasks",
            COUNT(DISTINCT CASE WHEN t.status = 'TODO' THEN t.id END) as "todoTasks",
            COUNT(DISTINCT aa.id) as "anomalies",
            MAX(u."lastReviewed") as "lastReviewed",
            db."standardAssets",
            db."requiredGroups",
            db."requiredLists",
            db."commonLicenses"
          FROM (
            SELECT DISTINCT department, "siteId" 
            FROM users 
          ) d
          LEFT JOIN users u ON u.department = d.department AND u."siteId" = d."siteId"
          LEFT JOIN assets a ON a."userId" = u.id
          LEFT JOIN tasks t ON t."userId" = u.id
          LEFT JOIN access_anomalies aa ON aa."userId" = u.id AND aa.status = 'OPEN'
          LEFT JOIN department_baselines db ON db.department = d.department AND db."siteId" = d."siteId"
          GROUP BY d.department, d."siteId", db."standardAssets", db."requiredGroups", db."requiredLists", db."commonLicenses"
          ORDER BY d.department
        `;
      }) as any[];
    }

    // Calculate health scores
    const departmentsWithHealth = departments.map((dept: any) => {
      // Convert BigInt values to numbers for calculations
      const userCount = Number(dept.userCount);
      const activeUsers = Number(dept.activeUsers);
      const totalAssets = Number(dept.totalAssets);
      const totalTasks = Number(dept.totalTasks);
      const todoTasks = Number(dept.todoTasks);
      const anomalies = Number(dept.anomalies);
      
      // Better asset compliance calculation - accounts for asset allocation
      const assetRatio = userCount > 0 ? totalAssets / userCount : 0;
      const assetCompliance = Math.min(100, assetRatio * 50 + 50); // 1:1 ratio = 100%, 0.5:1 = 75%, etc.
      
      const userActivity = userCount > 0 ? (activeUsers / userCount) * 100 : 100; // Default to 100% if no users
      const taskCompletion = totalTasks > 0 ? ((totalTasks - todoTasks) / totalTasks) * 100 : 100;
      const anomalyPenalty = Math.min(anomalies * 10, 50); // Max 50% penalty
      
      // Weighted calculation: 30% user activity, 25% asset compliance, 25% task completion, 20% anomaly-free
      const healthScore = Math.max(0, Math.min(100, 
        (userActivity * 0.3 + assetCompliance * 0.25 + taskCompletion * 0.25 + (100 - anomalyPenalty) * 0.2)
      ));

      return {
        ...dept,
        healthScore: Math.round(healthScore),
        userCount,
        activeUsers,
        totalAssets,
        totalTasks,
        todoTasks,
        anomalies,
      };
    });

    return NextResponse.json(departmentsWithHealth);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { department, siteId, standardAssets, requiredGroups, requiredLists, commonLicenses } = body;

    if (!department || !siteId) {
      return NextResponse.json(
        { error: 'Department and site ID are required' },
        { status: 400 }
      );
    }

    const baseline = await withRetry(() => prisma.departmentBaseline.upsert({
      where: {
        department_siteId: {
          department,
          siteId
        }
      },
      update: {
        standardAssets: standardAssets || [],
        requiredGroups: requiredGroups || [],
        requiredLists: requiredLists || [],
        commonLicenses: commonLicenses || [],
      },
      create: {
        department,
        siteId,
        standardAssets: standardAssets || [],
        requiredGroups: requiredGroups || [],
        requiredLists: requiredLists || [],
        commonLicenses: commonLicenses || [],
      }
    }));

    return NextResponse.json(baseline);
  } catch (error: any) {
    console.error('Error creating/updating department baseline:', error);
    return NextResponse.json(
      { error: 'Failed to create/update department baseline' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { department, siteId, standardAssets, requiredGroups, requiredLists, commonLicenses } = body;

    const baseline = await withRetry(() => prisma.departmentBaseline.update({
      where: {
        department_siteId: {
          department,
          siteId
        }
      },
      data: {
        standardAssets: standardAssets || [],
        requiredGroups: requiredGroups || [],
        requiredLists: requiredLists || [],
        commonLicenses: commonLicenses || [],
      }
    }));

    return NextResponse.json(baseline);
  } catch (error: any) {
    console.error('Error updating department baseline:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Department baseline not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update department baseline' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const siteId = searchParams.get('siteId');

    if (!department || !siteId) {
      return NextResponse.json(
        { error: 'Department and site ID are required' },
        { status: 400 }
      );
    }

    await withRetry(() => prisma.departmentBaseline.delete({
      where: {
        department_siteId: {
          department,
          siteId
        }
      }
    }));

    return NextResponse.json({ message: 'Department baseline deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting department baseline:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Department baseline not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete department baseline' },
      { status: 500 }
    );
  }
} 