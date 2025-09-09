// Script to update all API URLs to production
const fs = require('fs');
const path = require('path');

const BACKEND_URL = process.argv[2] || 'https://planncomm-backend.onrender.com';

console.log(`Updating API URLs to: ${BACKEND_URL}`);

// Files to update
const filesToUpdate = [
  'planncomm-frontend/src/components/Dashboard.tsx',
  'planncomm-frontend/src/components/Tasks.tsx',
  'planncomm-frontend/src/components/Planning.tsx',
  'planncomm-frontend/src/components/Clients.tsx',
  'planncomm-frontend/src/components/Employees.tsx',
  'planncomm-frontend/src/components/CompanyOverview.tsx'
];

filesToUpdate.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace localhost URLs with production URL
    content = content.replace(/http:\/\/localhost:5000/g, BACKEND_URL);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log(`\n✅ All API URLs updated to: ${BACKEND_URL}`);
console.log('Now commit and push the changes to deploy!');
