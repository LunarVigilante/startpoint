import { NextRequest, NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await withRetry(() => prisma.user.findMany({
      include: {
        site: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      employeeId,
      name,
      siteCode,
      department,
      jobTitle,
      manager,
      status = 'ACTIVE',
      startDate,
    } = body;

    // Validate required fields
    if (!email || !name || !siteCode || !department) {
      return NextResponse.json(
        { error: 'Email, name, site, and department are required' },
        { status: 400 }
      );
    }

    // Look up site ID from site code
    const site = await withRetry(() => prisma.site.findUnique({
      where: { code: siteCode },
    }));
    
    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await withRetry(() => prisma.user.findUnique({
      where: { email },
    }));
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Check if employee ID already exists (if provided)
    if (employeeId) {
      const existingEmployeeId = await withRetry(() => prisma.user.findUnique({
        where: { employeeId },
      }));
      
      if (existingEmployeeId) {
        return NextResponse.json(
          { error: 'User with this employee ID already exists' },
          { status: 400 }
        );
      }
    }

    const user = await withRetry(() => prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        employeeId: employeeId || null,
        name: name.trim(),
        siteId: site.id,
        department: department.trim(),
        jobTitle: jobTitle || null,
        manager: manager || null,
        status,
        startDate: startDate ? new Date(startDate) : null,
      },
      include: {
        site: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    }));

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target?.includes('email')) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }
      if (target?.includes('employeeId')) {
        return NextResponse.json(
          { error: 'User with this employee ID already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'User with these details already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, department, jobTitle, manager, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await withRetry(() => prisma.user.findUnique({
      where: { id },
    }));
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (department !== undefined) updateData.department = department.trim();
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle || null;
    if (manager !== undefined) updateData.manager = manager || null;
    if (status !== undefined) updateData.status = status;

    // Update lastReviewed when status changes
    if (status !== undefined && status !== existingUser.status) {
      updateData.lastReviewed = new Date();
    }

    const user = await withRetry(() => prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        site: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    }));

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error updating user:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update user' },
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
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user has associated assets, tasks, or other data
    const [assetCount, createdTaskCount, relatedTaskCount] = await Promise.all([
      withRetry(() => prisma.asset.count({ where: { userId: id } })),
      withRetry(() => prisma.task.count({ where: { createdBy: id } })),
      withRetry(() => prisma.task.count({ where: { userId: id } })),
    ]);

    if (assetCount > 0 || createdTaskCount > 0 || relatedTaskCount > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete user. They have ${assetCount} assets, ${createdTaskCount} created tasks, and ${relatedTaskCount} related tasks.`,
          details: { assetCount, createdTaskCount, relatedTaskCount }
        },
        { status: 400 }
      );
    }

    await withRetry(() => prisma.user.delete({
      where: { id },
    }));

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 