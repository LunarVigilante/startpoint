import { NextRequest, NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';

export async function GET() {
  try {
    const tasks = await withRetry(() => prisma.task.findMany({
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        asset: {
          select: {
            name: true,
            assetTag: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }));

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      priority = 'MEDIUM',
      createdBy, // This will be an email
      siteId, // This will be a site code
      department,
      userId, // This will be an email if provided
      assetId,
      dueDate,
      serviceNowTicket,
    } = body;

    // Look up the actual IDs from the provided identifiers
    const creatorUser = await withRetry(() => prisma.user.findUnique({
      where: { email: createdBy },
    }));
    
    if (!creatorUser) {
      return NextResponse.json(
        { error: 'Creator user not found' },
        { status: 400 }
      );
    }

    const site = await withRetry(() => prisma.site.findUnique({
      where: { code: siteId },
    }));
    
    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 400 }
      );
    }

    // Look up related user if provided
    let relatedUserId = null;
    if (userId) {
      const relatedUser = await withRetry(() => prisma.user.findUnique({
        where: { email: userId },
      }));
      if (relatedUser) {
        relatedUserId = relatedUser.id;
      }
    }

    // Generate task number
    const taskCount = await withRetry(() => prisma.task.count());
    const taskNumber = `TSK-${String(taskCount + 1).padStart(6, '0')}`;

    const task = await withRetry(() => prisma.task.create({
      data: {
        taskNumber,
        title,
        description,
        category,
        priority,
        createdBy: creatorUser.id,
        siteId: site.id,
        department,
        userId: relatedUserId,
        assetId,
        dueDate: dueDate ? new Date(dueDate) : null,

      },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        asset: {
          select: {
            name: true,
            assetTag: true,
          },
        },
      },
    }));

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, priority, assignedTo, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Check if task exists
    const existingTask = await withRetry(() => prisma.task.findUnique({
      where: { id },
    }));
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (notes !== undefined) updateData.notes = notes;

    const task = await withRetry(() => prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        asset: {
          select: {
            name: true,
            assetTag: true,
          },
        },
      },
    }));

    return NextResponse.json(task);
  } catch (error: any) {
    console.error('Error updating task:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
} 