#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Environment variables template
const envTemplate = `# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_LOCATIONIQ_API_KEY=pk.1dca78a113a7c45533e83e6c9f2196ae

# App Configuration
NEXT_PUBLIC_APP_NAME=RideFast
NEXT_PUBLIC_APP_DESCRIPTION=A Ride Sharing Application similar to that of Rapido or Ola where a customer can book their ride conveniently
`;

// Create .env.local file
const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local file with default configuration');
} else {
  console.log('⚠️  .env.local file already exists, skipping creation');
}

console.log('\n🚀 Environment setup complete!');
console.log('\nNext steps:');
console.log('1. Review and update .env.local with your API keys');
console.log('2. Run: npm run dev');
console.log('3. Open http://localhost:3000 in your browser');
console.log('\nFor more information, see README.md');

