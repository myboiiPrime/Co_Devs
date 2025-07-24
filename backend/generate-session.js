const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Document = require('./src/models/Document');
const CollaborationSession = require('./src/models/CollaborationSession');

// Configuration
const SESSION_CONFIG = {
  defaultExpiration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  maxTerminals: 5,
  allowedShells: ['bash', 'cmd', 'powershell', 'python', 'node'],
  workspaceBaseDir: path.join(__dirname, 'workspaces')
};

// Sample session templates
const sessionTemplates = [
  {
    name: 'React Development Session',
    documentTitle: 'React Component Workshop',
    documentContent: `import React, { useState, useEffect } from 'react';

// Workshop: Building Interactive Components
function ComponentWorkshop() {
  const [count, setCount] = useState(0);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch users from API
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const userData = await response.json();
      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <div className="workshop">
      <h1>React Component Workshop</h1>
      <div className="counter-section">
        <h2>Counter: {count}</h2>
        <button onClick={() => setCount(count + 1)}>
          Increment
        </button>
        <button onClick={() => setCount(count - 1)}>
          Decrement
        </button>
        <button onClick={() => setCount(0)}>
          Reset
        </button>
      </div>
      
      <div className="users-section">
        <h2>Users ({users.length})</h2>
        <ul>
          {users.map(user => (
            <li key={user.id}>
              {user.name} - {user.email}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ComponentWorkshop;`,
    language: 'javascript',
    shellType: 'node'
  },
  {
    name: 'Python Data Science Session',
    documentTitle: 'Data Analysis Workshop',
    documentContent: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Data Science Workshop
print("Welcome to the Data Science Workshop!")

# Sample dataset
data = {
    'product': ['A', 'B', 'C', 'D', 'E'] * 20,
    'sales': np.random.randint(100, 1000, 100),
    'profit': np.random.randint(10, 100, 100),
    'region': np.random.choice(['North', 'South', 'East', 'West'], 100),
    'month': np.random.choice(range(1, 13), 100)
}

df = pd.DataFrame(data)

# Basic analysis
print("Dataset Overview:")
print(df.head())
print(f"\\nDataset shape: {df.shape}")
print(f"\\nData types:\\n{df.dtypes}")

# Statistical summary
print("\\nStatistical Summary:")
print(df.describe())

# Group analysis
region_analysis = df.groupby('region').agg({
    'sales': ['sum', 'mean', 'count'],
    'profit': ['sum', 'mean']
}).round(2)

print("\\nRegion Analysis:")
print(region_analysis)

# Visualization setup
plt.figure(figsize=(15, 10))

# Sales by region
plt.subplot(2, 3, 1)
df.groupby('region')['sales'].sum().plot(kind='bar')
plt.title('Total Sales by Region')
plt.ylabel('Sales')

# Profit by product
plt.subplot(2, 3, 2)
df.groupby('product')['profit'].mean().plot(kind='bar')
plt.title('Average Profit by Product')
plt.ylabel('Profit')

# Sales vs Profit scatter
plt.subplot(2, 3, 3)
plt.scatter(df['sales'], df['profit'], alpha=0.6)
plt.xlabel('Sales')
plt.ylabel('Profit')
plt.title('Sales vs Profit')

# Monthly trends
plt.subplot(2, 3, 4)
monthly_sales = df.groupby('month')['sales'].sum()
plt.plot(monthly_sales.index, monthly_sales.values, marker='o')
plt.title('Monthly Sales Trend')
plt.xlabel('Month')
plt.ylabel('Sales')

# Correlation heatmap
plt.subplot(2, 3, 5)
correlation_matrix = df[['sales', 'profit', 'month']].corr()
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm')
plt.title('Correlation Matrix')

plt.tight_layout()
plt.show()

# Advanced analysis
print("\\nAdvanced Analysis:")
print("Top performing products:")
top_products = df.groupby('product')['sales'].sum().sort_values(ascending=False)
print(top_products)

print("\\nRegional performance ranking:")
regional_performance = df.groupby('region')['profit'].sum().sort_values(ascending=False)
print(regional_performance)`,
    language: 'python',
    shellType: 'python'
  },
  {
    name: 'Full Stack Development Session',
    documentTitle: 'MERN Stack Project',
    documentContent: `// MERN Stack Project Setup
// This is a collaborative workspace for building a full-stack application

// Frontend (React)
/*
src/
├── components/
│   ├── Header.js
│   ├── UserList.js
│   └── UserForm.js
├── pages/
│   ├── Home.js
│   └── Dashboard.js
├── services/
│   └── api.js
└── App.js
*/

// Backend (Express + MongoDB)
/*
server/
├── models/
│   └── User.js
├── routes/
│   └── users.js
├── middleware/
│   └── auth.js
└── server.js
*/

// Package.json dependencies
const dependencies = {
  "frontend": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.4.0",
    "react-router-dom": "^6.14.0"
  },
  "backend": {
    "express": "^4.18.0",
    "mongoose": "^7.4.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0"
  }
};

// Project structure and setup commands
console.log("MERN Stack Project Setup");
console.log("========================");
console.log("1. Initialize React app: npx create-react-app client");
console.log("2. Initialize Express server: npm init -y && npm install express mongoose cors dotenv");
console.log("3. Set up MongoDB connection");
console.log("4. Create API routes");
console.log("5. Build React components");
console.log("6. Connect frontend to backend");

// Sample API endpoint
const express = require('express');
const app = express();

app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'MERN Stack API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// TODO: Implement user authentication
// TODO: Create CRUD operations for users
// TODO: Add real-time features with Socket.io
// TODO: Implement file upload functionality
// TODO: Add data validation and error handling`,
    language: 'javascript',
    shellType: 'bash'
  }
];

