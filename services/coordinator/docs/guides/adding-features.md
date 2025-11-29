# Adding Features to Coordinator

**Last Updated:** 2025-01-XX

---

## Quick Start (Using Automation)

The fastest way to add a new feature is using the automation script:

```bash
npm run create:feature
```

The script will:
1. Prompt for feature details (name, description, owner, dependencies)
2. Generate route, service, and documentation files
3. Use templates with proper structure
4. Add feature tags automatically
5. Provide next steps

**Time Estimate:** 5-10 minutes

---

## Manual Process (7 Steps)

If you prefer to create features manually or need custom implementation:

### Step 1: Plan Your Feature (15-30 min)

- [ ] Define feature name (kebab-case: `my-new-feature`)
- [ ] List required endpoints (HTTP and/or gRPC)
- [ ] Identify dependencies (other features)
- [ ] Determine environment variables needed
- [ ] Plan metrics to track

### Step 2: Create Route File (20-30 min)

Create `src/routes/[feature-name].js`:

```javascript
const express = require('express');
const router = express.Router();
const [featureName]Service = require('../services/[featureName]Service');
const logger = require('../utils/logger');
const { sanitizeInput } = require('../middleware/validation');

/**
 * @feature [feature-name]
 * @description [One-line description]
 * @dependencies [comma-separated or "none"]
 * @owner [team/person]
 * @http GET /[endpoint]
 */

router.get('/', async (req, res, next) => {
  // Implementation
});

module.exports = router;
```

### Step 3: Create Service File (30-60 min)

Create `src/services/[featureName]Service.js`:

```javascript
const logger = require('../utils/logger');

/**
 * @feature [feature-name]
 * @description [One-line description]
 * @dependencies [comma-separated or "none"]
 * @owner [team/person]
 */

class [FeatureName]Service {
  constructor() {
    // Initialization
  }

  // Service methods
}

module.exports = new [FeatureName]Service();
```

### Step 4: Register Routes (5 min)

Add to `src/index.js`:

```javascript
const [featureName]Routes = require('./routes/[featureName]');

// In routes section:
app.use('/[endpoint]', [featureName]Routes);
```

### Step 5: Add Feature Tags (5 min)

Add JSDoc tags to all files:
- Route file
- Service file
- Any gRPC handlers

### Step 6: Create Documentation (20-30 min)

Create `docs/features/[NN]-[feature-name].md`:

- Use template from `templates/feature-doc.template.md`
- Fill in all sections
- Add testing instructions
- Document environment variables

### Step 7: Test & Validate (15-30 min)

- [ ] Test all endpoints
- [ ] Run validation: `npm run validate:features`
- [ ] Update feature map if needed
- [ ] Update roadmap if it's a new planned feature

**Total Time Estimate:** 2-3 hours

---

## Complete Checklist

### Pre-Development
- [ ] Feature approved by team
- [ ] Dependencies identified
- [ ] API design reviewed
- [ ] Environment variables documented

### Development
- [ ] Route file created with tags
- [ ] Service file created with tags
- [ ] Routes registered in `src/index.js`
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] Logging added

### gRPC (if applicable)
- [ ] Proto file updated
- [ ] gRPC handler created with tags
- [ ] gRPC method registered

### Documentation
- [ ] Feature doc created in `docs/features/`
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Testing instructions added
- [ ] Metrics documented

### Testing
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Manual testing completed
- [ ] Edge cases tested

### Validation
- [ ] `npm run validate:features` passes
- [ ] All tags present
- [ ] Documentation matches code
- [ ] No broken references

### Integration
- [ ] Feature map updated
- [ ] Dependencies documented
- [ ] Metrics exposed
- [ ] Health check updated (if needed)

---

## Integration Rules

### Zero Breaking Changes

1. **Backward Compatibility**
   - New features must not break existing functionality
   - New endpoints should not conflict with existing ones
   - Environment variables should have defaults

2. **Optional Features**
   - Features should work without optional dependencies
   - Graceful degradation when dependencies unavailable
   - Clear error messages when required dependencies missing

3. **Error Handling**
   - All errors must be caught and handled
   - Errors should be logged
   - User-friendly error messages

4. **Validation**
   - All inputs must be validated
   - Use existing validation middleware
   - Sanitize all user inputs

5. **Logging**
   - Log all important operations
   - Use structured logging
   - Include context in logs

6. **Metrics**
   - Expose metrics for all operations
   - Use Prometheus format
   - Track success/failure rates

---

## Time Estimates

| Task | Time Estimate |
|------|---------------|
| **Quick Start (Automation)** | 5-10 minutes |
| **Manual Process (Full)** | 2-3 hours |
| Planning | 15-30 min |
| Route File | 20-30 min |
| Service File | 30-60 min |
| Route Registration | 5 min |
| Feature Tags | 5 min |
| Documentation | 20-30 min |
| Testing | 15-30 min |
| Validation | 5-10 min |

---

## Feature Naming Conventions

### File Names
- **Routes:** `[feature-name].js` (kebab-case)
- **Services:** `[featureName]Service.js` (camelCase)
- **Docs:** `[NN]-[feature-name].md` (numbered, kebab-case)

### Feature Names
- Use kebab-case: `my-new-feature`
- Be descriptive: `user-authentication` not `auth`
- Be specific: `payment-processing` not `payments`

### Class Names
- Use PascalCase: `PaymentProcessingService`
- Match feature name: `my-new-feature` → `MyNewFeatureService`

---

## Dependencies

### Adding Dependencies

When your feature depends on another feature:

1. **Import the service:**
   ```javascript
   const registryService = require('./registryService');
   ```

2. **Document in feature tags:**
   ```javascript
   /**
    * @dependencies service-registration, ai-routing
    */
   ```

3. **Document in feature doc:**
   - List in "Dependencies" section
   - Explain why dependency is needed

### Circular Dependencies

If you have a circular dependency:

1. **Use lazy loading:**
   ```javascript
   let otherService = null;
   function getOtherService() {
     if (!otherService) {
       otherService = require('./otherService');
     }
     return otherService;
   }
   ```

2. **Document the circular dependency:**
   - Note in feature tags
   - Explain in feature doc

---

## Testing Your Feature

### Unit Tests

Create test file: `test/[category]/test-[feature-name].js`

```javascript
const [featureName]Service = require('../../src/services/[featureName]Service');

describe('[FeatureName] Service', () => {
  // Tests
});
```

### Integration Tests

Test via HTTP:

```bash
curl -X POST http://localhost:3000/[endpoint] \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Validation

Run feature validation:

```bash
npm run validate:features
```

---

## Common Pitfalls

1. **Missing Feature Tags**
   - Always add JSDoc tags
   - Include all required fields

2. **Not Registering Routes**
   - Don't forget to add route in `src/index.js`
   - Check route order (proxy must be last)

3. **Missing Error Handling**
   - Always catch errors
   - Use error handler middleware

4. **Not Documenting**
   - Create feature doc
   - Document all endpoints
   - Document environment variables

5. **Breaking Changes**
   - Test existing functionality
   - Ensure backward compatibility

---

## Getting Help

- **Feature Documentation:** See `docs/features/` for examples
- **Templates:** See `templates/` for code templates
- **Architecture:** See `docs/architecture/` for system design
- **API Docs:** See `API_DOCUMENTATION.md` for API reference

---

## Next Steps

After creating your feature:

1. ✅ Run validation: `npm run validate:features`
2. ✅ Test all endpoints
3. ✅ Update feature map if needed
4. ✅ Create PR with feature
5. ✅ Get code review
6. ✅ Merge to main

---

**Happy Coding! 🚀**


