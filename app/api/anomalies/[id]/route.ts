import { NextRequest, NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, resolvedBy, resolution } = body;

    const updatedAnomaly = await withRetry(() => prisma.accessAnomaly.update({
      where: { id },
      data: {
        status,
        resolvedBy,
        resolution,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
      },
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
    }));

    return NextResponse.json(updatedAnomaly);
  } catch (error) {
    console.error('Error updating anomaly:', error);
    return NextResponse.json(
      { error: 'Failed to update anomaly' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await withRetry(() => prisma.accessAnomaly.delete({
      where: { id },
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting anomaly:', error);
    return NextResponse.json(
      { error: 'Failed to delete anomaly' },
      { status: 500 }
    );
  }
} 