import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const location = searchParams.get('location');
    const search = searchParams.get('search');

    // Build where clause based on filters
    const where: any = {};
    
    if (type && type !== 'all') {
      where.type = type.toUpperCase();
    }
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    
    if (location && location !== 'all') {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }
    
    if (search) {
      where.OR = [
        { assetTag: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            department: true,
          },
        },
        site: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const asset = await prisma.asset.create({
      data: {
        ...body,
        siteId: body.siteId, // You'll need to pass the site ID
      },
      include: {
        user: {
          select: {
            name: true,
            department: true,
          },
        },
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
} 