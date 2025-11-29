# Coordinator Microservice - API Documentation

## Overview

The Coordinator Microservice serves as the central registry and intelligent routing hub for the microservices ecosystem. It provides advanced features including two-stage service registration, AI-powered routing, schema management, and comprehensive monitoring.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, authentication is optional and controlled by the `JWT_ENABLED` environment variable. When enabled, include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

---

## Service Registration

### Two-Stage Registration Process

The registration process has been enhanced to support a two-stage approach for better service management.

#### Stage 1: Basic Registration

**Endpoint:** `POST /register`

**Purpose:** Register basic service information and receive a service ID.

**Request Body:**
```json
{
  "serviceName": "string (required, unique)",
  "version": "string (required, semver format)",
  "endpoint": "string (required, full URL)",
  "healthCheck": "string (required, path like /health)",
  "description": "string (optional)",
  "metadata": {
    "team": "string",
    "owner": "string",
    "capabilities": ["array", "of", "capabilities"]
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Service registered successfully. Please upload migration file.",
  "serviceId": "uuid",
  "status": "pending_migration",
  "nextStep": {
    "action": "POST",
    "endpoint": "/register/{serviceId}/migration",
    "description": "Upload your migration file to complete registration"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "payment-service",
    "version": "1.0.0",
    "endpoint": "http://payment-service:4000",
    "healthCheck": "/health",
    "description": "Payment processing service",
    "metadata": {
      "team": "Team 5",
      "capabilities": ["payments", "refunds"]
    }
  }'
```

#### Stage 2: Migration Upload

**Endpoint:** `POST /register/:serviceId/migration`

**Purpose:** Upload migration/schema file to complete service registration.

**Request Body:**
```json
{
  "migrationFile": {
    "version": "1.0.0",
    "database": {
      "tables": [
        {
          "name": "users",
          "schema": {}
        }
      ],
      "migrations": []
    },
    "api": {
      "endpoints": [
        {
          "path": "/api/users",
          "method": "GET",
          "description": "Get all users",
          "requestSchema": {},
          "responseSchema": {}
        }
      ]
    },
    "dependencies": ["service-name-1", "service-name-2"],
    "events": {
      "publishes": ["user.created", "user.updated"],
      "subscribes": ["payment.completed"]
    }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Migration file uploaded successfully. Service is now active.",
  "serviceId": "uuid",
  "status": "active",
  "registeredAt": "ISO timestamp"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/register/{serviceId}/migration \
  -H "Content-Type: application/json" \
  -d '{
    "migrationFile": {
      "version": "1.0.0",
      "api": {
        "endpoints": [
          {
            "path": "/api/payment/process",
            "method": "POST"
          }
        ]
      },
      "events": {
        "publishes": ["payment.completed"],
        "subscribes": ["order.created"]
      }
    }
  }'
```

#### Update Migration

**Endpoint:** `PUT /register/:serviceId/migration`

**Purpose:** Update existing migration file.

---

## AI-Powered Routing

### Route Request

**Endpoint:** `POST /route`

**Purpose:** Use AI to intelligently route data/requests to appropriate microservice(s).

**Request Body:**
```json
{
  "data": {
    "type": "string (e.g., 'user_query', 'transaction', 'notification')",
    "payload": {},
    "context": {}
  },
  "routing": {
    "strategy": "single|multiple|broadcast",
    "priority": "speed|accuracy|cost"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "routing": {
    "targetServices": [
      {
        "serviceName": "payment-service",
        "endpoint": "http://payment-service:4000/api/process",
        "confidence": 0.95,
        "reasoning": "Payment-related keywords detected in payload"
      }
    ],
    "strategy": "single",
    "processingTime": "45ms",
    "method": "ai"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/route \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "payment_request",
      "payload": {
        "amount": 100,
        "currency": "USD"
      }
    },
    "routing": {
      "strategy": "single"
    }
  }'
```

### Get Routing Context

**Endpoint:** `GET /route/context`

**Purpose:** Get current routing context for debugging.

**Response (200 OK):**
```json
{
  "success": true,
  "context": {
    "aiEnabled": true,
    "fallbackEnabled": true,
    "totalServices": 5,
    "activeServices": 4,
    "services": [...]
  }
}
```

