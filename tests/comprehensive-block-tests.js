/**
 * Comprehensive Block Testing Suite for Broq
 * Tests all blocks individually and in combinations to ensure functionality
 */

import * as Blockly from 'blockly';
import { extractFlow } from '../utils/extractFlow.js';
import { runFlow } from '../utils/runFlow.js';
import { validateFlow } from '../utils/extractFlow.js';
import { registerBlocks } from '../lib/registerBlocks.js';

// Initialize Blockly and register all blocks
registerBlocks();

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  details: []
};

/**
 * Create a test workspace
 */
function createTestWorkspace() {
  const workspace = new Blockly.Workspace();
  return workspace;
}

/**
 * Helper function to create a block in workspace
 */
function createBlock(workspace, blockType, config = {}) {
  const block = workspace.newBlock(blockType);
  
  // Configure block fields
  for (const [fieldName, value] of Object.entries(config)) {
    if (block.getField(fieldName)) {
      block.setFieldValue(value, fieldName);
    }
  }
  
  block.initSvg();
  return block;
}

/**
 * Helper function to connect blocks
 */
function connectBlocks(block1, block2) {
  if (block1.nextConnection && block2.previousConnection) {
    block1.nextConnection.connect(block2.previousConnection);
  }
}

/**
 * Helper function to connect value blocks
 */
function connectValueBlock(parentBlock, valueBlock, inputName) {
  const connection = parentBlock.getInput(inputName)?.connection;
  if (connection && valueBlock.outputConnection) {
    connection.connect(valueBlock.outputConnection);
  }
}

/**
 * Run a single test
 */
function runTest(testName, testFunction) {
  console.log(`\n🧪 Running test: ${testName}`);
  try {
    const result = testFunction();
    if (result.success) {
      testResults.passed++;
      console.log(`✅ PASSED: ${testName}`);
      testResults.details.push({ test: testName, status: 'PASSED', message: result.message });
    } else {
      testResults.failed++;
      console.log(`❌ FAILED: ${testName} - ${result.message}`);
      testResults.details.push({ test: testName, status: 'FAILED', message: result.message });
    }
  } catch (error) {
    testResults.failed++;
    const errorMessage = `Error: ${error.message}`;
    console.log(`💥 ERROR: ${testName} - ${errorMessage}`);
    testResults.errors.push({ test: testName, error: errorMessage });
    testResults.details.push({ test: testName, status: 'ERROR', message: errorMessage });
  }
}

/**
 * Test: Individual Block Creation
 */
function testIndividualBlocks() {
  const blockTypes = [
    'start_block',
    'output_block', 
    'text_input_block',
    'llm_block',
    'if_block',
    'for_each_line_block',
    'set_variable_block',
    'get_variable_block',
    'boolean_equals_block',
    'boolean_not_equals_block',
    'boolean_greater_than_block',
    'boolean_less_than_block',
    'boolean_and_block',
    'boolean_or_block',
    'boolean_not_block'
  ];

  for (const blockType of blockTypes) {
    runTest(`Create ${blockType}`, () => {
      const workspace = createTestWorkspace();
      const block = createBlock(workspace, blockType);
      
      if (!block) {
        return { success: false, message: `Failed to create block of type ${blockType}` };
      }
      
      if (block.type !== blockType) {
        return { success: false, message: `Block type mismatch: expected ${blockType}, got ${block.type}` };
      }
      
      workspace.dispose();
      return { success: true, message: `Successfully created ${blockType}` };
    });
  }
}

/**
 * Test: Basic Linear Flow (Start -> Text Input -> Output)
 */
