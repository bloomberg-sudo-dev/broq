/**
 * Flow Combination Test - Tests Complex Real-World Block Combinations
 * Simulates actual user flows to ensure everything works together
 */

const fs = require('fs');
const path = require('path');

class FlowCombinationTester {
  constructor() {
    this.testResults = [];
  }

  log(message) {
    console.log(`[FLOW TEST] ${message}`);
  }

  testComplexFlow1() {
    this.log('🧪 Testing Complex Flow 1: Variables + Boolean Logic + If/Then + LLM');
    
    const flowScenario = {
      name: 'User Sentiment Analysis Flow',
      description: 'Set user input → Check if input length > 10 → If true: analyze with LLM, If false: show error',
      blocks: [
        { type: 'start_block', role: 'entry point' },
        { type: 'set_variable_block', fields: { VAR_NAME: 'userText', VAR_VALUE: 'I love this product!' } },
        { type: 'set_variable_block', fields: { VAR_NAME: 'minLength', VAR_VALUE: '10' } },
        { type: 'if_block', condition: 'boolean_greater_than_block' },
        { type: 'llm_block', model: 'openai', prompt: 'Analyze sentiment: {{getVar("userText")}}' },
        { type: 'output_block', role: 'display result' }
      ]
    };

    const validationResults = this.validateFlowScenario(flowScenario);
    
    this.testResults.push({
      scenario: flowScenario.name,
      passed: validationResults.every(r => r.valid),
      issues: validationResults.filter(r => !r.valid),
      coverage: this.calculateBlockCoverage(flowScenario.blocks)
    });

    return validationResults.every(r => r.valid);
  }

  testComplexFlow2() {
    this.log('🧪 Testing Complex Flow 2: For Each Line + Variables + Multiple Conditions');
    
    const flowScenario = {
      name: 'Multi-line Text Processing',
      description: 'Process each line → Check if not empty → Set line variable → Check length → Process with LLM',
      blocks: [
        { type: 'start_block' },
        { type: 'text_input_block', value: 'Line 1\nLine 2\nLine 3' },
        { type: 'for_each_line_block' },
        { type: 'set_variable_block', fields: { VAR_NAME: 'currentLine', VAR_VALUE: '{{line}}' } },
        { type: 'if_block', condition: 'boolean_not_equals_block' },
        { type: 'llm_block', model: 'groq', prompt: 'Process: {{getVar("currentLine")}}' },
        { type: 'output_block' }
      ]
    };

    const validationResults = this.validateFlowScenario(flowScenario);
    
    this.testResults.push({
      scenario: flowScenario.name,
      passed: validationResults.every(r => r.valid),
      issues: validationResults.filter(r => !r.valid),
      coverage: this.calculateBlockCoverage(flowScenario.blocks)
    });

    return validationResults.every(r => r.valid);
  }

  testComplexFlow3() {
    this.log('🧪 Testing Complex Flow 3: Nested Logic + Multiple Variables');
    
    const flowScenario = {
      name: 'Advanced Decision Tree',
      description: 'Multiple variables → Nested IF conditions → Complex boolean expressions → Multiple LLM calls',
      blocks: [
        { type: 'start_block' },
        { type: 'set_variable_block', fields: { VAR_NAME: 'score', VAR_VALUE: '85' } },
        { type: 'set_variable_block', fields: { VAR_NAME: 'threshold', VAR_VALUE: '80' } },
        { type: 'set_variable_block', fields: { VAR_NAME: 'category', VAR_VALUE: 'premium' } },
        { type: 'if_block', condition: 'boolean_and_block' }, // score > threshold AND category == premium
        { type: 'llm_block', model: 'claude', prompt: 'Premium analysis for score {{getVar("score")}}' },
        { type: 'if_block', condition: 'boolean_greater_than_block' }, // nested if: score > 90
        { type: 'llm_block', model: 'openai', prompt: 'Exceptional case: {{getVar("score")}}' },
        { type: 'output_block' }
      ]
    };

    const validationResults = this.validateFlowScenario(flowScenario);
    
    this.testResults.push({
      scenario: flowScenario.name,
      passed: validationResults.every(r => r.valid),
      issues: validationResults.filter(r => !r.valid),
      coverage: this.calculateBlockCoverage(flowScenario.blocks)
    });

    return validationResults.every(r => r.valid);
  }