---

## Unified Proxy Endpoint (Inter-Service Communication)

### Overview

The unified proxy endpoint provides a standardized way for microservices to communicate with each other through the Coordinator. The Coordinator uses AI-powered routing to automatically determine which service should handle each request based on the payload content.

**Endpoint:** `POST /api/fill-content-metrics/`

**Purpose:**
- Centralized inter-service communication
- AI-powered automatic routing
- Standardized request/response format
- Automatic response mapping

**Status:** ✅ Production Ready (Tested on Railway)

**Production URL:** `https://coordinator-production-e0a0.up.railway.app/api/fill-content-metrics/`

---

### Request Format

#### Required Fields

```json
{
  "requester_service": "string",    // REQUIRED: Name of the service making the request
  "payload": {},                     // OPTIONAL: Service-specific data (can be empty object)
  "response": {}                     // REQUIRED: Template defining expected response structure
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requester_service` | string | ✅ Yes | Name of the microservice making the request (e.g., "devlab", "user-service") |
| `payload` | object | ⚠️ Optional | Data specific to the request. Can be empty `{}` if no data needed |
| `response` | object | ✅ Yes | Template defining the structure of the expected response with field names |

---

### Request Examples

#### Example 1: Generate Coding Exercises

```bash
curl -X POST https://coordinator-production-e0a0.up.railway.app/api/fill-content-metrics/ \
  -H "Content-Type: application/json" \
  -d '{
    "requester_service": "devlab",
    "payload": {
      "action": "coding",
      "amount": 2,
      "difficulty": "medium",
      "programming_language": "javascript",
      "skills": ["loops", "arrays"]
    },
    "response": {
      "exercises": []
    }
  }'
```

#### Example 2: Process Payment

```bash
curl -X POST https://coordinator-production-e0a0.up.railway.app/api/fill-content-metrics/ \
  -H "Content-Type: application/json" \
  -d '{
    "requester_service": "order-service",
    "payload": {
      "action": "process_payment",
      "order_id": "12345",
      "amount": 99.99,
      "currency": "USD"
    },
    "response": {
      "transaction_id": "",
      "status": "",
      "receipt_url": ""
    }
  }'
```

#### Example 3: Get User Profile

```bash
curl -X POST https://coordinator-production-e0a0.up.railway.app/api/fill-content-metrics/ \
  -H "Content-Type: application/json" \
  -d '{
    "requester_service": "dashboard-service",
    "payload": {
      "action": "get_user_profile",
      "user_id": "user-123"
    },
    "response": {
      "name": "",
      "email": "",
      "avatar": ""
    }
  }'
```

#### Example 4: Empty Payload

```bash
curl -X POST https://coordinator-production-e0a0.up.railway.app/api/fill-content-metrics/ \
  -H "Content-Type: application/json" \
  -d '{
    "requester_service": "monitoring-service",
    "payload": {},
    "response": {
      "status": ""
    }
  }'
```

---

### Response Format

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    // Fields matching the response template
    "exercises": [
      { "id": 1, "title": "...", "code": "..." },
      { "id": 2, "title": "...", "code": "..." }
    ]
  },
  "metadata": {
    "routed_to": "exercises-service",
    "confidence": 0.95,
    "requester": "devlab",
    "processing_time_ms": 245
  }
}
```

#### Error Responses

**400 Bad Request - Missing Required Field**
```json
{
  "success": false,
  "message": "Missing required field: requester_service"
}
```

**404 Not Found - No Suitable Service**
```json
{
  "success": false,
  "message": "No suitable microservice found for this request",
  "query": "coding, amount: 2, difficulty: medium",
  "requester": "devlab",
  "availableServices": ["exercises-service", "payment-service", "user-service"]
}
```

**502 Bad Gateway - Target Service Error**
```json
{
  "success": false,
  "message": "Failed to communicate with target service 'exercises-service'",
  "error": "connect ECONNREFUSED",
  "requester": "devlab",
  "routed_to": "exercises-service"
}
```

**503 Service Unavailable - Service Not Active**
```json
{
  "success": false,
  "message": "Target service 'exercises-service' is not active (status: pending_migration)",
  "requester": "devlab"
}
```

---

### How It Works

#### 1. Request Flow

```
Requester Service 
    ↓
    POST /api/fill-content-metrics/
    ↓