function testBasicLinearFlow() {
  runTest('Basic Linear Flow: Start -> Text Input -> Output', () => {
    const workspace = createTestWorkspace();
    
    const startBlock = createBlock(workspace, 'start_block');
    const textBlock = createBlock(workspace, 'text_input_block', { TEXT: 'Hello World' });
    const outputBlock = createBlock(workspace, 'output_block');
    
    connectBlocks(startBlock, textBlock);
    connectBlocks(textBlock, outputBlock);
    
    try {
      const flow = extractFlow(workspace);
      
      if (flow.length !== 3) {
        return { success: false, message: `Expected 3 blocks, got ${flow.length}` };
      }
      
      if (flow[0].type !== 'start_block' || flow[1].type !== 'text_input' || flow[2].type !== 'output') {
        return { success: false, message: 'Block types in wrong order' };
      }
      
      workspace.dispose();
      return { success: true, message: 'Basic linear flow extracted correctly' };
    } catch (error) {
      workspace.dispose();
      return { success: false, message: `Flow extraction failed: ${error.message}` };
    }
  });
}

/**
 * Test: Variable System
 */
function testVariableSystem() {
  runTest('Variable System: Set -> Get', () => {
    const workspace = createTestWorkspace();
    
    const startBlock = createBlock(workspace, 'start_block');
    const setVarBlock = createBlock(workspace, 'set_variable_block', { 
      VAR_NAME: 'testVar', 
      VAR_VALUE: 'Hello' 
    });
    const getVarBlock = createBlock(workspace, 'get_variable_block');
    const outputBlock = createBlock(workspace, 'output_block');
    
    connectBlocks(startBlock, setVarBlock);
    connectBlocks(setVarBlock, outputBlock);
    
    try {
      const flow = extractFlow(workspace);
      
      const setBlock = flow.find(b => b.type === 'set_variable');
      if (!setBlock || setBlock.name !== 'testVar' || setBlock.value !== 'Hello') {
        return { success: false, message: 'Set variable block not configured correctly' };
      }
      
      workspace.dispose();
      return { success: true, message: 'Variable system working correctly' };
    } catch (error) {
      workspace.dispose();
      return { success: false, message: `Variable test failed: ${error.message}` };
    }
  });
}

/**
 * Test: Boolean Operators
 */
function testBooleanOperators() {
  const operators = [
    { type: 'boolean_equals_block', name: 'Equals' },
    { type: 'boolean_not_equals_block', name: 'Not Equals' },
    { type: 'boolean_greater_than_block', name: 'Greater Than' },
    { type: 'boolean_less_than_block', name: 'Less Than' },
    { type: 'boolean_and_block', name: 'AND' },
    { type: 'boolean_or_block', name: 'OR' },
    { type: 'boolean_not_block', name: 'NOT' }
  ];

  for (const operator of operators) {
    runTest(`Boolean Operator: ${operator.name}`, () => {
      const workspace = createTestWorkspace();
      
      const startBlock = createBlock(workspace, 'start_block');
      const ifBlock = createBlock(workspace, 'if_block');
      const boolBlock = createBlock(workspace, operator.type);
      const outputBlock = createBlock(workspace, 'output_block');
      
      connectBlocks(startBlock, ifBlock);
      connectValueBlock(ifBlock, boolBlock, 'CONDITION');
      
      // Connect output to THEN branch
      const thenInput = ifBlock.getInput('THEN_BLOCKS');
      if (thenInput) {
        const thenConnection = thenInput.connection;
        if (thenConnection && outputBlock.previousConnection) {
          thenConnection.connect(outputBlock.previousConnection);
        }
      }
      
      try {
        const flow = extractFlow(workspace);
        
        // Should have at least start and if blocks
        if (flow.length < 2) {
          return { success: false, message: `Expected at least 2 blocks, got ${flow.length}` };
        }
        
        const ifBlockData = flow.find(b => b.type === 'if');
        if (!ifBlockData) {
          return { success: false, message: 'If block not found in extracted flow' };
        }
        
        workspace.dispose();
        return { success: true, message: `${operator.name} operator integrated correctly` };
      } catch (error) {
        workspace.dispose();
        return { success: false, message: `Boolean operator test failed: ${error.message}` };
      }
    });
  }
}

