# Feature {{NN}}: {{FEATURE_NAME}}

**Status:** {{STATUS}}  
**Owner:** {{OWNER}}  
**Last Updated:** {{DATE}}

---

## Description

{{DESCRIPTION}}

---

## Source Files

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/routes/{{FEATURE_NAME}}.js` | Route | ~XXX | HTTP endpoints |
| `src/services/{{FEATURE_NAME}}Service.js` | Service | ~XXX | Business logic |

---

## Dependencies

### Incoming Dependencies (Features that depend on this)
- {{INCOMING_DEPS}}

### Outgoing Dependencies (Features this depends on)
- {{OUTGOING_DEPS}}

---

## API Endpoints

### HTTP Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/{{ENDPOINT_PATH}}` | {{DESCRIPTION}} |
| `POST` | `/{{ENDPOINT_PATH}}` | {{DESCRIPTION}} |

### gRPC Endpoints

| Service | Method | Description |
|---------|--------|-------------|
| `{{SERVICE_NAME}}` | `{{METHOD_NAME}}` | {{DESCRIPTION}} |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `{{ENV_VAR}}` | {{REQUIRED}} | `{{DEFAULT}}` | {{DESCRIPTION}} |

---

## Testing Instructions

### Test Endpoint

```bash
# GET request
curl http://localhost:3000/{{ENDPOINT_PATH}}

# POST request
curl -X POST http://localhost:3000/{{ENDPOINT_PATH}} \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Test gRPC (if applicable)

```bash
grpcurl -plaintext \
  -d '{"request": "data"}' \
  localhost:50051 \
  {{SERVICE_NAME}}/{{METHOD_NAME}}
```

---

## Metrics

The following metrics are tracked:

- **{{METRIC_NAME}}** (`coordinator_{{METRIC_NAME}}`)
  - {{METRIC_TYPE}} metric tracking {{DESCRIPTION}}

Access metrics via: `GET /metrics`

---

## Future Enhancements

1. **{{ENHANCEMENT_1}}**
   - {{DESCRIPTION}}
   - {{BENEFITS}}

2. **{{ENHANCEMENT_2}}**
   - {{DESCRIPTION}}
   - {{BENEFITS}}

---

## Related Documentation

- [Feature Map](../architecture/feature-map.md)
- [API Documentation](../../API_DOCUMENTATION.md)


