import { NextRequest, NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';

// For now, we'll use a simple in-memory store for notification settings
// In production, this would be stored in the database
const notificationSettings = {
  email: {
    enabled: true,
    taskAssignments: true,
    assetChanges: true,
    anomalyAlerts: true,
    weeklyReports: false,
  },
  system: {
    enabled: true,
    criticalAlerts: true,
    maintenanceNotices: true,
    updateNotifications: false,
  },
  dashboard: {
    enabled: true,
    realTimeUpdates: true,
    popupNotifications: false,
    soundAlerts: false,
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // email, system, dashboard

    // In a real implementation, this would fetch user-specific settings from the database
    if (type) {
      return NextResponse.json({
        type,
        settings: notificationSettings[type as keyof typeof notificationSettings] || {}
      });
    }

    // Return all notification settings
    return NextResponse.json({
      userId,
      settings: notificationSettings,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, settings } = body;

    if (!userId || !type || !settings) {
      return NextResponse.json(
        { error: 'User ID, type, and settings are required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['email', 'system', 'dashboard'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    // Update settings (in a real implementation, this would update the database)
    notificationSettings[type as keyof typeof notificationSettings] = {
      ...notificationSettings[type as keyof typeof notificationSettings],
      ...settings
    };

    // Log the notification preference change
    await withRetry(() => prisma.taskComment.create({
      data: {
        taskId: `system-notification-${Date.now()}`, // System task ID
        userId,
        content: `Notification preferences updated for ${type}: ${JSON.stringify(settings)}`,
        isInternal: true,
      }
    }).catch(() => {
      // Silently fail if task comment creation fails
      console.log('Could not log notification change');
    }));

    return NextResponse.json({
      success: true,
      type,
      settings: notificationSettings[type as keyof typeof notificationSettings],
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, settings } = body;

    if (!userId || !settings) {
      return NextResponse.json(
        { error: 'User ID and settings are required' },
        { status: 400 }
      );
    }

    // Update all notification settings at once
    Object.keys(settings).forEach(type => {
      if (notificationSettings[type as keyof typeof notificationSettings]) {
        notificationSettings[type as keyof typeof notificationSettings] = {
          ...notificationSettings[type as keyof typeof notificationSettings],
          ...settings[type]
        };
      }
    });

    return NextResponse.json({
      success: true,
      settings: notificationSettings,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error updating all notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
}

// Send a test notification
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, message } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'User ID and type are required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would send an actual notification
    // For now, we'll just return a success response
    const testMessage = message || `Test ${type} notification sent at ${new Date().toLocaleString()}`;

    return NextResponse.json({
      success: true,
      message: 'Test notification sent successfully',
      details: {
        userId,
        type,
        message: testMessage,
        sentAt: new Date().toISOString(),
      }
    });
  } catch (error: any) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
} 