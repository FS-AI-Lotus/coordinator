# Microservice Registration & Networking Guide

**Complete guide for microservices to register with the Coordinator and start networking with each other**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [REST API Endpoints](#rest-api-endpoints)
3. [gRPC Endpoints](#grpc-endpoints)
4. [Service Registration Process](#service-registration-process)
5. [Service Discovery](#service-discovery)
6. [Inter-Service Communication](#inter-service-communication)
7. [Code Examples](#code-examples)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🌐 Overview

The **Coordinator Microservice** is the central hub for your microservices ecosystem. It provides:

- ✅ **Service Registry**: Register and discover microservices
- ✅ **AI-Powered Routing**: Intelligent request routing using OpenAI
- ✅ **Dual Protocol Support**: Both REST (HTTP) and gRPC
- ✅ **Service Discovery**: Find and connect to other services
- ✅ **Health Monitoring**: Track service health and availability
- ✅ **Knowledge Graph**: Visual representation of service relationships

### Base URLs

- **REST API**: `http://localhost:3000` (or your deployment URL)
- **gRPC**: `localhost:50051` (default port, configurable via `GRPC_PORT`)

---

## 🔗 REST API Endpoints

### 1. Service Registration

#### **Stage 1: Basic Registration**

Register your microservice with basic information.

**Endpoint:** `POST /register`

**Request Body:**
```json
{
  "serviceName": "payment-service",
  "version": "1.0.0",
  "endpoint": "http://payment-service:5000",
  "healthCheck": "/health"
}
```

**Simplified Format (Alternative):**
```json
{
  "name": "payment-service",
  "url": "http://payment-service:5000",
  "grpc": 50052
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Service registered successfully",
  "serviceId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending_migration"
}
```

**Important:** After Stage 1, your service is in `pending_migration` status. You must complete Stage 2 to become `active`.

---

#### **Stage 2: Migration File Upload**

Upload detailed service information to activate your service.

**Endpoint:** `POST /register/{serviceId}/migration`

**Request Body:**
```json
{
  "migrationFile": {
    "version": "1.0.0",
    "description": "Payment processing microservice for handling transactions, refunds, and billing",
    "tables": ["payments", "transactions", "refunds"],
    "api": {
      "endpoints": [
        {
          "path": "/api/payments/process",
          "method": "POST",
          "description": "Process a payment transaction"
        },
        {
          "path": "/api/payments/refund",
          "method": "POST",
          "description": "Process a refund"
        }
      ]
    },
    "capabilities": [
      "process_payments",
      "process payments",
      "handle payments",
      "billing",
      "refunds",
      "transactions",
      "payment processing"
    ],
    "events": {
      "publishes": ["payment.completed", "payment.failed"],
      "subscribes": ["order.created"]
    }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Migration file uploaded successfully",
  "serviceId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "active"
}
```

**After Stage 2:** Your service is now `active` and can be discovered and routed to by other services.

---

### 2. Service Discovery

#### **Get All Services**

**Endpoint:** `GET /services` or `GET /registry`

**Response:**
```json
{
  "success": true,
  "services": [
    {
      "serviceName": "payment-service",
      "version": "1.0.0",
      "endpoint": "http://payment-service:5000",
      "status": "active",
      "registeredAt": "2025-11-28T12:00:00Z"
    },
    {
      "serviceName": "user-service",
      "version": "1.0.0",
      "endpoint": "http://user-service:3000",
      "status": "active",
      "registeredAt": "2025-11-28T11:30:00Z"
    }
  ],
  "total": 2
}
```

---

### 3. AI-Powered Routing

#### **Route a Request (GET)**

**Endpoint:** `GET /route?q={query}`

**Example:**
```bash
GET /route?q=process payment for order 123
```

**Response:**
```json
{
  "success": true,
  "routing": {
    "method": "ai",
    "primaryTarget": {
      "serviceName": "payment-service",
      "endpoint": "http://payment-service:5000",
      "confidence": 0.95,
      "reasoning": "The query explicitly mentions payment processing, which matches the payment-service capabilities"
    },
    "targetServices": [
      {
        "serviceName": "payment-service",
        "endpoint": "http://payment-service:5000",
        "confidence": 0.95,
        "reasoning": "..."
      }
    ],
    "strategy": "single",
    "processingTime": 1234
  }
}
```

---

#### **Route a Request (POST)**

**Endpoint:** `POST /route`

**Request Body:**
```json
{
  "query": "get user profile for user 456",
  "routing": {
    "strategy": "single",
    "priority": "accuracy"
  }
}
```

**Response:**
```json
{
  "success": true,
  "routing": {
    "method": "ai",
    "primaryTarget": {
      "serviceName": "user-service",
      "endpoint": "http://user-service:3000",
      "confidence": 0.92,
      "reasoning": "User profile queries are handled by user-service"
    },
    "targetServices": [...],
    "strategy": "single",
    "processingTime": 1156
  }
}
```

---

### 4. Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "uptime": 3600,
  "registeredServices": 5,
  "activeServices": 4
}
```

---

### 5. Knowledge Graph

**Endpoint:** `GET /knowledge-graph`

**Response:**
```json
{
  "metadata": {
    "totalServices": 4,
    "activeServices": 3,
    "lastUpdated": "2025-11-28T12:00:00Z",
    "version": 42
  },
  "nodes": [
    {
      "id": "service-id-1",
      "label": "payment-service",
      "type": "microservice",
      "data": {
        "serviceName": "payment-service",
        "version": "1.0.0",
        "endpoint": "http://payment-service:5000",
        "status": "active"
      }
    }
  ],
  "edges": [],
  "relationships": []
}
```

---

## 🔌 gRPC Endpoints

### Coordinator Service

The Coordinator exposes a gRPC service for RAG (Retrieval-Augmented Generation) integration and high-performance routing.

**Service:** `rag.v1.CoordinatorService`

**Proto Definition:**
```protobuf
service CoordinatorService {
  rpc Route (RouteRequest) returns (RouteResponse);
}

message RouteRequest {
  string tenant_id = 1;
  string user_id = 2;
  string query_text = 3;
  map<string, string> metadata = 4;
}

message RouteResponse {
  repeated string target_services = 1;
  map<string, string> normalized_fields = 2;
  string envelope_json = 3;
  string routing_metadata = 4;
}
```

---

### Route RPC

**Method:** `Route`

**Request:**
```javascript
{
  tenant_id: "tenant-123",
  user_id: "user-456",
  query_text: "process payment for order 789",
  metadata: {
    source: "rag",
    priority: "high"
  }
}
```

**Response:**
```javascript
{
  target_services: ["payment-service"],
  normalized_fields: {
    "order_id": "789",
    "action": "process_payment"
  },
  envelope_json: "{ ... Universal Envelope JSON ... }",
  routing_metadata: "{ ... routing information ... }"
}
```

---

## 📝 Service Registration Process

### Complete Registration Flow

Here's the complete two-stage registration process:

#### **Step 1: Register Basic Service Information**

```bash
curl -X POST http://coordinator:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "payment-service",
    "version": "1.0.0",
    "endpoint": "http://payment-service:5000",
    "healthCheck": "/health"
  }'
```

**Response:**
```json
{
  "success": true,
  "serviceId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending_migration"
}
```

**Save the `serviceId`** - you'll need it for Stage 2.

---

#### **Step 2: Upload Migration File**

```bash
curl -X POST http://coordinator:3000/register/550e8400-e29b-41d4-a716-446655440000/migration \
  -H "Content-Type: application/json" \
  -d '{
    "migrationFile": {
      "version": "1.0.0",
      "description": "Payment processing microservice",
      "tables": ["payments", "transactions"],
      "api": {
        "endpoints": [
          {
            "path": "/api/payments/process",
            "method": "POST",
            "description": "Process payment"
          }
        ]
      },
      "capabilities": [
        "process_payments",
        "billing",
        "refunds"
      ],
      "events": {
        "publishes": ["payment.completed"],
        "subscribes": ["order.created"]
      }
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "status": "active"
}
```

**Your service is now active!** 🎉

---

### Registration Status

- **`pending_migration`**: Service registered but migration file not uploaded (Stage 1 only)
- **`active`**: Service fully registered and available for routing (Stage 1 + Stage 2 complete)

**Important:** Only `active` services can be discovered and routed to by the AI routing system.

---

## 🔍 Service Discovery

### Finding Other Services

Once your service is registered, you can discover other services in the network:

#### **1. Get All Services**

```bash
curl http://coordinator:3000/services
```

#### **2. Filter Active Services**

```javascript
const response = await fetch('http://coordinator:3000/services');
const data = await response.json();

const activeServices = data.services.filter(s => s.status === 'active');
console.log('Active services:', activeServices);
```

#### **3. Find Specific Service**

```javascript
const services = await fetch('http://coordinator:3000/services')
  .then(r => r.json());

const paymentService = services.services.find(
  s => s.serviceName === 'payment-service' && s.status === 'active'
);

if (paymentService) {
  console.log('Payment service endpoint:', paymentService.endpoint);
  // Use paymentService.endpoint to make requests
}
```

---

## 🌐 Inter-Service Communication

### Method 1: Direct Communication (Service Discovery)

Your service can discover other services and communicate directly:

```javascript
// 1. Discover services
const servicesResponse = await fetch('http://coordinator:3000/services');
const { services } = await servicesResponse.json();

// 2. Find the service you need
const userService = services.find(s => 
  s.serviceName === 'user-service' && s.status === 'active'
);

// 3. Make direct request to that service
if (userService) {
  const userResponse = await fetch(`${userService.endpoint}/api/users/123`);
  const userData = await userResponse.json();
  console.log('User data:', userData);
}
```

---

### Method 2: Coordinator Routing (AI-Powered)

Let the Coordinator route requests intelligently:

```javascript
// Ask Coordinator to route your request
const routingResponse = await fetch('http://coordinator:3000/route', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'get user profile for user 123'
  })
});

const routing = await routingResponse.json();

// Coordinator tells you which service to use
if (routing.success && routing.routing.primaryTarget) {
  const targetService = routing.routing.primaryTarget;
  console.log('Route to:', targetService.serviceName);
  console.log('Endpoint:', targetService.endpoint);
  console.log('Confidence:', targetService.confidence);
  
  // Now make request to the target service
  const response = await fetch(`${targetService.endpoint}/api/users/123`);
}
```

---

### Method 3: Smart Proxy (Automatic Routing)

The Coordinator can automatically proxy requests to the right service:

```javascript
// Just send your request to the Coordinator
// It will automatically route to the correct service
const response = await fetch('http://coordinator:3000/api/users/123', {
  method: 'GET'
});

// Coordinator routes this to user-service automatically
const userData = await response.json();
```

**Note:** The proxy uses AI routing to determine which service should handle the request based on the path and method.

---

## 💻 Code Examples

### Node.js/JavaScript

#### **Complete Registration Example**

```javascript
const axios = require('axios');

const COORDINATOR_URL = process.env.COORDINATOR_URL || 'http://localhost:3000';

async function registerService() {
  try {
    // Stage 1: Basic Registration
    console.log('Stage 1: Registering service...');
    const stage1Response = await axios.post(`${COORDINATOR_URL}/register`, {
      serviceName: 'payment-service',
      version: '1.0.0',
      endpoint: 'http://payment-service:5000',
      healthCheck: '/health'
    });

    const serviceId = stage1Response.data.serviceId;
    console.log('Service ID:', serviceId);
    console.log('Status:', stage1Response.data.status); // pending_migration

    // Stage 2: Upload Migration File
    console.log('Stage 2: Uploading migration file...');
    const stage2Response = await axios.post(
      `${COORDINATOR_URL}/register/${serviceId}/migration`,
      {
        migrationFile: {
          version: '1.0.0',
          description: 'Payment processing microservice',
          tables: ['payments', 'transactions', 'refunds'],
          api: {
            endpoints: [
              {
                path: '/api/payments/process',
                method: 'POST',
                description: 'Process a payment transaction'
              },
              {
                path: '/api/payments/refund',
                method: 'POST',
                description: 'Process a refund'
              }
            ]
          },
          capabilities: [
            'process_payments',
            'process payments',
            'handle payments',
            'billing',
            'refunds',
            'transactions'
          ],
          events: {
            publishes: ['payment.completed', 'payment.failed'],
            subscribes: ['order.created']
          }
        }
      }
    );

    console.log('Registration complete!');
    console.log('Status:', stage2Response.data.status); // active
    return serviceId;

  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
    throw error;
  }
}

// Discover other services
async function discoverServices() {
  try {
    const response = await axios.get(`${COORDINATOR_URL}/services`);
    const activeServices = response.data.services.filter(
      s => s.status === 'active'
    );
    console.log('Active services:', activeServices);
    return activeServices;
  } catch (error) {
    console.error('Discovery failed:', error.message);
    throw error;
  }
}

// Use AI routing to find a service
async function routeRequest(query) {
  try {
    const response = await axios.post(`${COORDINATOR_URL}/route`, {
      query: query,
      routing: {
        strategy: 'single',
        priority: 'accuracy'
      }
    });

    if (response.data.success && response.data.routing.primaryTarget) {
      const target = response.data.routing.primaryTarget;
      console.log(`Route to: ${target.serviceName}`);
      console.log(`Endpoint: ${target.endpoint}`);
      console.log(`Confidence: ${target.confidence}`);
      return target;
    }
  } catch (error) {
    console.error('Routing failed:', error.message);
    throw error;
  }
}

// Example usage
(async () => {
  // Register your service
  await registerService();

  // Discover other services
  const services = await discoverServices();

  // Route a request
  const target = await routeRequest('process payment for order 123');
  
  // Make request to target service
  if (target) {
    const paymentResponse = await axios.post(
      `${target.endpoint}/api/payments/process`,
      { orderId: '123', amount: 100.50 }
    );
    console.log('Payment processed:', paymentResponse.data);
  }
})();
```

---

### Python

#### **Complete Registration Example**

```python
import requests
import os

COORDINATOR_URL = os.getenv('COORDINATOR_URL', 'http://localhost:3000')

def register_service():
    """Register a microservice with the Coordinator"""
    try:
        # Stage 1: Basic Registration
        print('Stage 1: Registering service...')
        stage1_response = requests.post(
            f'{COORDINATOR_URL}/register',
            json={
                'serviceName': 'payment-service',
                'version': '1.0.0',
                'endpoint': 'http://payment-service:5000',
                'healthCheck': '/health'
            }
        )
        stage1_response.raise_for_status()
        
        service_id = stage1_response.json()['serviceId']
        print(f'Service ID: {service_id}')
        print(f'Status: {stage1_response.json()["status"]}')  # pending_migration

        # Stage 2: Upload Migration File
        print('Stage 2: Uploading migration file...')
        stage2_response = requests.post(
            f'{COORDINATOR_URL}/register/{service_id}/migration',
            json={
                'migrationFile': {
                    'version': '1.0.0',
                    'description': 'Payment processing microservice',
                    'tables': ['payments', 'transactions', 'refunds'],
                    'api': {
                        'endpoints': [
                            {
                                'path': '/api/payments/process',
                                'method': 'POST',
                                'description': 'Process a payment transaction'
                            },
                            {
                                'path': '/api/payments/refund',
                                'method': 'POST',
                                'description': 'Process a refund'
                            }
                        ]
                    },
                    'capabilities': [
                        'process_payments',
                        'process payments',
                        'handle payments',
                        'billing',
                        'refunds',
                        'transactions'
                    ],
                    'events': {
                        'publishes': ['payment.completed', 'payment.failed'],
                        'subscribes': ['order.created']
                    }
                }
            }
        )
        stage2_response.raise_for_status()
        
        print('Registration complete!')
        print(f'Status: {stage2_response.json()["status"]}')  # active
        return service_id

    except requests.exceptions.RequestException as e:
        print(f'Registration failed: {e}')
        if hasattr(e.response, 'json'):
            print(f'Error details: {e.response.json()}')
        raise

def discover_services():
    """Discover all registered services"""
    try:
        response = requests.get(f'{COORDINATOR_URL}/services')
        response.raise_for_status()
        
        data = response.json()
        active_services = [
            s for s in data['services'] 
            if s['status'] == 'active'
        ]
        print(f'Active services: {active_services}')
        return active_services
    except requests.exceptions.RequestException as e:
        print(f'Discovery failed: {e}')
        raise

def route_request(query):
    """Use AI routing to find the right service"""
    try:
        response = requests.post(
            f'{COORDINATOR_URL}/route',
            json={
                'query': query,
                'routing': {
                    'strategy': 'single',
                    'priority': 'accuracy'
                }
            }
        )
        response.raise_for_status()
        
        data = response.json()
        if data['success'] and data['routing']['primaryTarget']:
            target = data['routing']['primaryTarget']
            print(f"Route to: {target['serviceName']}")
            print(f"Endpoint: {target['endpoint']}")
            print(f"Confidence: {target['confidence']}")
            return target
    except requests.exceptions.RequestException as e:
        print(f'Routing failed: {e}')
        raise

# Example usage
if __name__ == '__main__':
    # Register your service
    service_id = register_service()
    
    # Discover other services
    services = discover_services()
    
    # Route a request
    target = route_request('process payment for order 123')
    
    # Make request to target service
    if target:
        payment_response = requests.post(
            f"{target['endpoint']}/api/payments/process",
            json={'orderId': '123', 'amount': 100.50}
        )
        print('Payment processed:', payment_response.json())
```

---

### cURL Examples

#### **Complete Registration**

```bash
#!/bin/bash

COORDINATOR_URL="http://localhost:3000"

# Stage 1: Register service
echo "Stage 1: Registering service..."
STAGE1_RESPONSE=$(curl -s -X POST "$COORDINATOR_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "payment-service",
    "version": "1.0.0",
    "endpoint": "http://payment-service:5000",
    "healthCheck": "/health"
  }')

SERVICE_ID=$(echo $STAGE1_RESPONSE | jq -r '.serviceId')
echo "Service ID: $SERVICE_ID"

# Stage 2: Upload migration file
echo "Stage 2: Uploading migration file..."
curl -X POST "$COORDINATOR_URL/register/$SERVICE_ID/migration" \
  -H "Content-Type: application/json" \
  -d '{
    "migrationFile": {
      "version": "1.0.0",
      "description": "Payment processing microservice",
      "tables": ["payments", "transactions"],
      "api": {
        "endpoints": [
          {
            "path": "/api/payments/process",
            "method": "POST",
            "description": "Process payment"
          }
        ]
      },
      "capabilities": ["process_payments", "billing", "refunds"],
      "events": {
        "publishes": ["payment.completed"],
        "subscribes": ["order.created"]
      }
    }
  }'

