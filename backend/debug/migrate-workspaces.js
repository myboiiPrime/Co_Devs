const fs = require('fs').promises;
const path = require('path');
const WorkspaceService = require('./src/services/workspaceService');

class WorkspaceMigration {
  constructor() {
    this.workspaceService = new WorkspaceService();
    this.baseWorkspaceDir = path.join(process.cwd(), 'workspaces');
  }

  async migrateAllWorkspaces() {
    console.log('🔄 Starting workspace migration...');
    
    try {
      // Get all workspace directories
      const workspaceDirs = await fs.readdir(this.baseWorkspaceDir);
      console.log(`📁 Found ${workspaceDirs.length} workspaces to migrate`);

      let migratedCount = 0;
      let skippedCount = 0;

      for (const sessionId of workspaceDirs) {
        const workspacePath = path.join(this.baseWorkspaceDir, sessionId);
        
        // Check if it's a directory
        const stat = await fs.stat(workspacePath);
        if (!stat.isDirectory()) {
          continue;
        }

        console.log(`\n🔍 Checking workspace: ${sessionId}`);
        
        const migrated = await this.migrateWorkspace(sessionId);
        if (migrated) {
          migratedCount++;
          console.log(`✅ Migrated workspace: ${sessionId}`);
        } else {
          skippedCount++;
          console.log(`⏭️  Skipped workspace: ${sessionId} (already has source files)`);
        }
      }

      console.log(`\n🎉 Migration completed!`);
      console.log(`   ✅ Migrated: ${migratedCount} workspaces`);
      console.log(`   ⏭️  Skipped: ${skippedCount} workspaces`);
      console.log(`   📊 Total: ${migratedCount + skippedCount} workspaces processed`);

    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async migrateWorkspace(sessionId) {
    const workspacePath = path.join(this.baseWorkspaceDir, sessionId);
    const srcPath = path.join(workspacePath, 'src');
    
    try {
      // Check if src directory exists
      await fs.access(srcPath);
      
      // Check if src directory is empty or missing main files
      const srcFiles = await fs.readdir(srcPath);
      const hasMainFile = srcFiles.some(file => 
        file.startsWith('index.') || file.startsWith('main.') || file.startsWith('Main.')
      );

      if (hasMainFile) {
        // Workspace already has source files, skip
        return false;
      }

      // Determine language from existing files
      const language = await this.detectLanguage(workspacePath);
      console.log(`   📝 Detected language: ${language}`);

      // Create missing source files
      await this.createMissingSourceFiles(sessionId, language);
      
      return true;

    } catch (error) {
      if (error.code === 'ENOENT') {
        // src directory doesn't exist, create it with files
        console.log(`   📁 Creating src directory for ${sessionId}`);
        await fs.mkdir(srcPath, { recursive: true });
        
        const language = await this.detectLanguage(workspacePath);
        await this.createMissingSourceFiles(sessionId, language);
        return true;
      }
      throw error;
    }
  }

  async detectLanguage(workspacePath) {
    try {
      // Check package.json for language hints
      const packageJsonPath = path.join(workspacePath, 'package.json');
      try {
        const packageContent = await fs.readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageContent);
        
        // Check dependencies for language indicators
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        if (deps.typescript || deps['@types/node']) return 'typescript';
        if (deps.react || deps.vue || deps.angular) return 'javascript';
        
        return 'javascript'; // Default for Node.js projects
      } catch {
        // No package.json or invalid JSON
      }

      // Check for other language indicators
      const files = await fs.readdir(workspacePath);
      
      if (files.some(f => f.endsWith('.py') || f === 'requirements.txt')) return 'python';
      if (files.some(f => f.endsWith('.java'))) return 'java';
      if (files.some(f => f.endsWith('.cpp') || f.endsWith('.hpp'))) return 'cpp';
      if (files.some(f => f.endsWith('.html'))) return 'html';
      
      // Default to JavaScript
      return 'javascript';
      
    } catch (error) {
      console.log(`   ⚠️  Could not detect language, defaulting to JavaScript`);
      return 'javascript';
    }
  }

  async createMissingSourceFiles(sessionId, language) {
    const mainFileName = this.workspaceService.getMainFileName(language);
    const initialContent = this.workspaceService.getInitialContent(language);
    
    console.log(`   📄 Creating ${mainFileName} with ${language} template`);
    
    // Create the main source file
    await this.workspaceService.createFile(sessionId, `src/${mainFileName}`, initialContent);
    
    // Create additional files based on language
    if (language === 'javascript' || language === 'typescript') {
      // Create a simple test file
      const testContent = language === 'typescript' 
        ? `// Test file for TypeScript project\nimport { describe, it, expect } from 'vitest';\n\ndescribe('Main', () => {\n  it('should work', () => {\n    expect(true).toBe(true);\n  });\n});\n`
        : `// Test file for JavaScript project\nconst { test, expect } = require('@jest/globals');\n\ntest('should work', () => {\n  expect(true).toBe(true);\n});\n`;
      
      await this.workspaceService.createFile(sessionId, `tests/${mainFileName}`, testContent);
    }
    
    if (language === 'python') {
      // Create __init__.py and a test file
      await this.workspaceService.createFile(sessionId, 'src/__init__.py', '# Python package initialization\n');
      await this.workspaceService.createFile(sessionId, 'tests/test_main.py', 
        `# Test file for Python project\nimport unittest\nfrom src.main import greet\n\nclass TestMain(unittest.TestCase):\n    def test_greet(self):\n        self.assertEqual(greet("World"), "Hello, World!")\n\nif __name__ == '__main__':\n    unittest.main()\n`
      );
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  const migration = new WorkspaceMigration();
  migration.migrateAllWorkspaces()
    .then(() => {
      console.log('\n🎉 All workspaces migrated successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = WorkspaceMigration;