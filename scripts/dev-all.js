const { spawn } = require('child_process');
const net = require('net');

const processes = [];
let shuttingDown = false;

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();

    tester.once('error', () => resolve(false));
    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });

    tester.listen(port, '0.0.0.0');
  });
}

function stopProcessTree(proc) {
  if (!proc || proc.killed || !proc.pid) {
    return;
  }

  if (process.platform === 'win32') {
    spawn('taskkill', ['/PID', String(proc.pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }

  proc.kill('SIGTERM');
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  while (processes.length > 0) {
    stopProcessTree(processes.pop());
  }

  setTimeout(() => process.exit(exitCode), 200);
}

function start(name, scriptName) {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const args = process.platform === 'win32'
    ? ['/d', '/s', '/c', `npm run ${scriptName}`]
    : ['run', scriptName];

  const child = spawn(command, args, { stdio: 'inherit' });

  child.on('exit', (code) => {
    if (!shuttingDown && code !== 0) {
      console.error(`\n[${name}] exited with code ${code}`);
    }
    shutdown(code || 0);
  });

  processes.push(child);
}

async function main() {
  const requiredPorts = [3000, 3001];
  for (const port of requiredPorts) {
    const available = await isPortAvailable(port);
    if (!available) {
      console.error(`Port ${port} is already in use. Stop existing processes, then run npm run dev:all again.`);
      process.exit(1);
    }
  }

  start('api', 'api');
  start('dev', 'dev');
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
