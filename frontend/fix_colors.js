const fs = require('fs');
const glob = require('glob');

const files = glob.sync('{app,components}/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Colors mapping
  const replaces = [
    { from: /bg-\[\#1E293B\]/g, to: 'bg-deep-navy' },
    { from: /text-\[\#E65100\]/g, to: 'text-saffron' },
    { from: /border-\[\#E65100\]/g, to: 'border-saffron' },
    { from: /hover:border-\[\#E65100\]/g, to: 'hover:border-saffron' },
    { from: /hover:text-\[\#E65100\]/g, to: 'hover:text-saffron' },
    { from: /hover:decoration-\[\#E65100\]/g, to: 'hover:decoration-saffron' },
    { from: /hover:shadow-\[\#E65100\]/g, to: 'hover:shadow-saffron' },
    { from: /ring-\[\#E65100\]/g, to: 'ring-saffron' },
    { from: /bg-\[\#0B1B3D\]/g, to: 'bg-deep-navy' }, // unifying the nav background
    { from: /bg-\[\#E65100\]/g, to: 'bg-saffron' },
    { from: /hover:bg-\[\#ff6a00\]/g, to: 'hover:bg-orange-600' }, // near saffron
    { from: /text-\[\#B45309\]/g, to: 'text-amber-700' }, 
  ];

  replaces.forEach(r => {
    if (content.match(r.from)) {
      content = content.replace(r.from, r.to);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(file, content);
  }
});
