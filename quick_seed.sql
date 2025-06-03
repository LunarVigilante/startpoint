-- Quick seed data for StartPoint
-- Run this directly in Supabase SQL editor

-- Insert sites
INSERT INTO sites (id, name, code, "createdAt", "updatedAt") VALUES 
('site1', 'Corporate Headquarters', 'HQ001', NOW(), NOW()),
('site2', 'Branch Office', 'BR001', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Insert users (using individual inserts to handle conflicts properly)
INSERT INTO users (id, email, "employeeId", name, "siteId", department, "jobTitle", status, "startDate", "createdAt", "updatedAt") 
VALUES ('user1', 'admin@startpoint.com', 'EMP001', 'System Administrator', 'site1', 'IT', 'IT Manager', 'ACTIVE', '2024-01-01', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, email, "employeeId", name, "siteId", department, "jobTitle", status, "startDate", "createdAt", "updatedAt") 
VALUES ('user2', 'john.doe@startpoint.com', 'EMP002', 'John Doe', 'site1', 'IT', 'IT Technician', 'ACTIVE', '2024-01-15', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, email, "employeeId", name, "siteId", department, "jobTitle", status, "startDate", "createdAt", "updatedAt") 
VALUES ('user3', 'jane.doe@startpoint.com', 'EMP003', 'Jane Doe', 'site1', 'HR', 'HR Specialist', 'ACTIVE', '2024-01-10', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert sample assets
INSERT INTO assets (id, "assetTag", name, type, manufacturer, model, "serialNumber", "siteId", status, condition, location, "purchaseDate", "purchasePrice", "createdAt", "updatedAt") VALUES 
('asset1', 'LAP001', 'Dell Latitude 7420', 'LAPTOP', 'Dell', 'Latitude 7420', 'DL001234', 'site1', 'AVAILABLE', 'Good', 'IT Storage', '2024-01-01', 1200.00, NOW(), NOW()),
('asset2', 'LAP002', 'MacBook Pro 14"', 'LAPTOP', 'Apple', 'MacBook Pro 14-inch', 'MB001234', 'site1', 'ASSIGNED', 'Excellent', 'Assigned to John Doe', '2024-01-15', 2500.00, NOW(), NOW())
ON CONFLICT ("assetTag") DO NOTHING;

-- Update asset2 to be assigned to John
UPDATE assets SET "userId" = 'user2', "assignedDate" = '2024-01-16' WHERE "assetTag" = 'LAP002';

-- Insert sample tasks
INSERT INTO tasks (id, "taskNumber", title, description, category, priority, status, "createdBy", "assignedTo", "siteId", department, "userId", "assetId", "dueDate", "completedAt", "estimatedHours", "actualHours", "createdAt", "updatedAt") VALUES 
('task1', 'TSK-000001', 'Onboard new employee - Jane Doe', 'Set up computer, accounts, and access for new HR employee Jane Doe starting January 10th.', 'USER_ONBOARDING', 'HIGH', 'COMPLETED', 'user1', 'user2', 'site1', 'HR', 'user3', NULL, '2024-01-10', '2024-01-09', 4, 3.5, NOW(), NOW()),
('task2', 'TSK-000002', 'Monthly security compliance audit', 'Review user access rights, update security policies, and ensure all systems are compliant with company security standards.', 'COMPLIANCE_CHECK', 'MEDIUM', 'IN_PROGRESS', 'user1', 'user2', 'site1', 'IT', NULL, NULL, '2024-02-15', NULL, 8, NULL, NOW(), NOW()),
('task3', 'TSK-000003', 'Asset inventory verification', 'Physical verification of all IT assets in HQ location, update asset database with current locations and conditions.', 'INVENTORY_AUDIT', 'LOW', 'TODO', 'user1', NULL, 'site1', 'IT', NULL, NULL, '2024-03-01', NULL, 12, NULL, NOW(), NOW())
ON CONFLICT ("taskNumber") DO NOTHING;

-- Insert sample anomaly
INSERT INTO "access_anomalies" (id, "userId", type, description, suggestion, severity, status, "createdAt", "updatedAt") VALUES 
('anomaly1', 'user3', 'MISSING_STANDARD_ITEM', 'User Jane Doe does not have the standard HR software license assigned', 'Assign Microsoft 365 license with HR-specific tools', 'MEDIUM', 'OPEN', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert department baseline
INSERT INTO "department_baselines" (id, department, "siteId", "standardAssets", "requiredGroups", "commonLicenses", "createdAt", "updatedAt") VALUES 
('baseline1', 'IT', 'site1', 
  '[{"type": "LAPTOP", "specs": "Dell Latitude or MacBook Pro", "required": true}, {"type": "MONITOR", "specs": "24\" or larger", "required": false}]',
  '["IT_Admin", "Domain_Users", "VPN_Users"]',
  '["Microsoft 365", "Windows 11 Pro", "Adobe Creative Suite"]',
  NOW(), NOW())
ON CONFLICT (department, "siteId") DO NOTHING; 