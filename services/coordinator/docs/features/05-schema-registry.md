# Feature 05: Schema Registry

**Status:** ✅ Active  
**Owner:** core-team  
**Last Updated:** 2025-01-XX

---

## Description

Schema Registry manages and validates schemas for microservices. It stores API endpoint schemas, database table schemas, and event schemas from migration files. The feature provides schema validation, versioning, and comparison capabilities to ensure data consistency across services.

---

## Source Files

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/routes/schemas.js` | Route | ~182 | Schema management endpoints |
| `src/services/schemaRegistryService.js` | Service | ~419 | Schema validation & storage |

---

## Dependencies

### Incoming Dependencies (Features that depend on this)
- None (standalone feature)

### Outgoing Dependencies (Features this depends on)
- Service Registration & Management
- Security & Validation
- Shared utilities (logger)

---

## API Endpoints

### HTTP Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/schemas` | List all schemas |
| `GET` | `/schemas/:serviceId` | Get service schemas |
| `GET` | `/schemas/:serviceId/:schemaType` | Get specific schema |
| `POST` | `/schemas/:serviceId/validate` | Validate data against schema |
| `GET` | `/schemas/:serviceId/compare/:version1/:version2` | Compare schema versions |

### gRPC Endpoints

None

---

## Environment Variables

None

---

## Testing Instructions

### List All Schemas

```bash
curl http://localhost:3000/schemas
```

### Get Service Schemas

```bash
curl http://localhost:3000/schemas/{serviceId}
```

### Get Specific Schema

```bash
curl http://localhost:3000/schemas/{serviceId}/api_endpoints
```

### Validate Data

```bash
curl -X POST http://localhost:3000/schemas/{serviceId}/validate \
  -H "Content-Type: application/json" \
  -d '{
    "data": {"amount": 100, "currency": "USD"},
    "schemaType": "api_request",
    "schemaName": "ProcessPayment"
  }'
```

### Compare Schema Versions

```bash
curl http://localhost:3000/schemas/{serviceId}/compare/1.0.0/2.0.0
```

---

## Metrics

The following metrics are tracked:

- **Schema Validations Total** (`coordinator_schema_validations_total`)
  - Counter metric tracking validation attempts

- **Schema Validation Success** (`coordinator_schema_validation_success_total`)
  - Counter metric tracking successful validations

- **Schema Validation Failures** (`coordinator_schema_validation_failures_total`)
  - Counter metric tracking failed validations

- **Registered Schemas Total** (`coordinator_registered_schemas_total`)
  - Gauge metric tracking total schemas

Access metrics via: `GET /metrics`

---

## Future Enhancements

1. **Schema Auto-Learning**
   - Automatically learn schemas from requests
   - Schema inference from data

2. **Schema Evolution**
   - Support for schema migrations
   - Backward compatibility checks

3. **Schema Composition**
   - Compose schemas from multiple sources
   - Schema inheritance

4. **Schema Documentation**
   - Auto-generate API documentation
   - Schema visualization

5. **Schema Testing**
   - Generate test data from schemas
   - Schema-based test generation

6. **Schema Registry UI**
   - Web interface for schema management
   - Schema browser and editor

---

## Related Documentation

- [API Documentation](../../API_DOCUMENTATION.md)


