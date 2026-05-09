package.json (if Node.js):
{
"name": "my-backend",
"scripts": {
"start": "node index.js"
},
"dependencies": { ... }
}
.env file (don't commit this!):
DATABASE_URL=your-database-url
CLERK_SECRET_KEY=your-clerk-key
PORT=3000