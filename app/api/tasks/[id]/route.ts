import { NextRequest, NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await withRetry(() => prisma.task.findUnique({
      where: { id },
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

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, priority, description, dueDate, serviceNowTicket } = body;

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
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }
    if (serviceNowTicket !== undefined) {
      updateData.serviceNowTicket = serviceNowTicket || null;
    }

    // Set completion date if status is being set to RESOLVED or CLOSED
    if (status === 'RESOLVED' || status === 'CLOSED') {
      updateData.completedAt = new Date();
    } else if (status === 'OPEN' || status === 'IN_PROGRESS' || status === 'WAITING') {
      // Clear completion date if reopening task
      updateData.completedAt = null;
    }

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    await withRetry(() => prisma.task.delete({
      where: { id },
    }));

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
} 