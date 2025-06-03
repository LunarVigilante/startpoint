import { NextRequest, NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';

// Standard offboarding checklist template
const standardChecklistTemplate = [
  {
    id: 'collect-badge',
    title: 'Collect Employee Badge/Access Card',
    description: 'Retrieve company ID badge and access cards',
    category: 'security',
    required: true,
    estimatedMinutes: 5,
  },
  {
    id: 'collect-keys',
    title: 'Collect Physical Keys',
    description: 'Retrieve office keys, cabinet keys, and other physical access items',
    category: 'security',
    required: true,
    estimatedMinutes: 5,
  },
  {
    id: 'disable-accounts',
    title: 'Disable User Accounts',
    description: 'Disable Active Directory, email, and all system accounts',
    category: 'access',
    required: true,
    estimatedMinutes: 15,
  },
  {
    id: 'backup-data',
    title: 'Backup Personal Data',
    description: 'Backup any personal files or work data as needed',
    category: 'data',
    required: false,
    estimatedMinutes: 30,
  },
  {
    id: 'remove-group-access',
    title: 'Remove Group Memberships',
    description: 'Remove from security groups, distribution lists, and shared folders',
    category: 'access',
    required: true,
    estimatedMinutes: 20,
  },
  {
    id: 'forward-email',
    title: 'Setup Email Forwarding',
    description: 'Configure email forwarding to manager or replacement',
    category: 'communication',
    required: false,
    estimatedMinutes: 10,
  },
  {
    id: 'collect-company-property',
    title: 'Collect Company Property',
    description: 'Retrieve laptop, phone, headset, and other company equipment',
    category: 'assets',
    required: true,
    estimatedMinutes: 15,
  },
  {
    id: 'update-documentation',
    title: 'Update Documentation',
    description: 'Update organization charts, contact lists, and access documentation',
    category: 'documentation',
    required: true,
    estimatedMinutes: 10,
  },
  {
    id: 'final-security-scan',
    title: 'Security Scan',
    description: 'Run final security scan to ensure all access has been removed',
    category: 'security',
    required: true,
    estimatedMinutes: 5,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offboardingId = searchParams.get('offboardingId');
    const template = searchParams.get('template') === 'true';

    if (template) {
      // Return the standard template
      return NextResponse.json({
        template: standardChecklistTemplate,
        totalItems: standardChecklistTemplate.length,
        requiredItems: standardChecklistTemplate.filter(item => item.required).length,
        estimatedMinutes: standardChecklistTemplate.reduce((total, item) => total + item.estimatedMinutes, 0),
      });
    }

    if (!offboardingId) {
      return NextResponse.json(
        { error: 'Offboarding ID is required' },
        { status: 400 }
      );
    }

    // Get existing checklist from task comments
    const offboardingTask = await withRetry(() => prisma.task.findUnique({
      where: { id: offboardingId },
      include: {
        comments: {
          where: {
            content: {
              startsWith: 'CHECKLIST_ITEM:'
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        user: {
          select: {
            name: true,
            department: true,
          }
        }
      }
    }));

    if (!offboardingTask) {
      return NextResponse.json(
        { error: 'Offboarding case not found' },
        { status: 404 }
      );
    }

    // Parse checklist items from comments
    const checklistItems = offboardingTask.comments.map(comment => {
      const content = comment.content.replace('CHECKLIST_ITEM:', '');
      try {
        return {
          ...JSON.parse(content),
          commentId: comment.id,
          completedAt: comment.createdAt,
        };
      } catch {
        return null;
      }
    }).filter(item => item !== null);

    // Merge template with completed items
    const checklist = standardChecklistTemplate.map(templateItem => {
      const completedItem = checklistItems.find(item => item.id === templateItem.id);
      return {
        ...templateItem,
        completed: !!completedItem,
        completedAt: completedItem?.completedAt || null,
        notes: completedItem?.notes || '',
      };
    });

    const completedCount = checklist.filter(item => item.completed).length;
    const progress = Math.round((completedCount / checklist.length) * 100);

    return NextResponse.json({
      offboardingId,
      user: offboardingTask.user,
      checklist,
      stats: {
        total: checklist.length,
        completed: completedCount,
        remaining: checklist.length - completedCount,
        progress,
        requiredCompleted: checklist.filter(item => item.required && item.completed).length,
        requiredTotal: checklist.filter(item => item.required).length,
      }
    });
  } catch (error) {
    console.error('Error fetching offboarding checklist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checklist' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offboardingId, itemId, completed, notes, userId } = body;

    if (!offboardingId || !itemId || !userId) {
      return NextResponse.json(
        { error: 'Offboarding ID, item ID, and user ID are required' },
        { status: 400 }
      );
    }

    const templateItem = standardChecklistTemplate.find(item => item.id === itemId);
    if (!templateItem) {
      return NextResponse.json(
        { error: 'Invalid checklist item' },
        { status: 400 }
      );
    }

    if (completed) {
      // Create a comment to mark the item as completed
      const checklistData = {
        id: itemId,
        title: templateItem.title,
        completed: true,
        completedBy: userId,
        notes: notes || '',
      };

      await withRetry(() => prisma.taskComment.create({
        data: {
          taskId: offboardingId,
          userId,
          content: `CHECKLIST_ITEM:${JSON.stringify(checklistData)}`,
          isInternal: true,
        }
      }));
    } else {
      // Remove the completion comment
      await withRetry(() => prisma.taskComment.deleteMany({
        where: {
          taskId: offboardingId,
          content: {
            contains: `"id":"${itemId}"`
          }
        }
      }));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating checklist item:', error);
    return NextResponse.json(
      { error: 'Failed to update checklist item' },
      { status: 500 }
    );
  }
} 