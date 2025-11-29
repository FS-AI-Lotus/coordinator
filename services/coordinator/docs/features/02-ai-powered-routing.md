# Feature 02: AI-Powered Routing

**Status:** ✅ Active  
**Owner:** core-team  
**Last Updated:** 2025-01-XX

---

## Description

AI-Powered Routing uses OpenAI's language models to intelligently route requests to the most appropriate microservice based on natural language queries. The feature analyzes user queries, service capabilities, and context to determine the best routing target with confidence scores. Falls back to keyword-based routing when AI is unavailable.

---

## Source Files

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/routes/route.js` | Route | ~144 | HTTP routing endpoints |
| `src/services/aiRoutingService.js` | Service | ~492 | OpenAI-based routing logic |
| `src/config/routing.js` | Config | ~19 | Routing configuration |

---

## Dependencies

### Incoming Dependencies (Features that depend on this)
- Dual Protocol Support
- Smart Proxy
- Communication Services

### Outgoing Dependencies (Features this depends on)
- Service Registration & Management (get active services)
- Security & Validation
- Shared utilities (logger)

---

## API Endpoints

### HTTP Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/route` | AI-based routing request |
| `GET` | `/route?q=<query>` | Simple query routing |
| `GET` | `/route` | Routing context/info |

### gRPC Endpoints

None (but used internally by gRPC handler)

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_ROUTING_ENABLED` | Yes | `false` | Enable AI routing (must be `true`) |
| `OPENAI_API_KEY` | Yes* | - | OpenAI API key (required for AI routing) |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | OpenAI model to use |
| `OPENAI_API_URL` | No | `https://api.openai.com/v1/chat/completions` | OpenAI API endpoint |
| `AI_FALLBACK_ENABLED` | No | `true` | Enable fallback routing |
| `MAX_FALLBACK_ATTEMPTS` | No | `5` | Maximum fallback attempts |
| `MIN_QUALITY_SCORE` | No | `0.5` | Minimum quality score for routing |
| `STOP_ON_FIRST_SUCCESS` | No | `true` | Stop on first successful routing |
| `ATTEMPT_TIMEOUT` | No | `3000` | Timeout per attempt (ms) |

*Required when `AI_ROUTING_ENABLED=true`

---

## Testing Instructions

### AI Routing (POST)

```bash
curl -X POST http://localhost:3000/route \
  -H "Content-Type: application/json" \
  -d '{
    "query": "get user profile information",
    "method": "GET",
    "path": "/api/users/123"
  }'
```

### Simple Query (GET)

```bash
curl "http://localhost:3000/route?q=process payment"
```

### Routing Context

```bash
curl http://localhost:3000/route
```

---

## Metrics

The following metrics are tracked:

- **Routing Requests Total** (`coordinator_routing_requests_total`)
  - Counter metric tracking routing attempts

- **AI Routing Success** (`coordinator_ai_routing_success_total`)
  - Counter metric tracking successful AI routing

- **Fallback Routing Used** (`coordinator_fallback_routing_total`)
  - Counter metric tracking fallback routing usage

- **Routing Processing Time** (`coordinator_routing_processing_time_ms`)
  - Histogram metric tracking routing performance

Access metrics via: `GET /metrics`

---

## Future Enhancements

1. **Multi-Model Support**
   - Support for multiple AI models
   - Model selection based on query type

2. **Routing Cache**
   - Cache common routing decisions
   - Reduce API calls and latency

3. **Confidence Thresholds**
   - Configurable confidence thresholds
   - Automatic fallback on low confidence

4. **Routing Analytics**
   - Track routing accuracy
   - Learn from routing decisions

5. **Custom Routing Rules**
   - User-defined routing rules
   - Rule-based routing alongside AI

6. **A/B Testing Support**
   - Test different routing strategies
   - Compare routing performance

---

## Related Documentation

- [AI Routing Guide](../../AI_ROUTING_GUIDE.md)
- [How to Test AI Routing](../../../HOW_TO_TEST_AI_ROUTING.md)
- [Cascading Fallback](../../CASCADING_FALLBACK.md)


