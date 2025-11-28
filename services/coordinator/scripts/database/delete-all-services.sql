-- ============================================
-- Delete All Registered Microservices
-- ============================================
-- WARNING: This will delete ALL services from the registered_services table
-- Use with caution! This action cannot be undone.
-- ============================================

-- Option 1: Delete all services (simple)
DELETE FROM registered_services;

-- Option 2: Delete all services and reset sequence (if using auto-increment)
-- DELETE FROM registered_services;
-- ALTER SEQUENCE registered_services_id_seq RESTART WITH 1;

-- Option 3: Delete with confirmation (safer - shows what will be deleted first)
-- First, see what will be deleted:
-- SELECT * FROM registered_services;
-- 
-- Then, if you're sure, run:
-- DELETE FROM registered_services;

-- ============================================
-- Verify deletion
-- ============================================
-- After running DELETE, verify with:
-- SELECT COUNT(*) FROM registered_services;
-- Should return 0

-- ============================================
-- Alternative: Delete specific services
-- ============================================

-- Delete by service name
-- DELETE FROM registered_services WHERE service_name = 'my-service';

-- Delete by status
-- DELETE FROM registered_services WHERE status = 'pending_migration';

-- Delete test services only
-- DELETE FROM registered_services WHERE service_name LIKE 'test-service%';

-- ============================================
-- Backup before deletion (recommended)
-- ============================================
-- Before deleting, you might want to backup:
-- CREATE TABLE registered_services_backup AS SELECT * FROM registered_services;
--
-- To restore from backup:
-- INSERT INTO registered_services SELECT * FROM registered_services_backup;

