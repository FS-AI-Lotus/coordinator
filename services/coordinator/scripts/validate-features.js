#!/usr/bin/env node

/**
 * Feature Validation Script
 * Validates that all files are properly tagged and documentation matches code
 */

const fs = require('fs');
const path = require('path');

const FEATURES_DIR = path.join(__dirname, '../docs/features');
const ROUTES_DIR = path.join(__dirname, '../src/routes');
const SERVICES_DIR = path.join(__dirname, '../src/services');
const GRPC_DIR = path.join(__dirname, '../src/grpc');
const MIDDLEWARE_DIR = path.join(__dirname, '../src/middleware');
const CONFIG_DIR = path.join(__dirname, '../src/config');

const FEATURE_NAMES = [
  'service-registration',
  'ai-routing',
  'dual-protocol',
  'knowledge-graph',
  'schema-registry',
  'changelog',
  'uiux',
  'smart-proxy',
  'monitoring',
  'communication-services',
  'security-validation',
  'database-integration'
];

let errors = [];
let warnings = [];
let stats = {
  filesChecked: 0,
  filesTagged: 0,
  filesMissingTags: 0,
  docsFound: 0,
  endpointsDocumented: 0,
  endpointsUndocumented: 0
};

/**
 * Extract feature tags from file content
 */
function extractTags(content) {
  const tagRegex = /@feature\s+([^\n]+)/;
  const descRegex = /@description\s+([^\n]+)/;
  const depsRegex = /@dependencies\s+([^\n]+)/;
  const ownerRegex = /@owner\s+([^\n]+)/;
  const httpRegex = /@http\s+([^\n]+)/g;
  const grpcRegex = /@grpc\s+([^\n]+)/g;

  const tags = {
    feature: null,
    description: null,
    dependencies: null,
    owner: null,
    http: [],
    grpc: []
  };

  const featureMatch = content.match(tagRegex);
  if (featureMatch) tags.feature = featureMatch[1].trim();

  const descMatch = content.match(descRegex);
  if (descMatch) tags.description = descMatch[1].trim();

  const depsMatch = content.match(depsRegex);
  if (depsMatch) tags.dependencies = depsMatch[1].trim();

  const ownerMatch = content.match(ownerRegex);
  if (ownerMatch) tags.owner = ownerMatch[1].trim();

  let httpMatch;
  while ((httpMatch = httpRegex.exec(content)) !== null) {
    tags.http.push(httpMatch[1].trim());
  }

  let grpcMatch;
  while ((grpcMatch = grpcRegex.exec(content)) !== null) {
    tags.grpc.push(grpcMatch[1].trim());
  }

  return tags;
}

/**
 * Check if file has feature tags
 */
function hasFeatureTags(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const tags = extractTags(content);
    return tags.feature !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Validate file tags
 */
function validateFile(filePath, relativePath) {
  stats.filesChecked++;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const tags = extractTags(content);

    if (!tags.feature) {
      stats.filesMissingTags++;
      errors.push(`❌ ${relativePath} - Missing @feature tag`);
      return false;
    }

    stats.filesTagged++;

    // Validate feature name
    if (!FEATURE_NAMES.includes(tags.feature)) {
      warnings.push(`⚠️  ${relativePath} - Unknown feature name: ${tags.feature}`);
    }

    // Check required tags
    if (!tags.description) {
      warnings.push(`⚠️  ${relativePath} - Missing @description tag`);
    }

    if (!tags.owner) {
      warnings.push(`⚠️  ${relativePath} - Missing @owner tag`);
    }

    return true;
  } catch (error) {
    errors.push(`❌ ${relativePath} - Error reading file: ${error.message}`);
    return false;
  }
}

/**
 * Scan directory for files
 */
function scanDirectory(dir, extensions = ['.js']) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...scanDirectory(fullPath, extensions));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

/**
 * Check feature documentation
 */
function checkDocumentation() {
  if (!fs.existsSync(FEATURES_DIR)) {
    warnings.push('⚠️  docs/features/ directory not found');
    return;
  }

  const docFiles = fs.readdirSync(FEATURES_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(FEATURES_DIR, f));

  stats.docsFound = docFiles.length;

  // Check if all features have docs
  for (const featureName of FEATURE_NAMES) {
    const docFile = docFiles.find(f => f.includes(featureName));
    if (!docFile) {
      warnings.push(`⚠️  Missing documentation for feature: ${featureName}`);
    }
  }
}

/**
 * Main validation function
 */
function main() {
  console.log('\n🔍 Feature Validation Tool\n');
  console.log('=' .repeat(50));
  console.log('');

  // Scan all directories
  const routeFiles = scanDirectory(ROUTES_DIR);
  const serviceFiles = scanDirectory(SERVICES_DIR);
  const grpcFiles = scanDirectory(GRPC_DIR);
  const middlewareFiles = scanDirectory(MIDDLEWARE_DIR);
  const configFiles = scanDirectory(CONFIG_DIR);

  const allFiles = [
    ...routeFiles,
    ...serviceFiles,
    ...grpcFiles,
    ...middlewareFiles,
    ...configFiles
  ];

  // Validate each file
  console.log('📁 Checking files for feature tags...\n');

  for (const filePath of allFiles) {
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    validateFile(filePath, relativePath);
  }

  // Check documentation
  console.log('📚 Checking feature documentation...\n');
  checkDocumentation();

  // Print results
  console.log('📊 Validation Results\n');
  console.log(`  Files checked: ${stats.filesChecked}`);
  console.log(`  Files tagged: ${stats.filesTagged}`);
  console.log(`  Files missing tags: ${stats.filesMissingTags}`);
  console.log(`  Feature docs found: ${stats.docsFound}`);
  console.log('');

  if (errors.length > 0) {
    console.log('❌ Errors:\n');
    errors.forEach(err => console.log(`  ${err}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:\n');
    warnings.forEach(warn => console.log(`  ${warn}`));
    console.log('');
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All validations passed!\n');
    process.exit(0);
  } else if (errors.length === 0) {
    console.log('⚠️  Validation completed with warnings\n');
    process.exit(0);
  } else {
    console.log('❌ Validation failed with errors\n');
    process.exit(1);
  }
}

main();

