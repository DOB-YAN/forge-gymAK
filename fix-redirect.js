// Update the redirect code in main.tsx
const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');
// Remove the old GitHub Pages redirect and replace with Firebase-compatible version
content = content.replace(/\/\/ Restore original URL.*?\n(?:\n|.)*?if \(redirect\) \{[^}]*\}\n/g, '');
// Add Firebase-compatible redirect restoration
const redirectCode = `// Restore original URL after redirect (Firebase/GitHub Pages)
const redirect = sessionStorage.getItem('redirect');
if (redirect) {
  sessionStorage.removeItem('redirect');
  const url = new URL(redirect);
  if (url.pathname !== '/' && url.pathname !== '') {
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }
}

`;
content = content.replace('createRoot(', redirectCode + 'createRoot(');
fs.writeFileSync('src/main.tsx', content);
console.log('Updated main.tsx');