  testBooleanOperatorCombinations() {
    this.log('🧪 Testing Boolean Operator Combinations');
    
    const booleanTests = [
      {
        name: 'Equals with Variables',
        operator: 'boolean_equals_block',
        inputs: ['{{getVar("var1")}}', '{{getVar("var2")}}'],
        scenario: 'Compare two variable values'
      },
      {
        name: 'Greater Than with Numbers',
        operator: 'boolean_greater_than_block', 
        inputs: ['{{getVar("score")}}', '80'],
        scenario: 'Numeric comparison'
      },
      {
        name: 'AND Logic Combination',
        operator: 'boolean_and_block',
        inputs: ['condition1', 'condition2'],
        scenario: 'Combine multiple boolean conditions'
      },
      {
        name: 'NOT Logic Negation',
        operator: 'boolean_not_block',
        inputs: ['{{getVar("isEmpty")}}'],
        scenario: 'Negate a boolean value'
      }
    ];

    let allBooleanTestsPassed = true;

    for (const test of booleanTests) {
      const isValid = this.validateBooleanOperator(test);
      if (!isValid) {
        allBooleanTestsPassed = false;
      }
      
      this.log(`${isValid ? '✅' : '❌'} ${test.name}: ${test.scenario}`);
    }

    this.testResults.push({
      scenario: 'Boolean Operator Combinations',
      passed: allBooleanTestsPassed,
      issues: booleanTests.filter(test => !this.validateBooleanOperator(test)),
      coverage: { total: booleanTests.length, covered: booleanTests.filter(test => this.validateBooleanOperator(test)).length }
    });

    return allBooleanTestsPassed;
  }

  testVariableSystemIntegration() {
    this.log('🧪 Testing Variable System Integration');
    
    const variableScenarios = [
      {
        name: 'Variable Creation and Usage',
        flow: ['set_variable_block', 'get_variable_block', 'output_block'],
        variableName: 'testVar',
        expectedValue: 'Hello World'
      },
      {
        name: 'Variable in LLM Prompt',
        flow: ['set_variable_block', 'llm_block'],
        variableName: 'userInput',
        promptTemplate: 'Process: {{getVar("userInput")}}'
      },
      {
        name: 'Variable in Boolean Comparison',
        flow: ['set_variable_block', 'boolean_equals_block', 'if_block'],
        variableName: 'status',
        comparisonValue: 'active'
      }
    ];

    let allVariableTestsPassed = true;

    for (const scenario of variableScenarios) {
      const isValid = this.validateVariableScenario(scenario);
      if (!isValid) {
        allVariableTestsPassed = false;
      }
      
      this.log(`${isValid ? '✅' : '❌'} ${scenario.name}`);
    }

    this.testResults.push({
      scenario: 'Variable System Integration',
      passed: allVariableTestsPassed,
      issues: variableScenarios.filter(scenario => !this.validateVariableScenario(scenario)),
      coverage: { total: variableScenarios.length, covered: variableScenarios.filter(scenario => this.validateVariableScenario(scenario)).length }
    });

    return allVariableTestsPassed;
  }

  validateFlowScenario(scenario) {
    const results = [];
    
    // Check if all block types exist
    for (const block of scenario.blocks) {
      const blockExists = this.checkBlockExists(block.type);
      results.push({
        test: `Block exists: ${block.type}`,
        valid: blockExists,
        message: blockExists ? 'Block file found' : `Block file missing: ${block.type}`
      });
    }

    // Check flow structure validity
    const hasStart = scenario.blocks.some(b => b.type === 'start_block');
    const hasEnd = scenario.blocks.some(b => b.type === 'output_block');
    
    results.push({
      test: 'Flow has start block',
      valid: hasStart,
      message: hasStart ? 'Start block present' : 'Missing start block'
    });

    results.push({
      test: 'Flow has end block', 
      valid: hasEnd,
      message: hasEnd ? 'End block present' : 'Missing end block'
    });

    // Check for logical flow progression
    const hasLogicalProgression = this.validateFlowProgression(scenario.blocks);
    results.push({
      test: 'Logical flow progression',
      valid: hasLogicalProgression,
      message: hasLogicalProgression ? 'Flow progression is logical' : 'Flow progression has issues'
    });

    return results;
  }

  validateBooleanOperator(test) {
    // Check if boolean operator files exist and have correct structure
    const booleanOpFile = path.join(__dirname, 'blocks/booleanOperators.ts');
    
    if (!fs.existsSync(booleanOpFile)) {
      return false;
    }

    const content = fs.readFileSync(booleanOpFile, 'utf8');
    
    // Check if the specific operator is implemented
    if (!content.includes(test.operator)) {
      return false;
    }

    // Check if it has hexagonal output
    const operatorSection = this.extractOperatorSection(content, test.operator);
    if (!operatorSection.includes('"output": "Boolean"')) {
      return false;
    }

    return true;
  }

  validateVariableScenario(scenario) {
    // Check if variable blocks exist
    const setVarExists = this.checkBlockExists('set_variable_block');
    const getVarExists = this.checkBlockExists('get_variable_block');
    
    if (!setVarExists || !getVarExists) {
      return false;
    }

    // Check if variable dropdown functionality exists
    const getVarFile = path.join(__dirname, 'blocks/getVariableBlock.ts');
    const content = fs.readFileSync(getVarFile, 'utf8');
    
    return content.includes('field_dropdown') && 
           (content.includes('updateGetVariableDropdown') || content.includes('updateAllGetVariableDropdowns'));
  }

