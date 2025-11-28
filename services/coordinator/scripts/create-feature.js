#!/usr/bin/env node

/**
 * Feature Creation Automation Script
 * Generates route, service, and documentation files for new features
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function replacePlaceholders(template, replacements) {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

async function main() {
  console.log('\n🚀 Coordinator Feature Creation Tool\n');
  console.log('=' .repeat(50));

  try {
    // Get feature name
    let featureName = await question('Feature name (kebab-case, e.g., user-authentication): ');
    featureName = toKebabCase(featureName.trim());
    
    if (!featureName) {
      console.error('❌ Feature name is required');
      process.exit(1);
    }

    // Check if feature already exists
    const routePath = path.join(__dirname, '../src/routes', `${featureName}.js`);
    if (fs.existsSync(routePath)) {
      const overwrite = await question(`⚠️  Feature "${featureName}" already exists. Overwrite? (y/N): `);
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ Cancelled');
        process.exit(0);
      }
    }

    // Get description
    const description = await question('Description (one-line): ') || `${featureName} feature`;

    // Get owner
    const owner = await question('Owner (team/person): ') || 'core-team';

    // Get dependencies
    const depsInput = await question('Dependencies (comma-separated, or "none"): ') || 'none';
    const dependencies = depsInput.toLowerCase() === 'none' ? 'none' : depsInput;

    // Get endpoint path
    const endpointPath = await question(`HTTP endpoint path (default: /${featureName}): `) || featureName;

    // Check if gRPC needed
    const needsGrpc = await question('Does this feature need gRPC? (y/N): ');
    const hasGrpc = needsGrpc.toLowerCase() === 'y';

    let grpcService = '';
    let grpcMethod = '';
    if (hasGrpc) {
      grpcService = await question('gRPC Service name (e.g., CoordinatorService): ') || 'CoordinatorService';
      grpcMethod = await question('gRPC Method name (e.g., Route): ') || 'Process';
    }

    // Get feature number (for documentation)
    const featureNum = await question('Feature number (for docs, e.g., 13): ') || '13';

    // Get status
    const status = await question('Status (Active/Beta/Planned, default: Active): ') || 'Active';

    console.log('\n📋 Summary:');
    console.log(`  Feature: ${featureName}`);
    console.log(`  Description: ${description}`);
    console.log(`  Owner: ${owner}`);
    console.log(`  Dependencies: ${dependencies}`);
    console.log(`  Endpoint: /${endpointPath}`);
    console.log(`  gRPC: ${hasGrpc ? `Yes (${grpcService}.${grpcMethod})` : 'No'}`);
    console.log(`  Status: ${status}`);

    const confirm = await question('\n✅ Create feature? (Y/n): ');
    if (confirm.toLowerCase() === 'n') {
      console.log('❌ Cancelled');
      process.exit(0);
    }

    console.log('\n🔨 Generating files...');

    // Read templates
    const templatesDir = path.join(__dirname, '../templates');
    const routeTemplate = fs.readFileSync(path.join(templatesDir, 'route.template.js'), 'utf8');
    const serviceTemplate = fs.readFileSync(path.join(templatesDir, 'service.template.js'), 'utf8');
    const docTemplate = fs.readFileSync(path.join(templatesDir, 'feature-doc.template.md'), 'utf8');

    // Prepare replacements
    const pascalName = toPascalCase(featureName);
    const camelName = toCamelCase(featureName);
    const date = new Date().toISOString().split('T')[0];

    const replacements = {
      FEATURE_NAME: featureName,
      FEATURE_NAME_PASCAL: pascalName,
      FEATURE_NAME_CAMEL: camelName,
      DESCRIPTION: description,
      OWNER: owner,
      DEPENDENCIES: dependencies,
      ENDPOINT_PATH: endpointPath,
      SERVICE_NAME: grpcService,
      METHOD_NAME: grpcMethod,
      DATE: date,
      NN: featureNum.padStart(2, '0'),
      STATUS: status,
      ENV_VAR: 'FEATURE_ENABLED',
      REQUIRED: 'No',
      DEFAULT: 'true',
      INCOMING_DEPS: 'None',
      OUTGOING_DEPS: dependencies === 'none' ? 'None' : dependencies,
      METRIC_NAME: `${featureName}_operations`,
      METRIC_TYPE: 'Counter',
      ENHANCEMENT_1: 'Feature Enhancement 1',
      ENHANCEMENT_2: 'Feature Enhancement 2'
    };

    // Generate route file
    const routeContent = replacePlaceholders(routeTemplate, replacements);
    const routeFile = path.join(__dirname, '../src/routes', `${featureName}.js`);
    fs.writeFileSync(routeFile, routeContent);
    console.log(`  ✓ Created: src/routes/${featureName}.js`);

    // Generate service file
    const serviceContent = replacePlaceholders(serviceTemplate, replacements);
    const serviceFile = path.join(__dirname, '../src/services', `${camelName}Service.js`);
    fs.writeFileSync(serviceFile, serviceContent);
    console.log(`  ✓ Created: src/services/${camelName}Service.js`);

    // Generate documentation
    const docContent = replacePlaceholders(docTemplate, replacements);
    const docFile = path.join(__dirname, '../docs/features', `${featureNum.padStart(2, '0')}-${featureName}.md`);
    fs.writeFileSync(docFile, docContent);
    console.log(`  ✓ Created: docs/features/${featureNum.padStart(2, '0')}-${featureName}.md`);

    // Generate gRPC method if needed
    if (hasGrpc) {
      const grpcTemplate = fs.readFileSync(path.join(templatesDir, 'grpc-method.template.js'), 'utf8');
      const grpcContent = replacePlaceholders(grpcTemplate, replacements);
      const grpcFile = path.join(__dirname, '../src/grpc/services', `${camelName}.service.js`);
      fs.writeFileSync(grpcFile, grpcContent);
      console.log(`  ✓ Created: src/grpc/services/${camelName}.service.js`);
    }

    console.log('\n✅ Feature created successfully!\n');

    console.log('📝 Next Steps:');
    console.log('  1. Register route in src/index.js:');
    console.log(`     const ${camelName}Routes = require('./routes/${featureName}');`);
    console.log(`     app.use('/${endpointPath}', ${camelName}Routes);`);
    console.log('');
    console.log('  2. Implement business logic in service file');
    console.log('  3. Update feature documentation with details');
    console.log('  4. Add tests in test/ directory');
    console.log('  5. Run validation: npm run validate:features');
    console.log('  6. Test endpoints manually');
    console.log('');

    if (hasGrpc) {
      console.log('  7. Register gRPC method in grpc/server.js');
      console.log('  8. Update proto file if needed');
      console.log('');
    }

    console.log('📚 Documentation:');
    console.log(`  - Feature doc: docs/features/${featureNum.padStart(2, '0')}-${featureName}.md`);
    console.log('  - Guide: docs/guides/adding-features.md');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();

