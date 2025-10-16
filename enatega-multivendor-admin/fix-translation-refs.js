const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /t\(`Store Creation Failed, Please select a vendor`\)/g, to: "t(`Store Creation Failed - Please select a vendor_`)" },
  { from: /t\(`An error occurred while fetching restaurants\. Please try again later\.`\)/g, to: "t(`An error occurred while fetching restaurants_ Please try again later_`)" },
];

const filesToFix = [
  'lib/ui/screen-components/protected/vendor/restaurants/add-form/restaurant-details.tsx',
  'lib/ui/screen-components/protected/super-admin/vendor/form/restaurant-add-form/restaurant-details.tsx',
];

console.log('Fixing remaining translation key references...\n');

filesToFix.forEach(relPath => {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${relPath} (not found)`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  replacements.forEach(({from, to}) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${relPath}`);
  } else {
    console.log(`  ${relPath} (no changes needed)`);
  }
});

console.log('\nDone!');
