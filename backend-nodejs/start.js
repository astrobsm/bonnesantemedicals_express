const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting AstroBSM-Oracle Node.js Backend...');

// Set working directory
process.chdir(__dirname);

// Start the server
const serverPath = path.join(__dirname, 'dist', 'server.js');
const command = `node "${serverPath}"`;

console.log(`📁 Working directory: ${process.cwd()}`);
console.log(`🔧 Command: ${command}`);

const server = exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Error starting server: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`⚠️ Server stderr: ${stderr}`);
    return;
  }
  console.log(`✅ Server stdout: ${stdout}`);
});

server.stdout.on('data', (data) => {
  console.log(data.toString());
});

server.stderr.on('data', (data) => {
  console.error(data.toString());
});

console.log('📡 Server process started...');
