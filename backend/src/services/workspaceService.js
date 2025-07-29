const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class WorkspaceService {
  constructor() {
    this.baseWorkspaceDir = path.join(process.cwd(), 'workspaces');
    this.ensureBaseDirectory();
  }

  async ensureBaseDirectory() {
    try {
      await fs.access(this.baseWorkspaceDir);
    } catch {
      await fs.mkdir(this.baseWorkspaceDir, { recursive: true });
      console.log(`📁 Created workspaces directory: ${this.baseWorkspaceDir}`);
    }
  }

  async createCollaborationWorkspace(sessionId, documentContent = '', language = 'javascript') {
    const workspaceDir = path.join(this.baseWorkspaceDir, sessionId);
    
    try {
      // Create workspace directory
      await fs.mkdir(workspaceDir, { recursive: true });
      
      // Create initial project structure
      await this.createInitialStructure(workspaceDir, documentContent, language);
      
      console.log(`📁 Created workspace: ${workspaceDir}`);
      return workspaceDir;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  }

  async createInitialStructure(workspaceDir, documentContent, language) {
    // Create README
    await fs.writeFile(
      path.join(workspaceDir, 'README.md'),
      `# Collaboration Workspace\n\nWelcome to your shared coding environment!\n\n## Getting Started\n\n1. Use the terminal to run commands\n2. Edit files in the code editor\n3. Collaborate with your team in real-time\n\n## Project Structure\n\n- \`src/\` - Source code files\n- \`tests/\` - Test files\n- \`docs/\` - Documentation\n`
    );

    // Create directory structure
    await fs.mkdir(path.join(workspaceDir, 'src'), { recursive: true });
    await fs.mkdir(path.join(workspaceDir, 'tests'), { recursive: true });
    await fs.mkdir(path.join(workspaceDir, 'docs'), { recursive: true });

    // Create main file based on language
    const mainFileName = this.getMainFileName(language);
    const mainFilePath = path.join(workspaceDir, 'src', mainFileName);
    
    const initialContent = documentContent || this.getInitialContent(language);
    await fs.writeFile(mainFilePath, initialContent);

    // Create package.json for JavaScript/TypeScript projects
    if (['javascript', 'typescript'].includes(language)) {
      const packageJson = {
        name: "collaboration-project",
        version: "1.0.0",
        description: "Collaborative coding project",
        main: `src/${mainFileName}`,
        scripts: {
          start: "node src/index.js",
          test: "echo \"Error: no test specified\" && exit 1"
        },
        dependencies: {},
        devDependencies: {}
      };
      
      await fs.writeFile(
        path.join(workspaceDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
    }

    // Create requirements.txt for Python projects
    if (language === 'python') {
      await fs.writeFile(
        path.join(workspaceDir, 'requirements.txt'),
        '# Add your Python dependencies here\n'
      );
    }
  }

  getMainFileName(language) {
    const extensions = {
      javascript: 'index.js',
      typescript: 'index.ts',
      python: 'main.py',
      java: 'Main.java',
      cpp: 'main.cpp',
      html: 'index.html',
      css: 'styles.css',
      json: 'data.json'
    };
    
    return extensions[language] || 'main.txt';
  }

  getInitialContent(language) {
    const templates = {
      javascript: `// Welcome to your collaborative JavaScript project!
console.log('Hello, World!');

function greet(name) {
  return \`Hello, \${name}!\`;
}

// Start coding here...
`,
      python: `# Welcome to your collaborative Python project!
print("Hello, World!")

def greet(name):
    return f"Hello, {name}!"

# Start coding here...
`,
      java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}
`,
      cpp: `#include <iostream>
#include <string>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}

std::string greet(const std::string& name) {
    return "Hello, " + name + "!";
}
`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Collaborative Project</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>Welcome to your collaborative HTML project!</p>
</body>
</html>
`
    };
    
    return templates[language] || '// Welcome to your collaborative project!\n// Start coding here...\n';
  }

  async writeFile(sessionId, relativePath, content) {
    const workspaceDir = this.getWorkspacePath(sessionId);
    const fullPath = path.join(workspaceDir, relativePath);
    
    // Security check - ensure file is within workspace
    if (!fullPath.startsWith(workspaceDir)) {
      throw new Error('Invalid file path');
    }
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    
    await fs.writeFile(fullPath, content);
    return fullPath;
  }

  async readFile(sessionId, relativePath) {
    const workspaceDir = this.getWorkspacePath(sessionId);
    const fullPath = path.join(workspaceDir, relativePath);
    
    // Security check
    if (!fullPath.startsWith(workspaceDir)) {
      throw new Error('Invalid file path');
    }
    
    try {
      return await fs.readFile(fullPath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return empty content or create it
        console.log(`File not found: ${fullPath}, creating with default content`);
        
        // Create the file with default content based on extension
        const defaultContent = this.getDefaultContentForFile(relativePath);
        await this.writeFile(sessionId, relativePath, defaultContent);
        return defaultContent;
      }
      throw error; // Re-throw other errors
    }
  }

  getDefaultContentForFile(relativePath) {
    const ext = path.extname(relativePath).toLowerCase();
    const fileName = path.basename(relativePath);
    
    // Default content based on file type
    const defaults = {
      '.js': '// Welcome to your collaborative JavaScript project!\nconsole.log("Hello, World!");\n\n// Start coding here...\n',
      '.ts': '// Welcome to your collaborative TypeScript project!\nconsole.log("Hello, World!");\n\n// Start coding here...\n',
      '.py': '# Welcome to your collaborative Python project!\nprint("Hello, World!")\n\n# Start coding here...\n',
      '.java': 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n',
      '.cpp': '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n',
      '.html': '<!DOCTYPE html>\n<html>\n<head>\n    <title>Collaborative Project</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>\n',
      '.css': '/* Welcome to your collaborative CSS project! */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}\n',
      '.md': '# Collaborative Project\n\nWelcome to your shared workspace!\n\n## Getting Started\n\nStart editing this file to begin your collaboration.\n',
      '.json': '{\n  "name": "collaborative-project",\n  "version": "1.0.0",\n  "description": "A collaborative project"\n}\n'
    };
    
    return defaults[ext] || `// ${fileName}\n// Welcome to your collaborative project!\n// Start coding here...\n`;
  }

  async listFiles(sessionId, relativePath = '') {
    const workspaceDir = this.getWorkspacePath(sessionId);
    const fullPath = path.join(workspaceDir, relativePath);
    
    // Security check
    if (!fullPath.startsWith(workspaceDir)) {
      throw new Error('Invalid file path');
    }
    
    const items = await fs.readdir(fullPath, { withFileTypes: true });
    
    return items.map(item => ({
      name: item.name,
      type: item.isDirectory() ? 'directory' : 'file',
      path: path.join(relativePath, item.name)
    }));
  }

  async createFile(sessionId, relativePath, content = '') {
    const workspaceDir = this.getWorkspacePath(sessionId);
    const fullPath = path.join(workspaceDir, relativePath);
    
    // Security check - ensure file is within workspace
    if (!fullPath.startsWith(workspaceDir)) {
      throw new Error('Invalid file path');
    }
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    
    // Create the file with initial content
    await fs.writeFile(fullPath, content);
    return fullPath;
  }

  async createDirectory(sessionId, relativePath) {
    const workspaceDir = this.getWorkspacePath(sessionId);
    const fullPath = path.join(workspaceDir, relativePath);
    
    // Security check - ensure directory is within workspace
    if (!fullPath.startsWith(workspaceDir)) {
      throw new Error('Invalid directory path');
    }
    
    // Create the directory
    await fs.mkdir(fullPath, { recursive: true });
    return fullPath;
  }

  async deleteItem(sessionId, relativePath) {
    const workspaceDir = this.getWorkspacePath(sessionId);
    const fullPath = path.join(workspaceDir, relativePath);
    
    // Security check
    if (!fullPath.startsWith(workspaceDir)) {
      throw new Error('Invalid file path');
    }
    
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      await fs.rm(fullPath, { recursive: true });
    } else {
      await fs.unlink(fullPath);
    }
  }

  async renameItem(sessionId, oldRelativePath, newRelativePath) {
    const workspaceDir = this.getWorkspacePath(sessionId);
    const oldFullPath = path.join(workspaceDir, oldRelativePath);
    const newFullPath = path.join(workspaceDir, newRelativePath);
    
    // Security check - ensure both paths are within workspace
    if (!oldFullPath.startsWith(workspaceDir) || !newFullPath.startsWith(workspaceDir)) {
      throw new Error('Invalid file path');
    }
    
    // Ensure target directory exists
    await fs.mkdir(path.dirname(newFullPath), { recursive: true });
    
    // Rename the item
    await fs.rename(oldFullPath, newFullPath);
    return newFullPath;
  }

  // Keep deleteFile for backward compatibility
  async deleteFile(sessionId, relativePath) {
    return this.deleteItem(sessionId, relativePath);
  }

  async cleanupWorkspace(sessionId) {
    const workspaceDir = path.join(this.baseWorkspaceDir, sessionId);
    try {
      await fs.rm(workspaceDir, { recursive: true, force: true });
      console.log(`🗑️ Cleaned up workspace: ${workspaceDir}`);
    } catch (error) {
      console.error('Error cleaning up workspace:', error);
    }
  }

  getWorkspacePath(sessionId) {
    return path.join(this.baseWorkspaceDir, sessionId);
  }

  async getWorkspaceSize(sessionId) {
    const workspaceDir = this.getWorkspacePath(sessionId);
    
    async function getDirectorySize(dirPath) {
      let totalSize = 0;
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);
        if (item.isDirectory()) {
          totalSize += await getDirectorySize(itemPath);
        } else {
          const stats = await fs.stat(itemPath);
          totalSize += stats.size;
        }
      }
      
      return totalSize;
    }
    
    try {
      const size = await getDirectorySize(workspaceDir);
      return {
        bytes: size,
        mb: (size / 1024 / 1024).toFixed(2),
        readable: size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(2)} MB` : `${(size / 1024).toFixed(2)} KB`
      };
    } catch (error) {
      return { bytes: 0, mb: '0.00', readable: '0 KB' };
    }
  }
}

module.exports = new WorkspaceService();