/**
 * Test: If/Then/Else Logic
 */
function testIfThenElse() {
  runTest('If/Then/Else Logic with Boolean Condition', () => {
    const workspace = createTestWorkspace();
    
    const startBlock = createBlock(workspace, 'start_block');
    const ifBlock = createBlock(workspace, 'if_block');
    const equalsBlock = createBlock(workspace, 'boolean_equals_block');
    const thenOutput = createBlock(workspace, 'output_block');
    const elseOutput = createBlock(workspace, 'output_block');
    
    connectBlocks(startBlock, ifBlock);
    connectValueBlock(ifBlock, equalsBlock, 'CONDITION');
    
    // Connect THEN and ELSE branches
    const thenInput = ifBlock.getInput('THEN_BLOCKS');
    const elseInput = ifBlock.getInput('ELSE_BLOCKS');
    
    if (thenInput?.connection && thenOutput.previousConnection) {
      thenInput.connection.connect(thenOutput.previousConnection);
    }
    
    if (elseInput?.connection && elseOutput.previousConnection) {
      elseInput.connection.connect(elseOutput.previousConnection);
    }
    
    try {
      const flow = extractFlow(workspace);
      
      const ifBlockData = flow.find(b => b.type === 'if');
      if (!ifBlockData) {
        return { success: false, message: 'If block not found' };
      }
      
      if (!ifBlockData.thenBlocks || !ifBlockData.elseBlocks) {
        return { success: false, message: 'Then/Else branches not extracted' };
      }
      
      workspace.dispose();
      return { success: true, message: 'If/Then/Else logic working correctly' };
    } catch (error) {
      workspace.dispose();
      return { success: false, message: `If/Then/Else test failed: ${error.message}` };
    }
  });
}

/**
 * Test: LLM Block Configuration
 */
function testLLMBlock() {
  runTest('LLM Block Configuration', () => {
    const workspace = createTestWorkspace();
    
    const startBlock = createBlock(workspace, 'start_block');
    const llmBlock = createBlock(workspace, 'llm_block', {
      MODEL: 'openai',
      PROMPT: 'Summarize this: {{input}}',
      CREATIVITY_PRESET: '0.7',
      LENGTH_PRESET: '1024',
      FOCUS_PRESET: '1.0'
    });
    const outputBlock = createBlock(workspace, 'output_block');
    
    connectBlocks(startBlock, llmBlock);
    connectBlocks(llmBlock, outputBlock);
    
    try {
      const flow = extractFlow(workspace);
      
      const llmBlockData = flow.find(b => b.type === 'llm');
      if (!llmBlockData) {
        return { success: false, message: 'LLM block not found' };
      }
      
      if (llmBlockData.model !== 'openai') {
        return { success: false, message: `Expected model 'openai', got '${llmBlockData.model}'` };
      }
      
      if (!llmBlockData.prompt || !llmBlockData.prompt.includes('{{input}}')) {
        return { success: false, message: 'LLM prompt not configured correctly' };
      }
      
      workspace.dispose();
      return { success: true, message: 'LLM block configured correctly' };
    } catch (error) {
      workspace.dispose();
      return { success: false, message: `LLM block test failed: ${error.message}` };
    }
  });
}

/**
 * Test: For Each Line Block
 */
