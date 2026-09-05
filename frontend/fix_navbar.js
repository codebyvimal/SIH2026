const fs = require('fs');
const file = 'components/NavBar.tsx';
let content = fs.readFileSync(file, 'utf8');

// Hide avatar and switch links if variant is minimal
content = content.replace(
  '{/* \u2500\u2500 Right slot \u2500\u2500 */}\n      <div className="flex items-center gap-3">',
  '{/* \u2500\u2500 Right slot \u2500\u2500 */}\n      {variant !== "minimal" && (\n      <div className="flex items-center gap-3">'
);
content = content.replace(
  '</AvatarSVG>\n        </div>\n      </div>',
  '</AvatarSVG>\n        </div>\n      </div>\n      )}'
);

fs.writeFileSync(file, content);
