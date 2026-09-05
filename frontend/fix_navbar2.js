const fs = require('fs');
const file = 'components/NavBar.tsx';
let content = fs.readFileSync(file, 'utf8');

// The replacement was meant to wrap the right slot
content = content.replace(
  '<AvatarSVG isAdmin={variant === "admin"} />\n        </div>\n      </div>',
  '<AvatarSVG isAdmin={variant === "admin"} />\n        </div>\n      </div>\n      )}'
);

fs.writeFileSync(file, content);
