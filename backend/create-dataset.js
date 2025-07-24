const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Document = require('./src/models/Document');

// Sample data
const sampleUsers = [
  {
    username: 'alice_dev',
    email: 'alice@example.com',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
  },
  {
    username: 'bob_coder',
    email: 'bob@example.com',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
  },
  {
    username: 'charlie_js',
    email: 'charlie@example.com',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie'
  },
  {
    username: 'diana_py',
    email: 'diana@example.com',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana'
  },
  {
    username: 'eve_react',
    email: 'eve@example.com',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eve'
  }
];

const sampleDocuments = [
  {
    title: 'React Todo App',
    content: `import React, { useState } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div className="todo-app">
      <h1>My Todo List</h1>
      <div>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} onClick={() => toggleTodo(todo.id)}>
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;`,
    language: 'javascript',
    isPublic: true
  },
  {
    title: 'Python Data Analysis',
    content: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load sample data
data = {
    'name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    'age': [25, 30, 35, 28, 32],
    'salary': [50000, 60000, 70000, 55000, 65000],
    'department': ['Engineering', 'Marketing', 'Engineering', 'HR', 'Engineering']
}

df = pd.DataFrame(data)

# Basic statistics
print("Dataset Overview:")
print(df.head())
print("\\nBasic Statistics:")
print(df.describe())

# Group by department
dept_stats = df.groupby('department').agg({
    'salary': ['mean', 'count'],
    'age': 'mean'
}).round(2)

print("\\nDepartment Statistics:")
print(dept_stats)

# Create visualization
plt.figure(figsize=(10, 6))
plt.subplot(1, 2, 1)
df.groupby('department')['salary'].mean().plot(kind='bar')
plt.title('Average Salary by Department')
plt.ylabel('Salary')

plt.subplot(1, 2, 2)
plt.scatter(df['age'], df['salary'])
plt.xlabel('Age')
plt.ylabel('Salary')
plt.title('Age vs Salary')

plt.tight_layout()
plt.show()`,
    language: 'python',
    isPublic: false
  },
  {
    title: 'Express API Server',
    content: `const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
    language: 'javascript',
    isPublic: true
  },
  {
    title: 'CSS Grid Layout',
    content: `.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.card-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
}

.card-title {
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.card-content {
  color: #666;
  line-height: 1.6;
}

.card-footer {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn:hover {
  background: #0056b3;
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    padding: 10px;
  }
}`,
    language: 'css',
    isPublic: true
  },
  {
    title: 'Java Calculator',
    content: `import java.util.Scanner;

public class Calculator {
    private Scanner scanner;
    
    public Calculator() {
        this.scanner = new Scanner(System.in);
    }
    
    public void start() {
        System.out.println("=== Simple Calculator ===");
        System.out.println("Available operations: +, -, *, /, ^, sqrt");
        System.out.println("Type 'quit' to exit");
        
        while (true) {
            System.out.print("\\nEnter operation (or 'quit'): ");
            String input = scanner.nextLine().trim();
            
            if (input.equalsIgnoreCase("quit")) {
                System.out.println("Goodbye!");
                break;
            }
            
            processOperation(input);
        }
    }
    
    private void processOperation(String operation) {
        try {
            if (operation.startsWith("sqrt")) {
                handleSquareRoot(operation);
            } else {
                handleBasicOperation(operation);
            }
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
    
    private void handleSquareRoot(String operation) {
        String[] parts = operation.split("\\\\s+");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid sqrt format. Use: sqrt <number>");
        }
        
        double number = Double.parseDouble(parts[1]);
        if (number < 0) {
            throw new IllegalArgumentException("Cannot calculate square root of negative number");
        }
        
        double result = Math.sqrt(number);
        System.out.printf("√%.2f = %.2f%n", number, result);
    }
    
    private void handleBasicOperation(String operation) {
        String[] parts = operation.split("\\\\s+");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid format. Use: <number> <operator> <number>");
        }
        
        double num1 = Double.parseDouble(parts[0]);
        String operator = parts[1];
        double num2 = Double.parseDouble(parts[2]);
        
        double result = calculate(num1, operator, num2);
        System.out.printf("%.2f %s %.2f = %.2f%n", num1, operator, num2, result);
    }
    
    private double calculate(double num1, String operator, double num2) {
        switch (operator) {
            case "+":
                return num1 + num2;
            case "-":
                return num1 - num2;
            case "*":
                return num1 * num2;
            case "/":
                if (num2 == 0) {
                    throw new ArithmeticException("Division by zero");
                }
                return num1 / num2;
            case "^":
                return Math.pow(num1, num2);
            default:
                throw new IllegalArgumentException("Unknown operator: " + operator);
        }
    }
    
    public static void main(String[] args) {
        Calculator calculator = new Calculator();
        calculator.start();
    }
}`,
    language: 'java',
    isPublic: false
  }
];

