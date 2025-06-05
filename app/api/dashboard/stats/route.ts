import { NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';

export async function GET() {
  try {
    // Get total assets count
    const totalAssets = await withRetry(() => prisma.asset.count());
    
    // Get active users count
    const activeUsers = await withRetry(() => prisma.user.count({
      where: {
        status: 'ACTIVE',
      },
    }));
    
    // Get open anomalies count
    const openAnomalies = await withRetry(() => prisma.accessAnomaly.count({
      where: {
        status: 'OPEN',
      },
    }));
    
    // Get asset status breakdown
    const assetsByStatus = await withRetry(() => prisma.asset.groupBy({
      by: ['status'],
      _count: true,
    }));
    
    // Get asset type breakdown for categorized stats
    const assetsByType = await withRetry(() => prisma.asset.groupBy({
      by: ['type'],
      _count: true,
    }));
    
    // Calculate categorized asset counts
    const assetCategories = {
      computers: {
        total: 0,
        laptops: 0,
        desktops: 0,
      },
      mobileDevices: {
        total: 0,
        tablets: 0,
        phones: 0,
      },
      printers: 0,
      miscellaneous: 0,
      consumables: 0, // This might need to be tracked separately or with a category field
    };

    assetsByType.forEach((item: any) => {
      const count = item._count;
      switch (item.type) {
        case 'LAPTOP':
          assetCategories.computers.laptops = count;
          assetCategories.computers.total += count;
          break;
        case 'DESKTOP':
          assetCategories.computers.desktops = count;
          assetCategories.computers.total += count;
          break;
        case 'TABLET':
          assetCategories.mobileDevices.tablets = count;
          assetCategories.mobileDevices.total += count;
          break;
        case 'PHONE':
          assetCategories.mobileDevices.phones = count;
          assetCategories.mobileDevices.total += count;
          break;
        case 'PRINTER':
          assetCategories.printers = count;
          break;
        case 'CONSUMABLE':
          assetCategories.consumables = count;
          break;
        case 'MONITOR':
        case 'NETWORK_EQUIPMENT':
        case 'OTHER_HARDWARE':
          assetCategories.miscellaneous += count;
          break;
      }
    });
    
    // Get users by department
    const usersByDepartment = await withRetry(() => prisma.user.groupBy({
      by: ['department'],
      where: {
        status: 'ACTIVE',
      },
      _count: true,
    }));
    
    // Get recent assets (last 10)
    const recentAssets = await withRetry(() => prisma.asset.findMany({
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
    const recentAnomalies = await withRetry(() => prisma.accessAnomaly.findMany({
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
        const deptAnomalies = await withRetry(() => prisma.accessAnomaly.count({
          where: {
            status: 'OPEN',
            user: {
              department: dept.department,
            },
          },
        }));
        
        const deptAssets = await withRetry(() => prisma.asset.count({
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
          departmentStats.reduce((sum: number, dept) => sum + dept.healthScore, 0) / 
          departmentStats.length
        ),
      },
      assetsByStatus: assetsByStatus.reduce((acc: any, item: any) => {
        acc[item.status.toLowerCase()] = item._count;
        return acc;
      }, {} as Record<string, number>),
      assetCategories,
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