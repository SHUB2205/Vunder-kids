const { spawn } = require('child_process');
const path = require('path');

// Function to start a service
function startService(command, directory, name) {
  const process = spawn('node', [command], {
    cwd: path.join(__dirname, directory)
  });

  process.stdout.on('data', (data) => {
    console.log(`[${name}]: ${data}`);
  });

  process.stderr.on('data', (data) => {
    console.error(`[${name}] Error: ${data}`);
  });

  return process;
}

// Start all services
startService('server.js', 'vunder-kids/backend', 'Backend');
startService('server.js', 'vunder-kids/chat', 'Chat');

// For dashboard, you might want to serve the built files
const express = require('express');
const app = express();
app.use(express.static(path.join(__dirname, 'dashboard/build')));
app.listen(process.env.PORT || 2000);