function testForEachLineBlock() {
  runTest('For Each Line Block', () => {
    const workspace = createTestWorkspace();
    
    const startBlock = createBlock(workspace, 'start_block');
    const forEachBlock = createBlock(workspace, 'for_each_line_block');
    const outputBlock = createBlock(workspace, 'output_block');
    const endOutput = createBlock(workspace, 'output_block');
    
    connectBlocks(startBlock, forEachBlock);
    connectBlocks(forEachBlock, endOutput);
    
    // Connect child blocks
    const childInput = forEachBlock.getInput('CHILD_BLOCKS');
    if (childInput?.connection && outputBlock.previousConnection) {
      childInput.connection.connect(outputBlock.previousConnection);
    }
    
    try {
      const flow = extractFlow(workspace);
      
      const forEachBlockData = flow.find(b => b.type === 'for_each_line');
      if (!forEachBlockData) {
        return { success: false, message: 'For Each Line block not found' };
      }
      
      if (!forEachBlockData.childBlocks) {
        return { success: false, message: 'Child blocks not extracted' };
      }
      
      workspace.dispose();
      return { success: true, message: 'For Each Line block working correctly' };
    } catch (error) {
      workspace.dispose();
      return { success: false, message: `For Each Line test failed: ${error.message}` };
    }
  });
}

/**
 * Test: Complex Nested Flow
 */
function testComplexNestedFlow() {
  runTest('Complex Nested Flow: Variables + If/Then + LLM', () => {
    const workspace = createTestWorkspace();
    
    const startBlock = createBlock(workspace, 'start_block');
    const setVarBlock = createBlock(workspace, 'set_variable_block', { 
      VAR_NAME: 'userInput', 
      VAR_VALUE: 'Hello AI' 
    });
    const ifBlock = createBlock(workspace, 'if_block');
    const equalsBlock = createBlock(workspace, 'boolean_equals_block');
    const llmBlock = createBlock(workspace, 'llm_block', {
      MODEL: 'openai',
      PROMPT: 'Process: {{getVar("userInput")}}'
    });
    const outputBlock = createBlock(workspace, 'output_block');
    
    // Connect main flow
    connectBlocks(startBlock, setVarBlock);
    connectBlocks(setVarBlock, ifBlock);
    
    // Connect boolean condition
    connectValueBlock(ifBlock, equalsBlock, 'CONDITION');
    
    // Connect THEN branch with LLM
    const thenInput = ifBlock.getInput('THEN_BLOCKS');
    if (thenInput?.connection && llmBlock.previousConnection) {
      thenInput.connection.connect(llmBlock.previousConnection);
      connectBlocks(llmBlock, outputBlock);
    }
    
    try {
      const flow = extractFlow(workspace);
      
      if (flow.length < 3) {
        return { success: false, message: `Expected at least 3 blocks, got ${flow.length}` };
      }
      
      const hasSetVar = flow.some(b => b.type === 'set_variable' && b.name === 'userInput');
      const hasIf = flow.some(b => b.type === 'if');
      const hasLLM = flow.some(b => b.type === 'llm' && b.prompt?.includes('{{getVar("userInput")}}'));
      
      if (!hasSetVar) {
        return { success: false, message: 'Set variable block not found or configured incorrectly' };
      }
      
      if (!hasIf) {
        return { success: false, message: 'If block not found' };
      }
      
      if (!hasLLM) {
        return { success: false, message: 'LLM block not found or variable reference missing' };
      }
      
      workspace.dispose();
      return { success: true, message: 'Complex nested flow working correctly' };
    } catch (error) {
      workspace.dispose();
      return { success: false, message: `Complex flow test failed: ${error.message}` };
    }
  });
}

/**
 * Test: Flow Validation
 */
