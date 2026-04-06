import React, { useState } from 'react';

export default function NewRequestModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    prioridad: 'normal',
    cuerpo_mensaje: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al guardar');
      }

      const newSolicitud = await response.json();
      onSuccess(newSolicitud); // Actualiza la UI instantáneamente
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">&times;</button>
        <h2 className="modal-title">Nueva Solicitud</h2>
        <p className="modal-subtitle">Introduce los datos del cliente y el detalle de la solicitud.</p>
        
        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <h3>Datos del Cliente</h3>
            <div className="form-group">
              <label>Nombre o Empresa *</label>
              <input required name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej. Juan Gómez o Empresa Alpha" />
            </div>
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Email *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
              </div>
              <div className="form-group flex-1">
                <label>Teléfono</label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="600 123 456" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Detalle de Reserva</h3>
            <div className="form-row">
              <div className="form-group flex-2">
                <label>Asunto *</label>
                <input required name="asunto" value={formData.asunto} onChange={handleChange} placeholder="Ej. Vuelo a París" />
              </div>
              <div className="form-group flex-1">
                <label>Prioridad</label>
                <select name="prioridad" value={formData.prioridad} onChange={handleChange}>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Mensaje / Notas Adicionales</label>
              <textarea 
                name="cuerpo_mensaje" 
                value={formData.cuerpo_mensaje} 
                onChange={handleChange} 
                rows="3" 
                placeholder="Detalles sobre fechas, número de personas, vuelo, etc." 
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Crear Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
