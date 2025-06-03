import { NextRequest, NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';

export async function GET() {
  try {
    const assets = await withRetry(() => prisma.asset.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            department: true,
          },
        },
        site: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    }));

    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      assetTag,
      name,
      type,
      category,
      manufacturer,
      model,
      serialNumber,
      siteCode,
      status = 'AVAILABLE',
      condition,
      location,
      purchaseDate,
      purchasePrice,
      vendor,
      invoiceNumber,
      warrantyExpiry,
    } = body;

    // Validate required fields
    if (!assetTag || !name || !type || !siteCode) {
      return NextResponse.json(
        { error: 'Asset tag, name, type, and site are required' },
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

    // Check if asset tag already exists
    const existingAsset = await withRetry(() => prisma.asset.findUnique({
      where: { assetTag },
    }));
    
    if (existingAsset) {
      return NextResponse.json(
        { error: 'Asset tag already exists' },
        { status: 400 }
      );
    }

    const asset = await withRetry(() => prisma.asset.create({
      data: {
        assetTag,
        name,
        type,
        category,
        manufacturer,
        model,
        serialNumber,
        siteId: site.id,
        status,
        condition,
        location,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        vendor,
        invoiceNumber,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            department: true,
          },
        },
        site: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    }));

    return NextResponse.json(asset, { status: 201 });
  } catch (error: any) {
    console.error('Error creating asset:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Asset with this tag or serial number already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    // If siteCode is provided, convert to siteId
    if (updateData.siteCode) {
      const site = await withRetry(() => prisma.site.findUnique({
        where: { code: updateData.siteCode },
      }));
      
      if (!site) {
        return NextResponse.json(
          { error: 'Site not found' },
          { status: 400 }
        );
      }
      
      updateData.siteId = site.id;
      delete updateData.siteCode;
    }

    // Handle date fields
    if (updateData.purchaseDate) {
      updateData.purchaseDate = new Date(updateData.purchaseDate);
    }
    if (updateData.warrantyExpiry) {
      updateData.warrantyExpiry = new Date(updateData.warrantyExpiry);
    }
    if (updateData.assignedDate) {
      updateData.assignedDate = new Date(updateData.assignedDate);
    }

    const asset = await withRetry(() => prisma.asset.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            department: true,
          },
        },
        site: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    }));

    return NextResponse.json(asset);
  } catch (error: any) {
    console.error('Error updating asset:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update asset' },
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
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    await withRetry(() => prisma.asset.delete({
      where: { id },
    }));

    return NextResponse.json({ message: 'Asset deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting asset:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
} 