import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function executeWithRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error?.code === 'P2010' && error?.meta?.code === '42P05' && i < retries - 1) {
        // Prepared statement already exists error - wait and retry
        await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

export async function GET() {
  try {
    // Get total assets count
    const totalAssets = await executeWithRetry(() => prisma.asset.count());
    
    // Get active users count
    const activeUsers = await executeWithRetry(() => prisma.user.count({
      where: {
        status: 'ACTIVE',
      },
    }));
    
    // Get open anomalies count
    const openAnomalies = await executeWithRetry(() => prisma.accessAnomaly.count({
      where: {
        status: 'OPEN',
      },
    }));
    
    // Get asset status breakdown
    const assetsByStatus = await executeWithRetry(() => prisma.asset.groupBy({
      by: ['status'],
      _count: true,
    }));
    
    // Get users by department
    const usersByDepartment = await executeWithRetry(() => prisma.user.groupBy({
      by: ['department'],
      where: {
        status: 'ACTIVE',
      },
      _count: true,
    }));
    
    // Get recent assets (last 10)
    const recentAssets = await executeWithRetry(() => prisma.asset.findMany({
      take: 10,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            department: true,
          },
        },
      },
    }));
    
    // Get recent anomalies (last 5)
    const recentAnomalies = await executeWithRetry(() => prisma.accessAnomaly.findMany({
      take: 5,
      where: {
        status: 'OPEN',
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            department: true,
          },
        },
      },
    }));
    
    // Calculate department health scores
    const departmentStats = await Promise.all(
      usersByDepartment.map(async (dept: any) => {
        const totalDeptUsers = dept._count;
        const deptAnomalies = await executeWithRetry(() => prisma.accessAnomaly.count({
          where: {
            status: 'OPEN',
            user: {
              department: dept.department,
            },
          },
        }));
        
        const deptAssets = await executeWithRetry(() => prisma.asset.count({
          where: {
            user: {
              department: dept.department,
            },
          },
        }));
        
        // Simple health score calculation (can be enhanced)
        const healthScore = Math.max(0, 100 - (deptAnomalies * 10));
        
        return {
          department: dept.department,
          userCount: totalDeptUsers,
          assetCount: deptAssets,
          anomaliesCount: deptAnomalies,
          healthScore,
        };
      })
    );

    const stats = {
      overview: {
        totalAssets,
        activeUsers,
        openAnomalies,
        avgDepartmentHealth: Math.round(
          departmentStats.reduce((sum, dept) => sum + dept.healthScore, 0) / 
          departmentStats.length
        ),
      },
      assetsByStatus: assetsByStatus.reduce((acc: any, item: any) => {
        acc[item.status.toLowerCase()] = item._count;
        return acc;
      }, {} as Record<string, number>),
      departmentStats,
      recentActivity: recentAssets.slice(0, 5).map((asset: any) => ({
        id: asset.id,
        type: 'asset_update',
        description: `${asset.name} (${asset.assetTag})`,
        user: asset.user?.name || 'Unassigned',
        department: asset.user?.department || '',
        timestamp: asset.updatedAt,
        status: asset.status,
      })),
      recentAnomalies: recentAnomalies.map((anomaly: any) => ({
        id: anomaly.id,
        type: anomaly.type,
        description: anomaly.description,
        user: anomaly.user.name,
        department: anomaly.user.department,
        severity: anomaly.severity,
        timestamp: anomaly.createdAt,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 