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
      siteCode,
      manufacturer,
      model,
      serialNumber,
      location,
      purchasePrice,
      vendor,
      warrantyExpiry,
      assignmentType = 'UNASSIGNED',
      assignedToDepartment,
      assignedToEquipment,
    } = body;

    // Validate required fields
    if (!assetTag || !name || !type || !siteCode) {
      return NextResponse.json(
        { error: 'Asset tag, name, type, and site are required' },
        { status: 400 }
      );
    }

    // Validate assignment type specific requirements
    if (assignmentType === 'DEPARTMENT' && !assignedToDepartment) {
      return NextResponse.json(
        { error: 'Department is required when assignment type is DEPARTMENT' },
        { status: 400 }
      );
    }
    
    if (assignmentType === 'EQUIPMENT' && !assignedToEquipment) {
      return NextResponse.json(
        { error: 'Equipment/Location is required when assignment type is EQUIPMENT' },
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
        { error: 'Asset with this tag already exists' },
        { status: 400 }
      );
    }

    // Check if serial number already exists (if provided)
    if (serialNumber) {
      const existingSerial = await withRetry(() => prisma.asset.findUnique({
        where: { serialNumber },
      }));
      
      if (existingSerial) {
        return NextResponse.json(
          { error: 'Asset with this serial number already exists' },
          { status: 400 }
        );
      }
    }

    // Determine status based on assignment type
    const status = assignmentType === 'UNASSIGNED' ? 'AVAILABLE' : 'ASSIGNED';

    const asset = await withRetry(() => prisma.asset.create({
      data: {
        assetTag: assetTag.toUpperCase().trim(),
        name: name.trim(),
        type,
        siteId: site.id,
        manufacturer: manufacturer || null,
        model: model || null,
        serialNumber: serialNumber || null,
        location: location || null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        vendor: vendor || null,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
        assignmentType,
        assignedToDepartment: assignmentType === 'DEPARTMENT' ? assignedToDepartment : null,
        assignedToEquipment: assignmentType === 'EQUIPMENT' ? assignedToEquipment : null,
        assignedDate: assignmentType !== 'UNASSIGNED' ? new Date() : null,
        status,
      },
      include: {
        site: {
          select: {
            name: true,
            code: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            department: true,
          },
        },
      },
    }));

    return NextResponse.json(asset, { status: 201 });
  } catch (error: any) {
    console.error('Error creating asset:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target?.includes('assetTag')) {
        return NextResponse.json(
          { error: 'Asset with this tag already exists' },
          { status: 400 }
        );
      }
      if (target?.includes('serialNumber')) {
        return NextResponse.json(
          { error: 'Asset with this serial number already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Asset with these details already exists' },
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
    const { 
      id, 
      status, 
      location, 
      condition,
      assignmentType,
      assignedToDepartment,
      assignedToEquipment,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    // Check if asset exists
    const existingAsset = await withRetry(() => prisma.asset.findUnique({
      where: { id },
    }));
    
    if (!existingAsset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Validate assignment type specific requirements
    if (assignmentType === 'DEPARTMENT' && !assignedToDepartment) {
      return NextResponse.json(
        { error: 'Department is required when assignment type is DEPARTMENT' },
        { status: 400 }
      );
    }
    
    if (assignmentType === 'EQUIPMENT' && !assignedToEquipment) {
      return NextResponse.json(
        { error: 'Equipment/Location is required when assignment type is EQUIPMENT' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (location !== undefined) updateData.location = location;
    if (condition !== undefined) updateData.condition = condition;
    
    // Handle assignment type changes
    if (assignmentType !== undefined) {
      updateData.assignmentType = assignmentType;
      
      // Clear all assignment fields first
      updateData.userId = null;
      updateData.assignedToDepartment = null;
      updateData.assignedToEquipment = null;
      
      // Set the appropriate assignment field based on type
      if (assignmentType === 'DEPARTMENT') {
        updateData.assignedToDepartment = assignedToDepartment;
        updateData.status = 'ASSIGNED';
      } else if (assignmentType === 'EQUIPMENT') {
        updateData.assignedToEquipment = assignedToEquipment;
        updateData.status = 'ASSIGNED';
      } else if (assignmentType === 'UNASSIGNED') {
        updateData.status = 'AVAILABLE';
      }
      
      // Update assigned date if assignment is changing
      if (assignmentType !== 'UNASSIGNED' && existingAsset.assignmentType === 'UNASSIGNED') {
        updateData.assignedDate = new Date();
      } else if (assignmentType === 'UNASSIGNED') {
        updateData.assignedDate = null;
      }
    }

    const asset = await withRetry(() => prisma.asset.update({
      where: { id },
      data: updateData,
      include: {
        site: {
          select: {
            name: true,
            code: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            department: true,
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