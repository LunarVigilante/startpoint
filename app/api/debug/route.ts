import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Test basic connection
    console.log('Testing database connection...');
    
    // Check if we can connect at all
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
    } catch (e) {
      tableCounts.sites = `Error: ${e}`;
    }
    
    try {
      tableCounts.users = await prisma.user.count();
    } catch (e) {
      tableCounts.users = `Error: ${e}`;
    }
    
    try {
      tableCounts.tasks = await prisma.task.count();
    } catch (e) {
      tableCounts.tasks = `Error: ${e}`;
    }
    
    try {
      tableCounts.assets = await prisma.asset.count();
    } catch (e) {
      tableCounts.assets = `Error: ${e}`;
    }

    return NextResponse.json({
      status: 'success',
      connection: 'working',
      availableTables: tables,
      tableCounts,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      }
    });
    
  } catch (error: any) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message,
      code: error.code,
      stack: error.stack,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      }
    }, { status: 500 });
  }
} 