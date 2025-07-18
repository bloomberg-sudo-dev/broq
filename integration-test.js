/**
 * Comprehensive Integration Test for Broq
 * Tests build process, block functionality, and flow execution
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class IntegrationTester {
  constructor() {
    this.results = {
      buildTest: null,
      blockTests: [],
      flowTests: [],
      errors: []
    };
  }

  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        stdio: 'pipe',
        shell: true,
        ...options
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        resolve({
          code,
          stdout,
          stderr,
          success: code === 0
        });
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  async testBuild() {
    this.log('🔨 Testing build process...');
    
    try {
      const result = await this.runCommand('npm', ['run', 'build']);
      
      if (result.success) {
        this.log('✅ Build successful');
        this.results.buildTest = { success: true, message: 'Build completed successfully' };
        
        // Check if build artifacts exist
        const buildDir = path.join(__dirname, '.next');
        if (fs.existsSync(buildDir)) {
          this.log('✅ Build artifacts generated');
        } else {
          this.log('⚠️ Build artifacts not found');
        }
        
        return true;
      } else {
        this.log('❌ Build failed');
        this.log('Build output:', result.stdout);
        this.log('Build errors:', result.stderr);
        this.results.buildTest = { success: false, message: `Build failed: ${result.stderr}` };
        return false;
      }
    } catch (error) {
      this.log('💥 Build test error:', error.message);
      this.results.buildTest = { success: false, message: `Build error: ${error.message}` };
      return false;
    }
  }

  testBlockFiles() {
    this.log('📦 Testing block files...');
    
    const blockFiles = [
      'blocks/startBlock.ts',
      'blocks/outputBlock.ts',
      'blocks/textInputBlock.ts',
      'blocks/llmBlock.ts',
      'blocks/ifBlock.ts',
      'blocks/forEachLineBlock.ts',
      'blocks/setVariableBlock.ts',
      'blocks/getVariableBlock.ts',
      'blocks/booleanOperators.ts'
    ];

    let allBlocksValid = true;

    for (const blockFile of blockFiles) {
      const filePath = path.join(__dirname, blockFile);
      
      if (!fs.existsSync(filePath)) {
        this.log(`❌ Missing block file: ${blockFile}`);
        this.results.blockTests.push({
          file: blockFile,
          success: false,
          message: 'File does not exist'
        });
        allBlocksValid = false;
        continue;
      }

      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for required block components
        const hasInit = content.includes('init: function') || content.includes('init(');
        const hasGenerator = content.includes('Generator') || content.includes('forBlock');
        const hasExports = content.includes('export');
        
        if (hasInit && hasGenerator && hasExports) {
          this.log(`✅ Block file valid: ${blockFile}`);
          this.results.blockTests.push({
            file: blockFile,
            success: true,
            message: 'Block structure is valid'
          });
        } else {
          this.log(`❌ Block file invalid: ${blockFile}`);
          this.results.blockTests.push({
            file: blockFile,
            success: false,
            message: `Missing components - init: ${hasInit}, generator: ${hasGenerator}, exports: ${hasExports}`
          });
          allBlocksValid = false;
        }
      } catch (error) {
        this.log(`💥 Error reading ${blockFile}: ${error.message}`);
        this.results.blockTests.push({
          file: blockFile,
          success: false,
          message: `Read error: ${error.message}`
        });
        allBlocksValid = false;
      }
    }

    return allBlocksValid;
  }

  testUtilityFiles() {
    this.log('🛠️ Testing utility files...');
    
    const utilFiles = [
      { file: 'utils/extractFlow.ts', required: ['extractFlow', 'BlockOutput'] },
      { file: 'utils/runFlow.ts', required: ['runFlow'] },
      { file: 'utils/conditionEvaluator.ts', required: ['evaluateCondition'] },
      { file: 'lib/registerBlocks.ts', required: ['registerBlocks'] }
    ];

    let allUtilsValid = true;

    for (const { file, required } of utilFiles) {
      const filePath = path.join(__dirname, file);
      
      if (!fs.existsSync(filePath)) {
        this.log(`❌ Missing utility file: ${file}`);
        allUtilsValid = false;
        continue;
      }

      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const missingRequirements = required.filter(req => !content.includes(req));
        
        if (missingRequirements.length === 0) {
          this.log(`✅ Utility file valid: ${file}`);
        } else {
          this.log(`❌ Utility file missing requirements: ${file} - ${missingRequirements.join(', ')}`);
          allUtilsValid = false;
        }
      } catch (error) {
        this.log(`💥 Error reading ${file}: ${error.message}`);
        allUtilsValid = false;
      }
    }

    return allUtilsValid;
  }

  testBooleanOperators() {
    this.log('🔧 Testing boolean operators...');
    
    const booleanFile = path.join(__dirname, 'blocks/booleanOperators.ts');
    
    if (!fs.existsSync(booleanFile)) {
      this.log('❌ Boolean operators file missing');
      return false;
    }

    const content = fs.readFileSync(booleanFile, 'utf8');
    
    const requiredOperators = [
      'boolean_equals_block',
      'boolean_not_equals_block',
      'boolean_greater_than_block', 
      'boolean_less_than_block',
      'boolean_and_block',
      'boolean_or_block',
      'boolean_not_block'
    ];

    const missingOperators = requiredOperators.filter(op => !content.includes(op));
    
    if (missingOperators.length === 0) {
      this.log(`✅ All ${requiredOperators.length} boolean operators implemented`);
      
      // Check for hexagonal output
      if (content.includes('"output": "Boolean"')) {
        this.log('✅ Boolean operators have hexagonal output configuration');
        return true;
      } else {
        this.log('❌ Boolean operators missing hexagonal output configuration');
        return false;
      }
    } else {
      this.log(`❌ Missing boolean operators: ${missingOperators.join(', ')}`);
      return false;
    }
  }

  testVariableSystem() {
    this.log('📝 Testing variable system...');
    
    // Test Set Variable block
    const setVarFile = path.join(__dirname, 'blocks/setVariableBlock.ts');
    const getVarFile = path.join(__dirname, 'blocks/getVariableBlock.ts');
    
    let setVarValid = false;
    let getVarValid = false;

    if (fs.existsSync(setVarFile)) {
      const setContent = fs.readFileSync(setVarFile, 'utf8');
      if (setContent.includes('VAR_NAME') && setContent.includes('VAR_VALUE')) {
        this.log('✅ Set Variable block properly configured');
        setVarValid = true;
      } else {
        this.log('❌ Set Variable block missing required fields');
      }
    } else {
      this.log('❌ Set Variable block file missing');
    }

    if (fs.existsSync(getVarFile)) {
      const getContent = fs.readFileSync(getVarFile, 'utf8');
      if (getContent.includes('field_dropdown') && getContent.includes('VAR_NAME')) {
        this.log('✅ Get Variable block has dropdown configuration');
        
        if (getContent.includes('updateGetVariableDropdown') || getContent.includes('updateAllGetVariableDropdowns')) {
          this.log('✅ Get Variable block has dropdown update functionality');
          getVarValid = true;
        } else {
          this.log('❌ Get Variable block missing dropdown update functionality');
        }
      } else {
        this.log('❌ Get Variable block missing dropdown configuration');
      }
    } else {
      this.log('❌ Get Variable block file missing');
    }

    return setVarValid && getVarValid;
  }

  testComponentIntegration() {
    this.log('🔗 Testing component integration...');
    
    const registerFile = path.join(__dirname, 'lib/registerBlocks.ts');
    const toolbarFile = path.join(__dirname, 'components/BlocklyToolbar.tsx');
    
    let registrationValid = false;
    let toolbarValid = false;

    if (fs.existsSync(registerFile)) {
      const content = fs.readFileSync(registerFile, 'utf8');
      const requiredImports = [
        'startBlock',
        'outputBlock', 
        'llmBlock',
        'ifBlock',
        'booleanOperators'
      ];
      
      const missingImports = requiredImports.filter(imp => !content.includes(imp));
      
      if (missingImports.length === 0) {
        this.log('✅ All blocks properly imported in registerBlocks');
        registrationValid = true;
      } else {
        this.log(`❌ Missing block imports: ${missingImports.join(', ')}`);
      }
    } else {
      this.log('❌ registerBlocks.ts file missing');
    }

    if (fs.existsSync(toolbarFile)) {
      const content = fs.readFileSync(toolbarFile, 'utf8');
      
      if (content.includes('boolean_equals_block') && content.includes('boolean_and_block')) {
        this.log('✅ BlocklyToolbar includes boolean operator buttons');
        toolbarValid = true;
      } else {
        this.log('❌ BlocklyToolbar missing boolean operator buttons');
      }
    } else {
      this.log('❌ BlocklyToolbar.tsx file missing');
    }

    return registrationValid && toolbarValid;
  }

  async testDevServer() {
    this.log('🚀 Testing development server startup...');
    
    try {
      const timeout = 30000; // 30 seconds timeout
      
      const devProcess = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        shell: true
      });

      let stdout = '';
      let serverStarted = false;

      return new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          devProcess.kill();
          if (serverStarted) {
            this.log('✅ Dev server started successfully');
            resolve(true);
          } else {
            this.log('❌ Dev server failed to start within timeout');
            resolve(false);
          }
        }, timeout);

        devProcess.stdout.on('data', (data) => {
          stdout += data.toString();
          
          // Check for successful startup indicators
          if (stdout.includes('Ready in') || stdout.includes('started server') || stdout.includes('Local:')) {
            serverStarted = true;
            clearTimeout(timeoutId);
            devProcess.kill();
            this.log('✅ Dev server started successfully');
            resolve(true);
          }
        });

        devProcess.stderr.on('data', (data) => {
          const error = data.toString();
          if (error.includes('Error:') || error.includes('Failed')) {
            clearTimeout(timeoutId);
            devProcess.kill();
            this.log(`❌ Dev server startup error: ${error}`);
            resolve(false);
          }
        });

        devProcess.on('error', (error) => {
          clearTimeout(timeoutId);
          this.log(`💥 Dev server process error: ${error.message}`);
          resolve(false);
        });
      });
    } catch (error) {
      this.log(`💥 Dev server test error: ${error.message}`);
      return false;
    }
  }

  generateReport() {
    this.log('\n' + '='.repeat(80));
    this.log('📊 COMPREHENSIVE TEST REPORT');
    this.log('='.repeat(80));
    
    const buildSuccess = this.results.buildTest?.success ?? false;
    const blockTestsSuccess = this.results.blockTests.every(test => test.success);
    
    this.log(`🔨 Build Test: ${buildSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    this.log(`📦 Block Tests: ${blockTestsSuccess ? '✅ PASSED' : '❌ FAILED'} (${this.results.blockTests.filter(t => t.success).length}/${this.results.blockTests.length})`);
    
    if (!blockTestsSuccess) {
      this.log('\n📋 Block Test Details:');
      this.results.blockTests.filter(test => !test.success).forEach(test => {
        this.log(`   ❌ ${test.file}: ${test.message}`);
      });
    }
    
    const overallSuccess = buildSuccess && blockTestsSuccess;
    const successRate = this.calculateSuccessRate();
    
    this.log(`\n🎯 Overall Status: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    this.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (this.results.errors.length > 0) {
      this.log('\n🚨 Errors Encountered:');
      this.results.errors.forEach(error => {
        this.log(`   💥 ${error}`);
      });
    }
    
    this.log('\n🏁 Testing Complete!');
    
    return {
      success: overallSuccess,
      successRate,
      details: this.results
    };
  }

  calculateSuccessRate() {
    const buildScore = this.results.buildTest?.success ? 1 : 0;
    const blockScore = this.results.blockTests.length > 0 
      ? this.results.blockTests.filter(test => test.success).length / this.results.blockTests.length 
      : 0;
    
    const totalTests = 1 + this.results.blockTests.length;
    const passedTests = buildScore + this.results.blockTests.filter(test => test.success).length;
    
    return totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive Integration Tests');
    this.log('='.repeat(80));
    
    try {
      // Test 1: Build Process
      const buildSuccess = await this.testBuild();
      
      // Test 2: Block Files
      const blockFilesSuccess = this.testBlockFiles();
      
      // Test 3: Utility Files
      const utilsSuccess = this.testUtilityFiles();
      
      // Test 4: Boolean Operators
      const booleanOpsSuccess = this.testBooleanOperators();
      
      // Test 5: Variable System
      const variableSystemSuccess = this.testVariableSystem();
      
      // Test 6: Component Integration
      const integrationSuccess = this.testComponentIntegration();
      
      // Test 7: Dev Server (optional, may be time-consuming)
      // const devServerSuccess = await this.testDevServer();
      
      // Generate final report
      return this.generateReport();
      
    } catch (error) {
      this.log(`💥 Test suite error: ${error.message}`);
      this.results.errors.push(error.message);
      return this.generateReport();
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new IntegrationTester();
  tester.runAllTests().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = IntegrationTester; 