async function createDataset() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Document.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users
    console.log('👥 Creating sample users...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const user = new User(userData);
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`   ✓ Created user: ${userData.username}`);
    }

    // Create documents
    console.log('📄 Creating sample documents...');
    
    for (let i = 0; i < sampleDocuments.length; i++) {
      const docData = sampleDocuments[i];
      const owner = createdUsers[i % createdUsers.length];
      
      // Add collaborators (random selection)
      const collaborators = [];
      const numCollaborators = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numCollaborators; j++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        if (randomUser._id.toString() !== owner._id.toString() && 
            !collaborators.some(c => c.user.toString() === randomUser._id.toString())) {
          collaborators.push({
            user: randomUser._id,
            permission: ['read', 'write', 'admin'][Math.floor(Math.random() * 3)],
            joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
          });
        }
      }

      const document = new Document({
        ...docData,
        owner: owner._id,
        collaborators: collaborators,
        version: Math.floor(Math.random() * 10) + 1
      });

      await document.save();
      console.log(`   ✓ Created document: ${docData.title} (Owner: ${owner.username})`);
    }

    // Create some additional collaborative documents
    console.log('🤝 Creating collaborative documents...');
    
    const collaborativeDoc = new Document({
      title: 'Team Project - Chat Application',
      content: `// Real-time Chat Application
// Team collaboration project

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store active users
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Handle user joining
  socket.on('join', (userData) => {
    activeUsers.set(socket.id, userData);
    socket.broadcast.emit('userJoined', userData);
  });
  
  // Handle messages
  socket.on('message', (messageData) => {
    io.emit('newMessage', {
      ...messageData,
      timestamp: new Date(),
      user: activeUsers.get(socket.id)
    });
  });
  
  // Handle typing indicators
  socket.on('typing', (isTyping) => {
    socket.broadcast.emit('userTyping', {
      user: activeUsers.get(socket.id),
      isTyping
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      socket.broadcast.emit('userLeft', user);
      activeUsers.delete(socket.id);
    }
  });
});

server.listen(3000, () => {
  console.log('Chat server running on port 3000');
});`,
      language: 'javascript',
      owner: createdUsers[0]._id,
      collaborators: [
        { user: createdUsers[1]._id, permission: 'admin' },
        { user: createdUsers[2]._id, permission: 'write' },
        { user: createdUsers[3]._id, permission: 'write' }
      ],
      isPublic: false,
      activeUsers: [
        {
          user: createdUsers[1]._id,
          cursor: { line: 25, column: 15 },
          selection: { startLine: 25, startColumn: 10, endLine: 25, endColumn: 20 }
        },
        {
          user: createdUsers[2]._id,
          cursor: { line: 45, column: 8 }
        }
      ]
    });

    await collaborativeDoc.save();
    console.log('   ✓ Created collaborative document');

    // Display summary
    console.log('\n📊 Dataset Creation Summary:');
    console.log(`   👥 Users created: ${createdUsers.length}`);
    console.log(`   📄 Documents created: ${sampleDocuments.length + 1}`);
    console.log(`   🔗 Total collaborations: ${collaborativeDoc.collaborators.length}`);
    
    console.log('\n🎯 Sample Users (all passwords: "password123"):');
    createdUsers.forEach(user => {
      console.log(`   • ${user.username} (${user.email})`);
    });

    console.log('\n📋 Sample Documents:');
    const allDocs = await Document.find().populate('owner', 'username');
    allDocs.forEach(doc => {
      console.log(`   • "${doc.title}" by ${doc.owner.username} (${doc.language})`);
    });

    console.log('\n✅ Dataset created successfully!');
    console.log('🚀 You can now start your backend server and test the API endpoints.');

  } catch (error) {
    console.error('❌ Error creating dataset:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

// Run the dataset creation
createDataset();