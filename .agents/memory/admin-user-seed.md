---
name: Admin user seed
description: How the default admin user was created and how to regenerate the bcrypt hash
---

## Default admin credentials
- username: `admin`
- password: `admin123`
- role: `admin`
- status: `active`

## Generating a bcrypt hash
The bcryptjs package lives in the workspace node_modules. Generate a hash like this:
```bash
node -e "
const fs = require('fs');
const dirs = fs.readdirSync('/home/runner/workspace/node_modules/.pnpm/').filter(d => d.startsWith('bcryptjs'));
const dir = dirs[0];
const pkg = JSON.parse(fs.readFileSync('/home/runner/workspace/node_modules/.pnpm/' + dir + '/node_modules/bcryptjs/package.json'));
const b = require('/home/runner/workspace/node_modules/.pnpm/' + dir + '/node_modules/bcryptjs/' + (pkg.main || 'index.js'));
b.hash('YOUR_PASSWORD', 10).then(h => console.log(h));
"
```

**Why:** The API auth route uses `comparePassword` from `lib/auth.ts` which calls bcryptjs. Hashes must be generated with the same library.

**How to apply:** Any time a new staff user needs to be seeded in the database, use this pattern to generate the password hash first.
