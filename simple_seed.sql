-- Simple seed for missing data only
-- Safe to run multiple times

-- Add sample tasks (the main thing we need)
DO $$
BEGIN
  -- Only insert if tasks table is empty
  IF NOT EXISTS (SELECT 1 FROM tasks LIMIT 1) THEN
    INSERT INTO tasks (id, "taskNumber", title, description, category, priority, status, "createdBy", "assignedTo", "siteId", department, "dueDate", "createdAt", "updatedAt") VALUES 
    ('task1', 'TSK-000001', 'Sample Onboarding Task', 'Set up new employee workstation and accounts', 'USER_ONBOARDING', 'HIGH', 'COMPLETED', (SELECT id FROM users LIMIT 1), (SELECT id FROM users OFFSET 1 LIMIT 1), (SELECT id FROM sites LIMIT 1), 'IT', CURRENT_DATE + INTERVAL '7 days', NOW(), NOW()),
    ('task2', 'TSK-000002', 'Monthly Security Audit', 'Review access rights and security compliance', 'COMPLIANCE_CHECK', 'MEDIUM', 'IN_PROGRESS', (SELECT id FROM users LIMIT 1), (SELECT id FROM users OFFSET 1 LIMIT 1), (SELECT id FROM sites LIMIT 1), 'IT', CURRENT_DATE + INTERVAL '14 days', NOW(), NOW()),
    ('task3', 'TSK-000003', 'Asset Inventory Check', 'Verify all IT assets are properly tracked', 'INVENTORY_AUDIT', 'LOW', 'TODO', (SELECT id FROM users LIMIT 1), NULL, (SELECT id FROM sites LIMIT 1), 'IT', CURRENT_DATE + INTERVAL '30 days', NOW(), NOW());
  END IF;
END $$; 