const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
console.log('Conectando a SSH...');

conn.on('ready', () => {
  console.log('Conexión SSH establecida. Cargando seed.sql en el contenedor de PostgreSQL...');
  // The command takes input stream and passes it to postgres.
  conn.exec('docker exec -i b4o8ww4g0gwk00c84sc4kk4s psql -U postgres -d postgres', (err, stream) => {
    if (err) {
      console.error('Error al ejecutar exec:', err);
      conn.end();
      return;
    }
    
    stream.on('close', (code, signal) => {
      console.log('Operación finalizada. Código:', code);
      conn.end();
    }).on('data', (data) => {
      console.log('SALIDA: ' + data);
    }).stderr.on('data', (data) => {
      console.log('ERROR: ' + data);
    });

    // Enviar el archivo SQL al stream
    stream.write(seedSql);
    stream.end();
  });
}).on('error', (err) => {
  console.error('Error de conexión SSH:', err.message);
}).connect({
  host: '212.227.104.207',
  port: 22,
  username: 'root',
  password: 'N$avacedon26&Az*'
});
