import { NextRequest, NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';

export async function GET() {
  try {
    const sites = await withRetry(() => prisma.site.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    }));

    return NextResponse.json(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code } = body;

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Site name and code are required' },
        { status: 400 }
      );
    }

    // Check if site code already exists
    const existingSite = await withRetry(() => prisma.site.findUnique({
      where: { code: code.toUpperCase() },
    }));
    
    if (existingSite) {
      return NextResponse.json(
        { error: 'Site code already exists' },
        { status: 400 }
      );
    }

    const site = await withRetry(() => prisma.site.create({
      data: {
        name: name.trim(),
        code: code.toUpperCase().trim(),
      },
    }));

    return NextResponse.json(site, { status: 201 });
  } catch (error: any) {
    console.error('Error creating site:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Site with this code already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, code } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }

    // Check if site exists
    const existingSite = await withRetry(() => prisma.site.findUnique({
      where: { id },
    }));
    
    if (!existingSite) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // If code is being changed, check if new code already exists
    if (code && code.toUpperCase() !== existingSite.code) {
      const codeExists = await withRetry(() => prisma.site.findUnique({
        where: { code: code.toUpperCase() },
      }));
      
      if (codeExists) {
        return NextResponse.json(
          { error: 'Site code already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (code) updateData.code = code.toUpperCase().trim();

    const site = await withRetry(() => prisma.site.update({
      where: { id },
      data: updateData,
    }));

    return NextResponse.json(site);
  } catch (error: any) {
    console.error('Error updating site:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Site code already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update site' },
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
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }

    // Check if site has associated users or assets
    const [userCount, assetCount] = await Promise.all([
      withRetry(() => prisma.user.count({ where: { siteId: id } })),
      withRetry(() => prisma.asset.count({ where: { siteId: id } })),
    ]);

    if (userCount > 0 || assetCount > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete site. It has ${userCount} users and ${assetCount} assets associated with it.`,
          details: { userCount, assetCount }
        },
        { status: 400 }
      );
    }

    await withRetry(() => prisma.site.delete({
      where: { id },
    }));

    return NextResponse.json({ message: 'Site deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting site:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete site' },
      { status: 500 }
    );
  }
} 