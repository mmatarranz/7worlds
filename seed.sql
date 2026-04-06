-- Borrar datos previos (opcional para entorno seguro de desarrollo)
TRUNCATE TABLE solicitudes, clientes CASCADE;

-- Insertar Clientes de Ejemplo
INSERT INTO clientes (id, nombre, email, telefono, notas_vip) VALUES 
(1, 'Empresa Alpha S.L.', 'contacto@alpha.com', '600111222', null),
(2, 'Juan Carlos Gómez', 'juan.gomez@mail.com', '600222333', 'Cliente VIP histórico'),
(3, 'TechCorp Holdings', 'admin@techcorp.com', '600333444', null),
(4, 'María López', 'maria.lopez@mail.com', '600444555', null),
(5, 'Carlos Ruiz', 'carlos.ruiz@mail.com', '600555666', null);

-- Insertar Solicitudes de Ejemplo
INSERT INTO solicitudes (id, cliente_id, fecha_entrada, asunto, cuerpo_mensaje, estado, prioridad, asignado_a) VALUES
(1, 1, '2026-04-05 09:00:00', 'Reserva Vuelo y Hotel a París', 'Revisar vuelos desde Madrid', 'nueva', 'normal', null),
(2, 2, '2026-04-06 11:30:00', 'Cambio de fechas restaurante', 'El cliente no puede asistir hoy', 'proceso', 'alta', 'Mayte'),
(3, 3, '2026-04-01 15:20:00', 'Facturación Grupo de 40 presonas', 'Enviar facturas consolidadas', 'confirmada', 'normal', 'Pepi'),
(4, 4, '2026-04-06 08:15:00', 'Mesa VIP Sala Razzmatazz', 'Mesa para 5. Botella de Champagne', 'nueva', 'alta', 'Pepi'),
(5, 5, '2026-04-06 10:00:00', 'Cancelación Vuelo AMX123', 'Han cancelado el vuelo en el aeropuerto', 'proceso', 'normal', null);

-- Sincronizar el autoincremental de IDs para evitar conflictos cuando la app añada nuevos
SELECT setval('clientes_id_seq', 5);
SELECT setval('solicitudes_id_seq', 5);
