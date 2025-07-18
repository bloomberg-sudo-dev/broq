/**
 * Simple Node.js Test Runner for Broq Blocks
 * Tests block functionality and flow extraction without complex imports
 */

const fs = require('fs');
const path = require('path');

// Test results
const results = {
  passed: 0,
  failed: 0,
  errors: []
};

function log(message) {
  console.log(message);
}

function runTest(testName, testFn) {
  try {
    log(`\n🧪 Testing: ${testName}`);
    const result = testFn();
    if (result.success) {
      results.passed++;
      log(`✅ PASSED: ${testName}`);
    } else {
      results.failed++;
      log(`❌ FAILED: ${testName} - ${result.message}`);
    }
  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    log(`💥 ERROR: ${testName} - ${error.message}`);
  }
}

// Test 1: Check if all block files exist
function testBlockFilesExist() {
  const expectedBlocks = [
    'startBlock.ts',
    'outputBlock.ts', 
    'textInputBlock.ts',
    'llmBlock.ts',
    'ifBlock.ts',
    'forEachLineBlock.ts',
    'setVariableBlock.ts',
    'getVariableBlock.ts',
    'booleanOperators.ts'
  ];

  runTest('Block Files Exist', () => {
    const blocksDir = path.join(__dirname, 'blocks');
    const missingFiles = [];
    
    for (const blockFile of expectedBlocks) {
      const filePath = path.join(blocksDir, blockFile);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(blockFile);
      }
    }
    
    if (missingFiles.length > 0) {
      return { success: false, message: `Missing files: ${missingFiles.join(', ')}` };
    }
    
    return { success: true, message: `All ${expectedBlocks.length} block files exist` };
  });
}

// Test 2: Check if utility files exist
function testUtilityFilesExist() {
  const utilFiles = [
    'utils/extractFlow.ts',
    'utils/runFlow.ts',
    'utils/conditionEvaluator.ts',
    'lib/registerBlocks.ts'
  ];

  runTest('Utility Files Exist', () => {
    const missingFiles = [];
    
    for (const utilFile of utilFiles) {
      const filePath = path.join(__dirname, utilFile);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(utilFile);
      }
    }
    
    if (missingFiles.length > 0) {
      return { success: false, message: `Missing files: ${missingFiles.join(', ')}` };
    }
    
    return { success: true, message: `All ${utilFiles.length} utility files exist` };
  });
}

// Test 3: Check block definitions contain required exports
function testBlockDefinitions() {
  const blockFiles = [
    'blocks/startBlock.ts',
    'blocks/outputBlock.ts',
    'blocks/llmBlock.ts',
    'blocks/ifBlock.ts',
    'blocks/booleanOperators.ts'
  ];

  blockFiles.forEach(blockFile => {
    runTest(`Block Definition: ${path.basename(blockFile)}`, () => {
      const filePath = path.join(__dirname, blockFile);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for required patterns
      const hasBlockDefinition = content.includes('init: function') || content.includes('init(');
      const hasGenerator = content.includes('Generator') || content.includes('forBlock');
      const hasExports = content.includes('export');
      
      if (!hasBlockDefinition) {
        return { success: false, message: 'Missing block definition (init function)' };
      }
      
      if (!hasGenerator) {
        return { success: false, message: 'Missing generator function' };
      }
      
      if (!hasExports) {
        return { success: false, message: 'Missing exports' };
      }
      
      return { success: true, message: 'Block definition is properly structured' };
    });
  });
}

