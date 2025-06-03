import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
        assignee: {
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
    });

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
      assignedTo, // This will be an email if provided
      siteId, // This will be a site code
      department,
      userId, // This will be an email if provided
      assetId,
      dueDate,
    } = body;

    // Look up the actual IDs from the provided identifiers
    const creatorUser = await prisma.user.findUnique({
      where: { email: createdBy },
    });
    
    if (!creatorUser) {
      return NextResponse.json(
        { error: 'Creator user not found' },
        { status: 400 }
      );
    }

    const site = await prisma.site.findUnique({
      where: { code: siteId },
    });
    
    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 400 }
      );
    }

    // Look up assignee if provided
    let assigneeUserId = null;
    if (assignedTo) {
      const assigneeUser = await prisma.user.findUnique({
        where: { email: assignedTo },
      });
      if (assigneeUser) {
        assigneeUserId = assigneeUser.id;
      }
    }

    // Look up related user if provided
    let relatedUserId = null;
    if (userId) {
      const relatedUser = await prisma.user.findUnique({
        where: { email: userId },
      });
      if (relatedUser) {
        relatedUserId = relatedUser.id;
      }
    }

    // Generate task number
    const taskCount = await prisma.task.count();
    const taskNumber = `TSK-${String(taskCount + 1).padStart(6, '0')}`;

    const task = await prisma.task.create({
      data: {
        taskNumber,
        title,
        description,
        category,
        priority,
        createdBy: creatorUser.id,
        assignedTo: assigneeUserId,
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
        assignee: {
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
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
} 