import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const anomalies = searchParams.get('anomalies');
    const search = searchParams.get('search');

    // Build where clause based on filters
    const where: any = {};
    
    if (department && department !== 'all') {
      where.department = {
        equals: department,
        mode: 'insensitive',
      };
    }
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        assets: {
          select: {
            id: true,
            assetTag: true,
            name: true,
            type: true,
            status: true,
          },
        },
        licenses: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        groups: {
          select: {
            id: true,
            groupName: true,
            system: true,
            critical: true,
          },
        },
        distributionLists: {
          select: {
            id: true,
            listName: true,
            listEmail: true,
          },
        },
        anomalies: {
          where: {
            status: 'OPEN',
          },
          select: {
            id: true,
            type: true,
            severity: true,
            description: true,
          },
        },
        site: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Filter by anomalies if requested
    let filteredUsers = users;
    if (anomalies && anomalies !== 'all') {
      if (anomalies === 'with-anomalies') {
        filteredUsers = users.filter((user: any) => user.anomalies.length > 0);
      } else if (anomalies === 'no-anomalies') {
        filteredUsers = users.filter((user: any) => user.anomalies.length === 0);
      }
    }

    return NextResponse.json(filteredUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const user = await prisma.user.create({
      data: {
        ...body,
        siteId: body.siteId, // You'll need to pass the site ID
      },
      include: {
        assets: true,
        licenses: true,
        groups: true,
        distributionLists: true,
        anomalies: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 