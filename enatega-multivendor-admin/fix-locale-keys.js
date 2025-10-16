const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

console.log(`Fixing locale files in ${localesDir}...`);

files.forEach(file => {
  const filePath = path.join(localesDir, file);
  console.log(`Processing: ${file}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  
  // Create new object with fixed keys
  const fixed = {};
  let changedCount = 0;
  
  for (const [key, value] of Object.entries(data)) {
    // Replace periods with underscores in keys
    const fixedKey = key.replace(/\./g, '_');
    if (fixedKey !== key) {
      changedCount++;
      console.log(`  "${key}" -> "${fixedKey}"`);
    }
    fixed[fixedKey] = value;
  }
  
  // Write back with pretty formatting
  fs.writeFileSync(filePath, JSON.stringify(fixed, null, 2), 'utf8');
  console.log(`  ✓ Fixed ${changedCount} keys in ${file}\n`);
});

console.log('All locale files fixed!');
