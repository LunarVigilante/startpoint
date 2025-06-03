import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Test database connectivity
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbTime = Date.now() - dbStart;

    // Get basic system stats
    const [
      totalUsers,
      totalAssets,
      totalTasks,
      todoTasks,
      urgentTasks
    ] = await Promise.all([
      prisma.user.count(),
      prisma.asset.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'TODO' } }),
      prisma.task.count({ where: { priority: 'URGENT' } })
    ]);

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      metrics: {
        responseTime: `${responseTime}ms`,
        database: {
          status: 'connected',
          responseTime: `${dbTime}ms`
        },
        system: {
          totalUsers,
          totalAssets,
          totalTasks,
          todoTasks,
          urgentTasks,
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime()
        }
      }
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${Date.now() - startTime}ms`
    }, { status: 503 });
  }
} 