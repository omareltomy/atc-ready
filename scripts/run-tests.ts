import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runValidation() {
  try {
    console.log('Compiling and running validation tests...\n');
    
    // Compile and run the validation script
    const { stdout, stderr } = await execAsync('npx tsx __tests__/validation.ts', {
      cwd: process.cwd()
    });
    
    if (stderr) {
      console.error('Compilation errors:', stderr);
    }
    
    console.log(stdout);
    
  } catch (error) {
    console.error('Error running validation:', error);
    
    // Try alternative approach - direct node execution
    try {
      console.log('\nTrying alternative approach...\n');
      const { stdout: stdout2 } = await execAsync('node -r ts-node/register __tests__/validation.ts');
      console.log(stdout2);
    } catch (error2) {
      console.error('Alternative approach failed:', error2);
      
      // Manual test runner as fallback
      console.log('\nRunning manual tests...\n');
      await import('../__tests__/validation');
    }
  }
}

runValidation().catch(console.error);