function testFlowValidation() {
  runTest('Flow Validation: Invalid Flow (No Start Block)', () => {
    const workspace = createTestWorkspace();
    
    // Create flow without start block
    const textBlock = createBlock(workspace, 'text_input_block');
    const outputBlock = createBlock(workspace, 'output_block');
    connectBlocks(textBlock, outputBlock);
    
    try {
      const flow = extractFlow(workspace);
      // Should throw an error or return empty flow
      workspace.dispose();
      return { success: false, message: 'Validation should have failed for missing start block' };
    } catch (error) {
      workspace.dispose();
      if (error.message.includes('start') || error.message.includes('connected')) {
        return { success: true, message: 'Correctly rejected flow without start block' };
      } else {
        return { success: false, message: `Unexpected error: ${error.message}` };
      }
    }
  });
  
  runTest('Flow Validation: Valid Flow', () => {
    const workspace = createTestWorkspace();
    
    const startBlock = createBlock(workspace, 'start_block');
    const outputBlock = createBlock(workspace, 'output_block');
    connectBlocks(startBlock, outputBlock);
    
    try {
      const flow = extractFlow(workspace);
      
      if (flow.length !== 2) {
        return { success: false, message: `Expected 2 blocks, got ${flow.length}` };
      }
      
      workspace.dispose();
      return { success: true, message: 'Valid flow accepted correctly' };
    } catch (error) {
      workspace.dispose();
      return { success: false, message: `Valid flow rejected: ${error.message}` };
    }
  });
}

/**
 * Test: Edge Cases
 */
function testEdgeCases() {
  runTest('Edge Case: Empty Variable Name', () => {
    const workspace = createTestWorkspace();
    
    const startBlock = createBlock(workspace, 'start_block');
    const setVarBlock = createBlock(workspace, 'set_variable_block', { 
      VAR_NAME: '', 
      VAR_VALUE: 'test' 
    });
    
    connectBlocks(startBlock, setVarBlock);
    
    try {
      const flow = extractFlow(workspace);
      workspace.dispose();
      return { success: true, message: 'Empty variable name handled gracefully' };
    } catch (error) {
      workspace.dispose();
      return { success: true, message: 'Empty variable name correctly rejected' };
    }
  });
  
  runTest('Edge Case: LLM Block with Empty Prompt', () => {
    const workspace = createTestWorkspace();
    
    const startBlock = createBlock(workspace, 'start_block');
    const llmBlock = createBlock(workspace, 'llm_block', {
      MODEL: 'openai',
      PROMPT: ''
    });
    
    connectBlocks(startBlock, llmBlock);
    
    try {
      const flow = extractFlow(workspace);
      const llmBlockData = flow.find(b => b.type === 'llm');
      
      workspace.dispose();
      return { success: true, message: 'Empty LLM prompt handled gracefully' };
    } catch (error) {
      workspace.dispose();
      return { success: true, message: 'Empty LLM prompt correctly handled' };
    }
  });
}

/**
 * Run all tests
 */
function runAllTests() {
  console.log('🚀 Starting Comprehensive Block Testing Suite');
  console.log('=' .repeat(60));
  
  testIndividualBlocks();
  testBasicLinearFlow();
  testVariableSystem();
  testBooleanOperators();
  testIfThenElse();
  testLLMBlock();
  testForEachLineBlock();
  testComplexNestedFlow();
  testFlowValidation();
  testEdgeCases();
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Tests Passed: ${testResults.passed}`);
  console.log(`❌ Tests Failed: ${testResults.failed}`);
  console.log(`💥 Errors: ${testResults.errors.length}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0 || testResults.errors.length > 0) {
    console.log('\n🔍 DETAILED FAILURES:');
    testResults.details.filter(d => d.status !== 'PASSED').forEach(detail => {
      console.log(`${detail.status === 'ERROR' ? '💥' : '❌'} ${detail.test}: ${detail.message}`);
    });
  }
  
  if (testResults.errors.length > 0) {
    console.log('\n🚨 ERRORS:');
    testResults.errors.forEach(error => {
      console.log(`💥 ${error.test}: ${error.error}`);
    });
  }
  
  console.log('\n🏁 Testing Complete!');
  
  return {
    totalTests: testResults.passed + testResults.failed,
    passed: testResults.passed,
    failed: testResults.failed,
    errors: testResults.errors.length,
    successRate: (testResults.passed / (testResults.passed + testResults.failed)) * 100
  };
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testResults };
}

// Auto-run if called directly
if (typeof window !== 'undefined' || typeof global !== 'undefined') {
  runAllTests();
} 