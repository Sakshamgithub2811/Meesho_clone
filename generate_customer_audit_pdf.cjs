const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname);
const htmlPath = path.resolve(rootDir, 'Meesho_Customer_Panel_Pending_Audit_Report.html');
const pdfPath = path.resolve(rootDir, 'Meesho_Customer_Panel_Pending_Audit_Report.pdf');

const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

const browserPath = edgePaths.find(p => fs.existsSync(p));

if (!browserPath) {
  console.error('No supported browser found.');
  process.exit(1);
}

if (!fs.existsSync(htmlPath)) {
  console.error('HTML file not found:', htmlPath);
  process.exit(1);
}

const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
const cmd = `"${browserPath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${fileUrl}"`;

console.log('Running:', cmd);
execSync(cmd);

if (fs.existsSync(pdfPath)) {
  const stats = fs.statSync(pdfPath);
  console.log(`✅ PDF generated successfully: ${pdfPath} (${(stats.size / 1024).toFixed(1)} KB)`);
} else {
  console.error('❌ PDF was not generated.');
}
