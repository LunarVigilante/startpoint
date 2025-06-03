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
      const assetCompliance = dept.totalAssets > 0 ? (dept.totalAssets / Math.max(dept.userCount, 1)) * 100 : 0;
      const userActivity = dept.userCount > 0 ? (dept.activeUsers / dept.userCount) * 100 : 0;
      const anomalyPenalty = Math.min(dept.anomalies * 5, 30); // Max 30% penalty
      
      const healthScore = Math.max(0, Math.min(100, 
        (assetCompliance * 0.4 + userActivity * 0.4 + (100 - anomalyPenalty) * 0.2)
      ));

      return {
        ...dept,
        healthScore: Math.round(healthScore),
        userCount: Number(dept.userCount),
        activeUsers: Number(dept.activeUsers),
        totalAssets: Number(dept.totalAssets),
        totalTasks: Number(dept.totalTasks),
        todoTasks: Number(dept.todoTasks),
        anomalies: Number(dept.anomalies),
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