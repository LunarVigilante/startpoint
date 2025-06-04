import { NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';

export async function GET() {
  try {
    const anomalies = await withRetry(() => prisma.accessAnomaly.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }));

    return NextResponse.json(anomalies);
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anomalies' },
      { status: 500 }
    );
  }
} 