echo ""
echo "Registration complete!"
```

---

## ✅ Best Practices

### 1. **Registration**

- ✅ Always complete both stages of registration
- ✅ Provide detailed `capabilities` in migration file (helps AI routing)
- ✅ Include accurate `description` and `tables` for better routing
- ✅ Register your service on startup
- ✅ Include health check endpoint

### 2. **Service Discovery**

- ✅ Cache service endpoints (they don't change frequently)
- ✅ Handle service unavailability gracefully
- ✅ Check service status before making requests
- ✅ Use service discovery for dynamic environments

### 3. **Inter-Service Communication**

- ✅ Use Coordinator routing for intelligent request routing
- ✅ Implement retry logic for service calls
- ✅ Handle timeouts appropriately
- ✅ Log service interactions for debugging

### 4. **Health Checks**

- ✅ Implement `/health` endpoint in your service
- ✅ Return meaningful health status
- ✅ Include service dependencies in health check

### 5. **Migration Files**

- ✅ Be descriptive in `capabilities` (use natural language)
- ✅ List all API endpoints
- ✅ Include event publishing/subscribing information
- ✅ Keep migration file up-to-date when service changes

---

## 🔧 Troubleshooting

### Service Not Appearing in Discovery

**Problem:** Service registered but not showing in `/services` endpoint

**Solutions:**
1. Check service status - must be `active` (complete Stage 2)
2. Verify Supabase connection (if using database)
3. Check service logs for registration errors

---

### AI Routing Not Finding Service

**Problem:** AI routing returns low confidence or wrong service

**Solutions:**
1. Ensure service is `active` (not `pending_migration`)
2. Improve `capabilities` in migration file (use natural language)
3. Add more descriptive `description` field
4. Include relevant `tables` in migration file

---

### Registration Fails

**Problem:** `POST /register` returns error

**Solutions:**
1. Verify `serviceName` is unique
2. Check `endpoint` is a valid URL
3. Ensure `version` follows semver format
4. Verify Coordinator is running and accessible

---

### gRPC Connection Issues

**Problem:** Cannot connect to gRPC server

**Solutions:**
1. Check `GRPC_PORT` environment variable (default: 50051)
2. Verify gRPC server is running
3. Check firewall/network rules
4. Ensure proto file matches client expectations

---

## 📚 Additional Resources

- **API Documentation**: See `ENDPOINTS_GUIDE.md` for complete endpoint reference
- **AI Routing Guide**: See `AI_ROUTING_GUIDE.md` for AI routing details
- **Knowledge Graph**: See `KNOWLEDGE_GRAPH_SETUP.md` for graph visualization

---

## 🚀 Quick Start Checklist

- [ ] Register service (Stage 1)
- [ ] Upload migration file (Stage 2)
- [ ] Verify service is `active`
- [ ] Test service discovery
- [ ] Test AI routing
- [ ] Implement health check endpoint
- [ ] Set up inter-service communication
- [ ] Monitor service health

---

**Happy Networking! 🎉**

For questions or issues, check the logs or contact the core team.