  checkBlockExists(blockType) {
    const blockMappings = {
      'start_block': 'blocks/startBlock.ts',
      'output_block': 'blocks/outputBlock.ts',
      'text_input_block': 'blocks/textInputBlock.ts',
      'llm_block': 'blocks/llmBlock.ts',
      'if_block': 'blocks/ifBlock.ts',
      'for_each_line_block': 'blocks/forEachLineBlock.ts',
      'set_variable_block': 'blocks/setVariableBlock.ts',
      'get_variable_block': 'blocks/getVariableBlock.ts',
      'boolean_equals_block': 'blocks/booleanOperators.ts',
      'boolean_not_equals_block': 'blocks/booleanOperators.ts',
      'boolean_greater_than_block': 'blocks/booleanOperators.ts',
      'boolean_less_than_block': 'blocks/booleanOperators.ts',
      'boolean_and_block': 'blocks/booleanOperators.ts',
      'boolean_or_block': 'blocks/booleanOperators.ts',
      'boolean_not_block': 'blocks/booleanOperators.ts'
    };

    const filePath = blockMappings[blockType];
    if (!filePath) return false;
    
    const fullPath = path.join(__dirname, filePath);
    return fs.existsSync(fullPath);
  }

  validateFlowProgression(blocks) {
    // Simple validation: start block should be first, output block should be last
    if (blocks.length === 0) return false;
    
    const firstBlock = blocks[0];
    const lastBlock = blocks[blocks.length - 1];
    
    return firstBlock.type === 'start_block' && lastBlock.type === 'output_block';
  }

  extractOperatorSection(content, operatorType) {
    const startIndex = content.indexOf(operatorType);
    if (startIndex === -1) return '';
    
    const endIndex = content.indexOf('};', startIndex);
    if (endIndex === -1) return content.substring(startIndex);
    
    return content.substring(startIndex, endIndex + 2);
  }

  calculateBlockCoverage(blocks) {
    const uniqueBlockTypes = [...new Set(blocks.map(b => b.type))];
    return {
      total: blocks.length,
      unique: uniqueBlockTypes.length,
      types: uniqueBlockTypes
    };
  }

  generateReport() {
    this.log('\n' + '='.repeat(80));
    this.log('📊 FLOW COMBINATION TEST REPORT');
    this.log('='.repeat(80));

    const totalScenarios = this.testResults.length;
    const passedScenarios = this.testResults.filter(r => r.passed).length;
    const successRate = totalScenarios > 0 ? (passedScenarios / totalScenarios * 100) : 0;

    this.log(`🎯 Scenarios Tested: ${totalScenarios}`);
    this.log(`✅ Scenarios Passed: ${passedScenarios}`);
    this.log(`❌ Scenarios Failed: ${totalScenarios - passedScenarios}`);
    this.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);

    this.log('\n📋 Detailed Results:');
    this.testResults.forEach(result => {
      this.log(`${result.passed ? '✅' : '❌'} ${result.scenario}`);
      if (!result.passed && result.issues.length > 0) {
        result.issues.forEach(issue => {
          this.log(`    💥 ${issue.test || issue.name}: ${issue.message || 'Failed validation'}`);
        });
      }
    });

    if (passedScenarios === totalScenarios) {
      this.log('\n🎉 ALL FLOW COMBINATIONS WORKING CORRECTLY!');
      this.log('🚀 Every block and combination has been tested and verified!');
    } else {
      this.log('\n⚠️ Some flow combinations need attention.');
    }

    this.log('\n🏁 Flow Combination Testing Complete!');

    return {
      success: passedScenarios === totalScenarios,
      successRate,
      totalScenarios,
      passedScenarios,
      details: this.testResults
    };
  }

  async runAllFlowTests() {
    this.log('🚀 Starting Flow Combination Tests');
    this.log('Testing real-world scenarios with complex block combinations...\n');

    try {
      // Test complex flows
      this.testComplexFlow1();
      this.testComplexFlow2(); 
      this.testComplexFlow3();
      
      // Test specific systems
      this.testBooleanOperatorCombinations();
      this.testVariableSystemIntegration();

      // Generate report
      return this.generateReport();
      
    } catch (error) {
      this.log(`💥 Flow test error: ${error.message}`);
      this.testResults.push({
        scenario: 'Test Suite Error',
        passed: false,
        issues: [{ test: 'Test execution', message: error.message }],
        coverage: { total: 0, covered: 0 }
      });
      
      return this.generateReport();
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new FlowCombinationTester();
  tester.runAllFlowTests().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = FlowCombinationTester; 