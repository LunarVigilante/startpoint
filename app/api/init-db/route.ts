import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    // First ensure the schema is pushed
    console.log('Pushing database schema...');
    await execAsync('npx prisma db push --accept-data-loss');
    
    console.log('Schema pushed successfully. Running seed...');
    // Then run the seed script
    await execAsync('npx tsx lib/seed.ts');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized and seeded successfully' 
    });
  } catch (error: any) {
    console.error('Database initialization failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to initialize the database',
    endpoint: '/api/init-db',
    method: 'POST'
  });
} 