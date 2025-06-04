import { NextRequest, NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Fetch comprehensive user details
    const user = await withRetry(() => prisma.user.findUnique({
      where: { id },
      include: {
        site: {
          select: {
            name: true,
            code: true,
          },
        },
        assets: {
          select: {
            id: true,
            name: true,
            assetTag: true,
            type: true,
            status: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    }));

    // Fetch tasks separately since they're not directly linked to users in the current schema
    const tasks = await withRetry(() => prisma.task.findMany({
      where: { 
        OR: [
          { userId: id },
          { creator: { id } }
        ]
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to recent tasks
    }));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Mock data for groups and licenses (would come from your actual systems)
    const mockGroups = [
      {
        id: '1',
        name: 'All Employees',
        type: 'Security Group',
        description: 'Basic access for all company employees',
      },
      {
        id: '2',
        name: `${user.department} Team`,
        type: 'Department Group',
        description: `Access group for ${user.department} department`,
      },
      {
        id: '3',
        name: 'Office 365 Users',
        type: 'Distribution List',
        description: 'Microsoft Office 365 licensed users',
      },
    ];

    const mockLicenses = [
      {
        id: '1',
        name: 'Microsoft Office 365',
        type: 'E3 License',
        status: 'ACTIVE',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      },
      {
        id: '2',
        name: 'Adobe Creative Suite',
        type: 'Professional License',
        status: 'ACTIVE',
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months from now
      },
      {
        id: '3',
        name: 'Windows 11 Pro',
        type: 'Operating System License',
        status: 'ACTIVE',
      },
    ];

    // Format the response
    const userDetails = {
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      title: user.jobTitle,
      employeeId: user.employeeId,
      phone: null, // Not available in current schema
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      site: user.site,
      assets: user.assets,
      tasks: tasks.map((task: any) => ({
        ...task,
        createdAt: task.createdAt.toISOString(),
      })),
      groups: mockGroups,
      licenses: mockLicenses,
    };

    return NextResponse.json(userDetails);
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
} 