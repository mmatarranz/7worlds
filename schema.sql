-- Enums (Tipos de datos predefinidos)
CREATE TYPE estado_solicitud AS ENUM ('nueva', 'proceso', 'confirmada', 'cancelada');
CREATE TYPE estado_factura AS ENUM ('pendiente', 'pagado');
CREATE TYPE tipo_servicio_enum AS ENUM ('vuelo', 'hotel', 'restaurante');

-- Tabla de Clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(50),
    notas_vip TEXT
);

-- Tabla de Solicitudes (Una solicitud pertenece a un cliente)
CREATE TABLE solicitudes (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL,
    fecha_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    asunto VARCHAR(255) NOT NULL,
    cuerpo_mensaje TEXT,
    estado estado_solicitud DEFAULT 'nueva',
    prioridad VARCHAR(50),
    asignado_a VARCHAR(255),
    CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Tabla de Detalles de Reserva (Una solicitud tiene múltiples detalles)
CREATE TABLE detalles_reserva (
    id SERIAL PRIMARY KEY,
    solicitud_id INT NOT NULL,
    tipo_servicio tipo_servicio_enum,
    proveedor VARCHAR(255),
    fecha_servicio DATE,
    localizador VARCHAR(100),
    archivo_url TEXT,
    CONSTRAINT fk_solicitud_detalle FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE
);

-- Tabla de Facturación (Una solicitud tiene una o más facturas)
CREATE TABLE facturacion (
    id SERIAL PRIMARY KEY,
    solicitud_id INT NOT NULL,
    numero_factura VARCHAR(100) UNIQUE NOT NULL,
    importe_neto NUMERIC(10, 2) NOT NULL,
    iva NUMERIC(5, 2) NOT NULL,
    -- Nota: En PostgreSQL 12+, se pueden usar columnas generadas automáticamente. 
    -- Alternativamente, se calcula en la aplicación o mediante un trigger.
    total NUMERIC(10, 2) GENERATED ALWAYS AS (importe_neto + (importe_neto * (iva / 100))) STORED,
    estado_pago estado_factura DEFAULT 'pendiente',
    CONSTRAINT fk_solicitud_facturacion FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE
);