Coordinator receives request
    ↓
Convert payload to natural language query
    ↓
AI routing determines best service
    ↓
Forward request to target service
    ↓
Target service processes and responds
    ↓
Coordinator maps response to template
    ↓
Return mapped response to requester
```

#### 2. AI-Powered Routing

The Coordinator automatically determines which service should handle the request based on:

- **Payload content**: Field names and values (e.g., "action": "coding")
- **Service capabilities**: Keywords from migration files (e.g., ["coding exercises", "programming challenges"])
- **Service descriptions**: Natural language descriptions
- **Confidence scoring**: Returns target with highest confidence (>0.3)

**Example:**
```javascript
// Payload
{ "action": "coding", "difficulty": "medium" }

// Converted to query
"action: coding, difficulty: medium"

// AI analysis
// Matches exercises-service capabilities: ["coding exercises", "programming challenges"]
// Confidence: 0.95

// Routes to
exercises-service
```

#### 3. Response Mapping

The Coordinator automatically maps the target service's response to match the requester's expected format:

**Target service returns:**
```json
{
  "success": true,
  "data": {
    "generated_exercises": [...],
    "count": 2
  }
}
```

**Response template:**
```json
{
  "exercises": []
}
```

**Coordinator maps and returns:**
```json
{
  "success": true,
  "data": {
    "exercises": [...]  // Mapped from "generated_exercises"
  }
}
```

---

### Target Service Implementation

All microservices that want to receive requests must implement the same endpoint:

#### Endpoint: `POST /api/fill-content-metrics/`

#### Implementation Example (Node.js/Express)

```javascript
app.post('/api/fill-content-metrics/', async (req, res) => {
  const { requester_service, payload, response: responseTemplate } = req.body;
  
  try {
    console.log(`Request from: ${requester_service}`);
    
    // Your business logic here
    const result = await processRequest(payload);
    
    // Map response to match template
    const mappedResponse = {};
    for (const key of Object.keys(responseTemplate)) {
      // Fill each field requested by the requester
      mappedResponse[key] = result[key] || result.data?.[key] || null;
    }
    
    // Return in expected format
    res.json({
      success: true,
      data: mappedResponse
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

#### Implementation Example (Python/Flask)

```python
@app.route('/api/fill-content-metrics/', methods=['POST'])
def fill_content_metrics():
    data = request.get_json()
    requester_service = data.get('requester_service')
    payload = data.get('payload', {})
    response_template = data.get('response', {})
    
    try:
        print(f"Request from: {requester_service}")
        
        # Your business logic here
        result = process_request(payload)
        
        # Map response to match template
        mapped_response = {}
        for key in response_template.keys():
            mapped_response[key] = result.get(key) or result.get('data', {}).get(key)
        
        return jsonify({
            'success': True,
            'data': mapped_response
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
```

---

### Usage in Microservices

#### Step 1: Register Your Service

First, register your service with the Coordinator (see Service Registration section).

#### Step 2: Implement the Endpoint

Add `POST /api/fill-content-metrics/` to your service (see examples above).

#### Step 3: Make Requests Through Coordinator

```javascript
// Instead of calling services directly:
// const response = await fetch('http://exercises-service:5000/api/exercises');

// Call through the Coordinator:
const response = await fetch('https://coordinator-production-e0a0.up.railway.app/api/fill-content-metrics/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requester_service: 'devlab',
    payload: {
      action: 'coding',
      amount: 2,
      difficulty: 'medium'
    },
    response: {
      exercises: []  // Field names you expect
    }
  })
});

const result = await response.json();
if (result.success) {
  const exercises = result.data.exercises;
  console.log('Received exercises:', exercises);
}
```

---

### Best Practices

#### 1. Clear Action Names

```javascript
✅ Good:
{ "action": "generate_coding_exercises" }

❌ Bad:
{ "action": "do_stuff" }
```

#### 2. Include Context in Payload

```javascript
✅ Good:
{
  "action": "process_payment",
  "type": "subscription",
  "interval": "monthly"
}

❌ Bad:
{
  "action": "process"
}
```

#### 3. Accurate Service Capabilities

In your migration file:

```javascript
capabilities: [
  "coding exercises",        // ✅ Clear
  "generate exercises",      // ✅ Clear
  "programming challenges",  // ✅ Clear
  "stuff"                    // ❌ Too vague
]
```

#### 4. Handle Errors Gracefully

```javascript
try {
  const response = await fetch(coordinatorUrl, {...});
  const result = await response.json();
  
  if (!result.success) {
    console.error('Request failed:', result.message);
    // Handle error
  }
} catch (error) {
  console.error('Network error:', error);
  // Handle timeout or connection issues
}
```

#### 5. Use Meaningful Response Templates

```javascript
✅ Good:
{
  "exercises": [],
  "total_count": 0,
  "difficulty_level": ""
}

❌ Bad:
{
  "data": ""
}
```

---

### Testing

#### Health Check

```bash
curl https://coordinator-production-e0a0.up.railway.app/health
```

#### Test Unified Proxy

```bash
curl -X POST https://coordinator-production-e0a0.up.railway.app/api/fill-content-metrics/ \
  -H "Content-Type: application/json" \
  -d '{
    "requester_service": "test-service",
    "payload": {"action": "test"},
    "response": {"result": ""}
  }'
```

---

### Performance Considerations

- **Timeout**: 30 seconds per request
- **Concurrent Requests**: Supported
- **Response Time**: Typically <1 second for simple routing
- **AI Routing**: Adds ~100-500ms overhead

---

### Troubleshooting

#### No Service Found (404)

- Ensure target service is registered and status is `active`
- Check service `capabilities` in migration file
- Verify payload has clear, descriptive fields

#### Request Timeout (502)

- Target service may be slow or down
- Check target service health
- Verify target service has `/api/fill-content-metrics/` endpoint

#### Response Mapping Issues

- Verify response template field names
- Check target service returns data in expected format
- Ensure target service implements endpoint correctly

---

### Quick Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/fill-content-metrics/` | Unified inter-service communication |

**Required Headers:**
```
Content-Type: application/json
```

**Required Body Fields:**
```json
{
  "requester_service": "string",
  "response": {}
}
```

**Optional Body Fields:**
```json
{
  "payload": {}
}
```

---

### Integration Checklist

For each microservice:

- [ ] Implement `POST /api/fill-content-metrics/` endpoint
- [ ] Register with Coordinator (Stage 1 + Stage 2)
- [ ] Verify status is `active`
- [ ] Update inter-service calls to use unified proxy
- [ ] Test request/response flow
- [ ] Handle errors appropriately
- [ ] Monitor logs for debugging

---

**Production URL:** `https://coordinator-production-e0a0.up.railway.app/api/fill-content-metrics/`

**Status:** ✅ Live and Tested (13/13 deployment tests passed)

**Related Documentation:**
- [Feature 13: Unified Proxy Endpoint](../docs/features/13-unified-proxy.md)
- [Unified Proxy Implementation](../UNIFIED_PROXY_IMPLEMENTATION.md)
- [AI Routing Guide](../AI_ROUTING_GUIDE.md)
- [Service Registration Guide](../MICROSERVICE_REGISTRATION_GUIDE.md)

---

## Service Discovery

### List Services

**Endpoint:** `GET /services`

**Query Parameters:**
- `includeAll` (boolean): Include services in all statuses (default: false, only active)

**Response (200 OK):**
```json
{
  "success": true,
  "services": [
    {
      "serviceName": "payment-service",
      "version": "1.0.0",
      "endpoint": "http://payment-service:4000",
      "status": "active",
      "registeredAt": "ISO timestamp"
    }
  ],
  "total": 1
}
```

### Get Service Details

**Endpoint:** `GET /services/:serviceId`

**Response (200 OK):**
```json
{
  "success": true,
  "service": {
    "serviceId": "uuid",
    "serviceName": "payment-service",
    "version": "1.0.0",
    "endpoint": "http://payment-service:4000",
    "status": "active",
    "registeredAt": "ISO timestamp",
    "migrationFile": {},
    "capabilities": [],
    "dependencies": [],
    "events": {
      "publishes": [],
      "subscribes": []
    },
    "health": {
      "lastCheck": "ISO timestamp",
      "status": "healthy"
    }
  }
}
```

---

## Schema Registry

### List All Schemas

**Endpoint:** `GET /schemas`

**Response (200 OK):**
```json
{
  "success": true,
  "schemas": [
    {
      "serviceId": "uuid",
      "serviceName": "payment-service",
      "schemaTypes": ["api_endpoints", "database_tables", "events"],
      "schemaCount": 3
    }
  ],
  "totalServices": 1
}
```

### Get Service Schemas

**Endpoint:** `GET /schemas/:serviceId`

**Response (200 OK):**
```json
{
  "success": true,
  "serviceId": "uuid",
  "serviceName": "payment-service",
  "currentSchemas": {},
  "versions": [
    {
      "version": "1.0.0",
      "timestamp": "ISO timestamp",
      "schemaTypes": ["api_endpoints"]
    }
  ]
}
```

### Validate Data Against Schema

**Endpoint:** `POST /schemas/:serviceId/validate`

**Request Body:**
```json
{
  "data": {},
  "schemaType": "api_request|api_response|event_payload|database",
  "schemaName": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "valid": true,
  "errors": [],
  "schemaType": "api_request",
  "schemaName": "POST_/api/payment/process"
}
```

---

## System Changelog

### Get Changelog

**Endpoint:** `GET /changelog`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50, max: 100)
- `type` (string): Filter by change type

**Response (200 OK):**
```json
{
  "success": true,
  "changes": [
    {
      "id": "uuid",
      "type": "service_registered",
      "details": {
        "serviceName": "payment-service",
        "serviceId": "uuid"
      },
      "timestamp": "ISO timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 45,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### Get Changelog Statistics

**Endpoint:** `GET /changelog/stats`

**Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "totalChanges": 45,
    "recentChanges": 12,
    "typeStats": {
      "service_registered": 10,
      "migration_uploaded": 8,
      "routing_performed": 25
    }
  }
}
```

### Search Changelog

**Endpoint:** `GET /changelog/search`

**Query Parameters:**
- `q` or `query` (string): Search query
- `limit` (number): Max results (default: 20, max: 50)

---

## Knowledge Graph

### Get Knowledge Graph

**Endpoint:** `GET /knowledge-graph`

**Query Parameters:**
- `serviceId` (string): Get graph for specific service
- `depth` (number): Dependency depth levels

**Response (200 OK):**
```json
{
  "nodes": [
    {
      "id": "service-1",
      "name": "payment-service",
      "type": "service",
      "status": "active",
      "capabilities": []
    }
  ],
  "edges": [
    {
      "source": "service-1",
      "target": "service-2",
      "type": "depends_on"
    }
  ]
}
```

---

## UI/UX Configuration

### Get UI/UX Config

**Endpoint:** `GET /uiux`

### Update UI/UX Config

**Endpoint:** `POST /uiux`

---

## Monitoring & Metrics

### Prometheus Metrics

**Endpoint:** `GET /metrics`

**Response:** Prometheus format metrics

### JSON Metrics

**Endpoint:** `GET /metrics/json`

**Response (200 OK):**
```json
{
  "success": true,
  "metrics": {
    "uptime": 3600,
    "timestamp": "ISO timestamp",
    "metricsEnabled": true
  }
}
```

---

## Health Check

### Health Status

**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "coordinator"
}
```

---

## Error Responses

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": ["Missing required field: serviceName"]
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Service not found"
}
```

**409 Conflict:**
```json
{
  "success": false,
  "error": "Service with name 'payment-service' already exists"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. This can be added by Team 4 as part of security enhancements.

---

## Versioning

The API currently uses implicit versioning. All endpoints are considered v1. Future versions may include explicit versioning in the URL path.

---

## Environment Variables

See `.env.example` for all available configuration options including AI routing, metrics, and feature toggles.

