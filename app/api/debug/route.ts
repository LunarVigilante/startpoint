import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const connectionTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Connection test result:', connectionTest);
    
    // Check what tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Available tables:', tables);
    
    // Try to count each table if it exists
    const tableCounts: any = {};
    
    try {
      tableCounts.sites = await prisma.site.count();
    } catch (e: any) {
      tableCounts.sites = `Error: ${e.message}`;
    }
    
    try {
      tableCounts.users = await prisma.user.count();
    } catch (e: any) {
      tableCounts.users = `Error: ${e.message}`;
    }
    
    try {
      tableCounts.tasks = await prisma.task.count();
    } catch (e: any) {
      tableCounts.tasks = `Error: ${e.message}`;
    }
    
    try {
      tableCounts.assets = await prisma.asset.count();
    } catch (e: any) {
      tableCounts.assets = `Error: ${e.message}`;
    }

    return NextResponse.json({
      status: 'success',
      connection: 'working',
      availableTables: tables,
      tableCounts,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'SET (Neon)' : 'NOT SET',
        vercel: process.env.VERCEL ? 'true' : 'false',
      }
    });
    
  } catch (error: any) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'SET (Neon)' : 'NOT SET',
        vercel: process.env.VERCEL ? 'true' : 'false',
      }
    }, { status: 500 });
  }
} 