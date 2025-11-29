# Feature 04: Knowledge Graph

**Status:** ✅ Active  
**Owner:** core-team  
**Last Updated:** 2025-01-XX

---

## Description

Knowledge Graph provides a visual representation of all registered services and their relationships. It automatically builds a graph structure showing service dependencies, capabilities, and interconnections. The graph can be persisted to Supabase for durability and rebuilt on demand.

---

## Source Files

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/routes/knowledgeGraph.js` | Route | ~67 | Knowledge graph endpoints |
| `src/services/knowledgeGraphService.js` | Service | ~451 | Graph building & management |

---

## Dependencies

### Incoming Dependencies (Features that depend on this)
- None (standalone feature)

### Outgoing Dependencies (Features this depends on)
- Service Registration & Management (circular - lazy loaded)
- Database Integration (optional - Supabase persistence)
- Shared utilities (logger)

---

## API Endpoints

### HTTP Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/knowledge-graph` | Get knowledge graph |
| `GET` | `/graph` | Alias for /knowledge-graph |
| `GET` | `/knowledge-graph?rebuild=true` | Force rebuild graph |
| `POST` | `/knowledge-graph/rebuild` | Rebuild graph |

### gRPC Endpoints

None

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUPABASE_URL` | No | - | Supabase database URL (optional) |
| `SUPABASE_ANON_KEY` | No | - | Supabase anonymous key (optional) |

**Note:** If Supabase is not configured, the graph is stored in-memory only.

---

## Testing Instructions

### Get Knowledge Graph

```bash
# Get current graph
curl http://localhost:3000/knowledge-graph

# Using alias
curl http://localhost:3000/graph
```

### Rebuild Graph

```bash
# Force rebuild via query parameter
curl "http://localhost:3000/knowledge-graph?rebuild=true"

# Rebuild via POST
curl -X POST http://localhost:3000/knowledge-graph/rebuild
```

---

## Metrics

The following metrics are tracked:

- **Graph Rebuilds Total** (`coordinator_graph_rebuilds_total`)
  - Counter metric tracking graph rebuilds

- **Graph Size** (`coordinator_graph_nodes_total`)
  - Gauge metric tracking number of nodes

- **Graph Edges** (`coordinator_graph_edges_total`)
  - Gauge metric tracking number of edges

- **Graph Build Time** (`coordinator_graph_build_time_ms`)
  - Histogram metric tracking build performance

Access metrics via: `GET /metrics`

---

## Future Enhancements

1. **Graph Visualization**
   - Interactive graph visualization UI
   - Real-time graph updates

2. **Relationship Types**
   - Support for different relationship types
   - Relationship metadata

3. **Graph Queries**
   - Query language for graph traversal
   - Complex relationship queries

4. **Graph Analytics**
   - Service dependency analysis
   - Impact analysis for changes

5. **Graph Versioning**
   - Track graph changes over time
   - Graph history and rollback

6. **Graph Export/Import**
   - Export graph to various formats
   - Import graph from external sources

---

## Related Documentation

- [Knowledge Graph Setup](../../KNOWLEDGE_GRAPH_SETUP.md)
- [Troubleshooting Knowledge Graph](../../TROUBLESHOOTING_KNOWLEDGE_GRAPH.md)


