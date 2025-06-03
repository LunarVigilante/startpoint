import { NextRequest, NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const siteId = searchParams.get('siteId');

    // Get offboarding cases with related data
    const offboardingCases = await withRetry(() => prisma.task.findMany({
      where: {
        category: 'USER_OFFBOARDING',
        ...(status && { status: status as any }),
        ...(siteId && { siteId })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            department: true,
            manager: true,
            status: true,
          }
        },
        asset: {
          select: {
            name: true,
            assetTag: true,
            status: true,
          }
        },
        creator: {
          select: {
            name: true,
            email: true,
          }
        },
        assignee: {
          select: {
            name: true,
            email: true,
          }
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }));

    // Transform data to include offboarding-specific info
    const transformedCases = await Promise.all(offboardingCases.map(async (case_) => {
      let userAssets: any[] = [];
      let userAccess: any[] = [];
      let totalTasks = 5; // Base tasks
      let completedAssets = 0;
      let progress = 0;

      if (case_.user) {
        try {
          // Get user's assets that need to be returned
          userAssets = await withRetry(() => prisma.asset.findMany({
            where: {
              userId: case_.user!.id,
              status: { not: 'RETIRED' }
            },
            select: {
              id: true,
              name: true,
              assetTag: true,
              status: true,
            }
          }));

          // Get user's access that needs to be removed
          userAccess = await withRetry(() => prisma.userGroup.findMany({
            where: {
              userId: case_.user!.id,
            },
            select: {
              id: true,
              groupName: true,
              groupType: true,
              system: true,
              critical: true,
            }
          }));

          // Calculate progress based on completed vs total tasks
          totalTasks = userAssets.length + userAccess.length + 5; // +5 for standard offboarding tasks
          completedAssets = userAssets.filter(a => a.status === 'AVAILABLE').length;
          progress = totalTasks > 0 ? Math.round(((completedAssets + case_.comments.length) / totalTasks) * 100) : 0;
        } catch (error) {
          console.error('Error fetching user assets/access:', error);
          // Continue with empty arrays if there's an error
        }
      }

      return {
        ...case_,
        assets: userAssets || [],
        accessItems: userAccess.map(access => ({
          id: access.id,
          system: access.system || access.groupType || 'System',
          access: access.groupName,
          status: 'PENDING', // This would be determined by actual removal status
        })) || [],
        progress,
        completedTasks: completedAssets + (case_.comments?.length || 0),
        totalTasks,
      };
    }));

    return NextResponse.json(transformedCases);
  } catch (error) {
    console.error('Error fetching offboarding cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offboarding cases' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      createdBy, 
      siteId, 
      lastWorkingDay, 
      notes, 
      priority = 'MEDIUM' 
    } = body;

    if (!userId || !createdBy || !siteId) {
      return NextResponse.json(
        { error: 'User ID, creator ID, and site ID are required' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await withRetry(() => prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        employeeId: true,
        department: true,
      }
    }));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate task number
    const taskNumber = `OFF-${Date.now()}`;

    // Create offboarding task
    const offboardingCase = await withRetry(() => prisma.task.create({
      data: {
        taskNumber,
        title: `Offboarding: ${user.name}`,
        description: `Employee offboarding for ${user.name} (${user.employeeId}) from ${user.department} department.${notes ? ` Notes: ${notes}` : ''}`,
        category: 'USER_OFFBOARDING',
        priority: priority as any,
        status: 'TODO',
        createdBy,
        siteId,
        userId,
        dueDate: lastWorkingDay ? new Date(lastWorkingDay) : undefined,
        notes,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            employeeId: true,
            department: true,
            manager: true,
          }
        },
        creator: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    }));

    // Create initial checklist comment
    await withRetry(() => prisma.taskComment.create({
      data: {
        taskId: offboardingCase.id,
        userId: createdBy,
        content: 'Offboarding case created. Please follow the standard offboarding checklist.',
        isInternal: true,
      }
    }));

    return NextResponse.json(offboardingCase);
  } catch (error: any) {
    console.error('Error creating offboarding case:', error);
    return NextResponse.json(
      { error: 'Failed to create offboarding case' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes, assignedTo, progress } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    // Set completion date if status is being set to COMPLETED
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const offboardingCase = await withRetry(() => prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            employeeId: true,
            department: true,
            manager: true,
          }
        },
        assignee: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    }));

    return NextResponse.json(offboardingCase);
  } catch (error: any) {
    console.error('Error updating offboarding case:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Offboarding case not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update offboarding case' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      );
    }

    await withRetry(() => prisma.task.delete({
      where: { id }
    }));

    return NextResponse.json({ message: 'Offboarding case deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting offboarding case:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Offboarding case not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete offboarding case' },
      { status: 500 }
    );
  }
} 