class SessionGenerator {
  constructor() {
    this.users = [];
    this.documents = [];
  }

  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collaborative-editor');
      console.log('📦 Connected to MongoDB');
    } catch (error) {
      console.error('❌ Database connection error:', error.message);
      throw error;
    }
  }

  async loadExistingUsers() {
    try {
      this.users = await User.find({}).select('-password');
      console.log(`👥 Loaded ${this.users.length} existing users`);
      
      if (this.users.length === 0) {
        console.log('⚠️  No users found in database. Please create users first.');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error loading users:', error.message);
      throw error;
    }
  }

  async createWorkspaceDirectory(sessionId) {
    const workspaceDir = path.join(SESSION_CONFIG.workspaceBaseDir, sessionId);
    
    try {
      if (!fs.existsSync(SESSION_CONFIG.workspaceBaseDir)) {
        fs.mkdirSync(SESSION_CONFIG.workspaceBaseDir, { recursive: true });
      }
      
      if (!fs.existsSync(workspaceDir)) {
        fs.mkdirSync(workspaceDir, { recursive: true });
        
        // Create basic project structure
        const folders = ['src', 'public', 'docs', 'tests'];
        folders.forEach(folder => {
          fs.mkdirSync(path.join(workspaceDir, folder), { recursive: true });
        });
        
        // Create a README file
        const readmeContent = `# Collaboration Session Workspace

This workspace was automatically generated for collaborative development.

## Session Information
- Session ID: ${sessionId}
- Created: ${new Date().toISOString()}

## Getting Started
1. Install dependencies: \`npm install\`
2. Start development server: \`npm run dev\`
3. Begin collaborating!

## Available Commands
- \`npm test\` - Run tests
- \`npm run build\` - Build for production
- \`npm run lint\` - Check code quality

Happy coding! 🚀
`;
        fs.writeFileSync(path.join(workspaceDir, 'README.md'), readmeContent);
        
        // Create package.json
        const packageJson = {
          "name": `collaboration-session-${sessionId}`,
          "version": "1.0.0",
          "description": "Collaborative development workspace",
          "main": "index.js",
          "scripts": {
            "start": "node index.js",
            "dev": "nodemon index.js",
            "test": "jest",
            "build": "webpack --mode production"
          },
          "dependencies": {},
          "devDependencies": {}
        };
        fs.writeFileSync(path.join(workspaceDir, 'package.json'), JSON.stringify(packageJson, null, 2));
      }
      
      console.log(`📁 Workspace directory created: ${workspaceDir}`);
      return workspaceDir;
    } catch (error) {
      console.error('❌ Error creating workspace directory:', error.message);
      throw error;
    }
  }

  async createDocument(template, ownerId) {
    try {
      const document = new Document({
        title: template.documentTitle,
        content: template.documentContent,
        language: template.language,
        owner: ownerId,
        isPublic: true,
        collaborators: []
      });

      const savedDocument = await document.save();
      console.log(`📄 Created document: ${template.documentTitle}`);
      return savedDocument;
    } catch (error) {
      console.error('❌ Error creating document:', error.message);
      throw error;
    }
  }

  async generateSession(options = {}) {
    const {
      templateIndex = 0,
      ownerUsername = null,
      participantUsernames = [],
      customTitle = null,
      expirationHours = 24
    } = options;

    try {
      // Select template
      const template = sessionTemplates[templateIndex] || sessionTemplates[0];
      
      // Select owner
      let owner;
      if (ownerUsername) {
        owner = this.users.find(user => user.username === ownerUsername);
        if (!owner) {
          throw new Error(`Owner user '${ownerUsername}' not found`);
        }
      } else {
        owner = this.users[Math.floor(Math.random() * this.users.length)];
      }

      // Select participants
      let participants = [];
      if (participantUsernames.length > 0) {
        participants = this.users.filter(user => 
          participantUsernames.includes(user.username) && 
          user._id.toString() !== owner._id.toString()
        );
      } else {
        // Randomly select 1-3 participants
        const availableUsers = this.users.filter(user => 
          user._id.toString() !== owner._id.toString()
        );
        const participantCount = Math.min(
          Math.floor(Math.random() * 3) + 1, 
          availableUsers.length
        );
        participants = availableUsers
          .sort(() => 0.5 - Math.random())
          .slice(0, participantCount);
      }

      // Generate session ID
      const sessionId = uuidv4();

      // Create workspace directory
      const workspaceDir = await this.createWorkspaceDirectory(sessionId);

      // Create document
      const document = await this.createDocument(template, owner._id);

      // Create collaboration session
      const session = new CollaborationSession({
        sessionId,
        documentId: document._id,
        owner: owner._id,
        participants: participants.map(user => ({
          user: user._id,
          role: 'editor',
          joinedAt: new Date()
        })),
        terminalSessions: [{
          terminalId: `${sessionId}-main`,
          name: 'Main Terminal',
          shellType: template.shellType || 'bash',
          isActive: true,
          createdBy: owner._id,
          createdAt: new Date()
        }],
        workspaceDir,
        settings: {
          maxTerminals: SESSION_CONFIG.maxTerminals,
          allowedShells: SESSION_CONFIG.allowedShells,
          fileSystemAccess: true
        },
        isActive: true,
        expiresAt: new Date(Date.now() + (expirationHours * 60 * 60 * 1000))
      });

      const savedSession = await session.save();

      // Add collaborators to document
      await Document.findByIdAndUpdate(document._id, {
        $push: {
          collaborators: {
            $each: participants.map(user => ({
              user: user._id,
              permission: 'write',
              joinedAt: new Date()
            }))
          }
        }
      });

      console.log('✅ Session created successfully!');
      console.log(`📋 Session Details:`);
      console.log(`   Session ID: ${sessionId}`);
      console.log(`   Template: ${template.name}`);
      console.log(`   Owner: ${owner.username} (${owner.email})`);
      console.log(`   Participants: ${participants.map(p => p.username).join(', ')}`);
      console.log(`   Document: ${document.title}`);
      console.log(`   Workspace: ${workspaceDir}`);
      console.log(`   Expires: ${savedSession.expiresAt.toISOString()}`);

      return {
        session: savedSession,
        document,
        owner,
        participants,
        workspaceDir
      };

    } catch (error) {
      console.error('❌ Error generating session:', error.message);
      throw error;
    }
  }

  async generateMultipleSessions(count = 3) {
    const sessions = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const templateIndex = i % sessionTemplates.length;
        const session = await this.generateSession({ templateIndex });
        sessions.push(session);
        
        // Add a small delay between sessions
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error creating session ${i + 1}:`, error.message);
      }
    }
    
    return sessions;
  }

  async listActiveSessions() {
    try {
      const sessions = await CollaborationSession.find({ isActive: true })
        .populate('owner', 'username email')
        .populate('participants.user', 'username email')
        .populate('documentId', 'title language');

      console.log(`\n📊 Active Sessions (${sessions.length}):`);
      console.log('='.repeat(50));
      
      sessions.forEach((session, index) => {
        console.log(`${index + 1}. Session ID: ${session.sessionId}`);
        console.log(`   Document: ${session.documentId.title} (${session.documentId.language})`);
        console.log(`   Owner: ${session.owner.username}`);
        console.log(`   Participants: ${session.participants.map(p => p.user.username).join(', ')}`);
        console.log(`   Terminals: ${session.terminalSessions.length}`);
        console.log(`   Expires: ${session.expiresAt.toLocaleString()}`);
        console.log('   ' + '-'.repeat(40));
      });

      return sessions;
    } catch (error) {
      console.error('❌ Error listing sessions:', error.message);
      throw error;
    }
  }

  async cleanup() {
    try {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    } catch (error) {
      console.error('❌ Error closing database connection:', error.message);
    }
  }
}

// CLI Interface
async function main() {
  const generator = new SessionGenerator();
  
  try {
    await generator.connect();
    
    const hasUsers = await generator.loadExistingUsers();
    if (!hasUsers) {
      console.log('💡 Tip: Run "node create-dataset.js" first to create sample users');
      return;
    }

    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'generate';

    switch (command) {
      case 'generate':
        const count = parseInt(args[1]) || 1;
        if (count === 1) {
          await generator.generateSession();
        } else {
          await generator.generateMultipleSessions(count);
        }
        break;

      case 'list':
        await generator.listActiveSessions();
        break;

      case 'custom':
        const customOptions = {
          templateIndex: parseInt(args[1]) || 0,
          ownerUsername: args[2] || null,
          participantUsernames: args.slice(3) || []
        };
        await generator.generateSession(customOptions);
        break;

      default:
        console.log('📖 Usage:');
        console.log('  node generate-session.js generate [count]     - Generate sessions');
        console.log('  node generate-session.js list                - List active sessions');
        console.log('  node generate-session.js custom [template] [owner] [participants...]');
        console.log('\n📋 Available templates:');
        sessionTemplates.forEach((template, index) => {
          console.log(`  ${index}: ${template.name}`);
        });
    }

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
  } finally {
    await generator.cleanup();
  }
}

// Export for use as module
module.exports = SessionGenerator;

// Run if called directly
if (require.main === module) {
  main();
}