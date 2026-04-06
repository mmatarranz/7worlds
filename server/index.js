import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Endpoint: Obtener todas las solicitudes con nombre del cliente
app.get('/api/solicitudes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id, 
        s.fecha_entrada, 
        s.asunto, 
        s.cuerpo_mensaje, 
        s.estado, 
        s.prioridad, 
        s.asignado_a,
        c.nombre AS cliente
      FROM solicitudes s
      JOIN clientes c ON s.cliente_id = c.id
      ORDER BY s.fecha_entrada DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching solicitudes:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint: Crear nueva solicitud y cliente
app.post('/api/solicitudes', async (req, res) => {
  const { nombre, email, telefono, asunto, cuerpo_mensaje, prioridad } = req.body;
  
  if (!nombre || !email || !asunto) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    await pool.query('BEGIN');
    
    // 1. Insert or Update client
    const clientResult = await pool.query(
      `INSERT INTO clientes (nombre, email, telefono) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO UPDATE 
       SET nombre = EXCLUDED.nombre, telefono = EXCLUDED.telefono 
       RETURNING id`,
      [nombre, email, telefono]
    );
    
    const clienteId = clientResult.rows[0].id;

    // 2. Insert solicitud
    const solResult = await pool.query(
      `INSERT INTO solicitudes (cliente_id, asunto, cuerpo_mensaje, estado, prioridad) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [clienteId, asunto, cuerpo_mensaje, 'nueva', prioridad]
    );
    
    const nuevaSolicitudId = solResult.rows[0].id;
    
    // 3. Fetch full unified data to return
    const finalResult = await pool.query(`
      SELECT 
        s.id, s.fecha_entrada, s.asunto, s.cuerpo_mensaje, 
        s.estado, s.prioridad, s.asignado_a,
        c.nombre AS cliente
      FROM solicitudes s
      JOIN clientes c ON s.cliente_id = c.id
      WHERE s.id = $1
    `, [nuevaSolicitudId]);

    await pool.query('COMMIT');
    res.status(201).json(finalResult.rows[0]);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error creating solicitud:', err);
    res.status(500).json({ error: 'Error del servidor al crear solicitud' });
  }
});

// Endpoint: Actualizar asignado_a de una solicitud
app.put('/api/solicitudes/:id/asignar', async (req, res) => {
  const { id } = req.params;
  const { asignado_a } = req.body;
  try {
    await pool.query(
      'UPDATE solicitudes SET asignado_a = $1 WHERE id = $2',
      [asignado_a, id]
    );
    res.json({ success: true, message: 'Asignación actualizada' });
  } catch (err) {
    console.error('Error asignando:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// === Configuración de Producción (Servicio de archivos estáticos de Vite) ===
app.use(express.static(path.join(__dirname, '../dist')));

// Redirigir cualquier otra ruta al index.html de React (para evitar errores 404 en subrutas de React Router)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Backend API escuchando en http://localhost:${port}`);
});