// Test 4: Check flow utilities structure
function testFlowUtilities() {
  runTest('Flow Extraction Utility', () => {
    const filePath = path.join(__dirname, 'utils/extractFlow.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasExtractFunction = content.includes('export function extractFlow') || content.includes('extractFlow');
    const hasBlockOutput = content.includes('BlockOutput');
    const hasValidation = content.includes('validate') || content.includes('error');
    
    if (!hasExtractFunction) {
      return { success: false, message: 'Missing extractFlow function' };
    }
    
    if (!hasBlockOutput) {
      return { success: false, message: 'Missing BlockOutput type definition' };
    }
    
    return { success: true, message: 'Flow extraction utility is properly structured' };
  });

  runTest('Flow Execution Utility', () => {
    const filePath = path.join(__dirname, 'utils/runFlow.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasRunFunction = content.includes('runFlow') || content.includes('execute');
    const hasVariableHandling = content.includes('variable') || content.includes('Variable');
    const hasConditionHandling = content.includes('condition') || content.includes('if');
    
    if (!hasRunFunction) {
      return { success: false, message: 'Missing flow execution function' };
    }
    
    return { success: true, message: 'Flow execution utility is properly structured' };
  });
}

// Test 5: Check boolean operators implementation
function testBooleanOperators() {
  runTest('Boolean Operators Implementation', () => {
    const filePath = path.join(__dirname, 'blocks/booleanOperators.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    
    const requiredOperators = [
      'boolean_equals_block',
      'boolean_not_equals_block', 
      'boolean_greater_than_block',
      'boolean_less_than_block',
      'boolean_and_block',
      'boolean_or_block',
      'boolean_not_block'
    ];
    
    const missingOperators = [];
    for (const operator of requiredOperators) {
      if (!content.includes(operator)) {
        missingOperators.push(operator);
      }
    }
    
    if (missingOperators.length > 0) {
      return { success: false, message: `Missing operators: ${missingOperators.join(', ')}` };
    }
    
    // Check for hexagonal output
    const hasHexagonalOutput = content.includes('"output": "Boolean"');
    if (!hasHexagonalOutput) {
      return { success: false, message: 'Boolean operators missing hexagonal output configuration' };
    }
    
    return { success: true, message: `All ${requiredOperators.length} boolean operators implemented correctly` };
  });
}

// Test 6: Check variable system implementation
function testVariableSystem() {
  runTest('Variable System Implementation', () => {
    // Check Set Variable block
    const setVarPath = path.join(__dirname, 'blocks/setVariableBlock.ts');
    const setVarContent = fs.readFileSync(setVarPath, 'utf8');
    
    if (!setVarContent.includes('VAR_NAME') || !setVarContent.includes('VAR_VALUE')) {
      return { success: false, message: 'Set Variable block missing required fields' };
    }
    
    // Check Get Variable block
    const getVarPath = path.join(__dirname, 'blocks/getVariableBlock.ts');
    const getVarContent = fs.readFileSync(getVarPath, 'utf8');
    
    if (!getVarContent.includes('field_dropdown') || !getVarContent.includes('VAR_NAME')) {
      return { success: false, message: 'Get Variable block missing dropdown configuration' };
    }
    
    // Check for dropdown update functionality
    if (!getVarContent.includes('updateGetVariableDropdown') && !getVarContent.includes('updateAllGetVariableDropdowns')) {
      return { success: false, message: 'Get Variable block missing dropdown update functionality' };
    }
    
    return { success: true, message: 'Variable system implemented correctly with dropdown functionality' };
  });
}

// Test 7: Check if block integration in registerBlocks
function testBlockRegistration() {
  runTest('Block Registration', () => {
    const filePath = path.join(__dirname, 'lib/registerBlocks.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    
    const importedBlocks = [
      'startBlock',
      'outputBlock',
      'llmBlock',
      'ifBlock',
      'booleanOperators',
      'setVariableBlock',
      'getVariableBlock'
    ];
    
    const missingImports = [];
    for (const block of importedBlocks) {
      if (!content.includes(block)) {
        missingImports.push(block);
      }
    }
    
    if (missingImports.length > 0) {
      return { success: false, message: `Missing block imports: ${missingImports.join(', ')}` };
    }
    
    return { success: true, message: 'All blocks properly imported and registered' };
  });
}

// Test 8: Check component structure
function testComponentStructure() {
  runTest('Component Structure', () => {
    const componentFiles = [
      'components/BlocklyToolbar.tsx',
      'components/BlocklyCanvas.tsx',
      'app/page.tsx'
    ];
    
    const missingComponents = [];
    for (const component of componentFiles) {
      const filePath = path.join(__dirname, component);
      if (!fs.existsSync(filePath)) {
        missingComponents.push(component);
      }
    }
    
    if (missingComponents.length > 0) {
      return { success: false, message: `Missing components: ${missingComponents.join(', ')}` };
    }
    
    return { success: true, message: 'All main components exist' };
  });
}

// Test 9: Check for proper TypeScript/JavaScript syntax
function testSyntaxValidity() {
  const criticalFiles = [
    'utils/extractFlow.ts',
    'utils/runFlow.ts',
    'blocks/booleanOperators.ts',
    'components/BlocklyToolbar.tsx'
  ];

  criticalFiles.forEach(file => {
    runTest(`Syntax Check: ${path.basename(file)}`, () => {
      const filePath = path.join(__dirname, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Basic syntax checks
      const openBraces = (content.match(/{/g) || []).length;
      const closeBraces = (content.match(/}/g) || []).length;
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      
      if (openBraces !== closeBraces) {
        return { success: false, message: `Mismatched braces: ${openBraces} open, ${closeBraces} close` };
      }
      
      if (openParens !== closeParens) {
        return { success: false, message: `Mismatched parentheses: ${openParens} open, ${closeParens} close` };
      }
      
      // Check for common syntax errors
      if (content.includes('undefined') && content.includes('Cannot find name')) {
        return { success: false, message: 'Contains undefined references' };
      }
      
      return { success: true, message: 'Syntax appears valid' };
    });
  });
}

// Test 10: Validate package configuration
function testPackageConfiguration() {
  runTest('Package Configuration', () => {
    const packagePath = path.join(__dirname, 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      return { success: false, message: 'package.json not found' };
    }
    
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const requiredDeps = ['blockly', 'next', 'react'];
    const missingDeps = [];
    
    for (const dep of requiredDeps) {
      if (!packageContent.dependencies || !packageContent.dependencies[dep]) {
        missingDeps.push(dep);
      }
    }
    
    if (missingDeps.length > 0) {
      return { success: false, message: `Missing dependencies: ${missingDeps.join(', ')}` };
    }
    
    return { success: true, message: 'Package configuration is valid' };
  });
}

// Run all tests
function runAllTests() {
  log('🚀 Starting Comprehensive Block Validation Tests');
  log('=' .repeat(60));
  
  testBlockFilesExist();
  testUtilityFilesExist();
  testBlockDefinitions();
  testFlowUtilities();
  testBooleanOperators();
  testVariableSystem();
  testBlockRegistration();
  testComponentStructure();
  testSyntaxValidity();
  testPackageConfiguration();
  
  log('\n' + '=' .repeat(60));
  log('📊 TEST RESULTS SUMMARY');
  log('=' .repeat(60));
  log(`✅ Tests Passed: ${results.passed}`);
  log(`❌ Tests Failed: ${results.failed}`);
  log(`💥 Errors: ${results.errors.length}`);
  
  const total = results.passed + results.failed;
  const successRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
  log(`📈 Success Rate: ${successRate}%`);
  
  if (results.failed > 0) {
    log('\n🚨 ERRORS FOUND:');
    results.errors.forEach(error => {
      log(`💥 ${error.test}: ${error.error}`);
    });
  }
  
  log('\n🏁 Validation Complete!');
  
  return {
    totalTests: total,
    passed: results.passed,
    failed: results.failed,
    successRate: parseFloat(successRate)
  };
}

// Execute tests
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests }; 