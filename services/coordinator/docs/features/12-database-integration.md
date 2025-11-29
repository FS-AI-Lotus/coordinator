# Feature 12: Database Integration

**Status:** ✅ Active (Optional)  
**Owner:** core-team  
**Last Updated:** 2025-01-XX

---

## Description

Database Integration provides optional Supabase database connectivity for persistent storage. When configured, services can store data in Supabase instead of in-memory storage. The feature gracefully falls back to in-memory storage when Supabase is not configured.

---

## Source Files

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/config/supabase.js` | Config | ~33 | Supabase client configuration |

---

## Dependencies

### Incoming Dependencies (Features that depend on this)
- Service Registration & Management
- Knowledge Graph

### Outgoing Dependencies (Features this depends on)
- None

---

## API Endpoints

### HTTP Endpoints

None (config only)

### gRPC Endpoints

None (config only)

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUPABASE_URL` | No | - | Supabase database URL |
| `SUPABASE_ANON_KEY` | No | - | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | - | Supabase service role key |

**Note:** All variables are optional. If not provided, features use in-memory storage.

---

## Testing Instructions

### Verify Supabase Connection

```bash
# Check if Supabase is configured (via service registration)
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "test",
    "version": "1.0.0",
    "endpoint": "http://test:3000",
    "healthCheck": "/health"
  }'

# If Supabase is configured, service will be persisted
# If not, service will be in-memory only
```

### Test In-Memory Fallback

1. Start service without Supabase env variables
2. Register services
3. Verify services work (in-memory)
4. Restart service
5. Verify services are lost (expected for in-memory)

---

## Metrics

The following metrics are tracked:

- **Database Connections** (`coordinator_database_connections`)
  - Gauge metric tracking active connections

- **Database Queries Total** (`coordinator_database_queries_total`)
  - Counter metric tracking database queries

- **Database Errors** (`coordinator_database_errors_total`)
  - Counter metric tracking database errors

Access metrics via: `GET /metrics`

---

## Future Enhancements

1. **Multiple Database Support**
   - Support for other databases
   - Database abstraction layer

2. **Connection Pooling**
   - Database connection pooling
   - Connection management

3. **Database Migrations**
   - Automated schema migrations
   - Migration versioning

4. **Database Replication**
   - Read replicas
   - High availability

5. **Database Backup**
   - Automated backups
   - Point-in-time recovery

6. **Database Monitoring**
   - Query performance monitoring
   - Database health checks

---

## Related Documentation

- [Supabase Setup](../../SUPABASE_SETUP.md)
- [Service Registration](../features/01-service-registration.md)


