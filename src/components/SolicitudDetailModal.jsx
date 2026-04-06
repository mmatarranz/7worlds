import React, { useState } from 'react';
import { Calendar, User, Phone, Mail, Tag, MessageSquare, X } from 'lucide-react';

export default function SolicitudDetailModal({ solicitud, onClose, onUpdateStatus }) {
  const [loading, setLoading] = useState(false);
  const [localEstado, setLocalEstado] = useState(solicitud.estado);

  if (!solicitud) return null;

  const handleEstadoChange = async (e) => {
    const nuevoEstado = e.target.value;
    setLocalEstado(nuevoEstado);
    setLoading(true);

    try {
      await fetch(`/api/solicitudes/${solicitud.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      // Propagar al padre
      onUpdateStatus(solicitud.id, nuevoEstado);
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (isoString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(isoString).toLocaleDateString('es-ES', options);
  };

  const getMailtoLink = () => {
    const email = solicitud.cliente_email || '';
    const subject = encodeURIComponent(`Re: ${solicitud.asunto} - 7Worlds`);
    return `mailto:${email}?subject=${subject}`;
  };

  return (
    <div className="slideover-overlay" onClick={onClose}>
      <div className="slideover-content" onClick={e => e.stopPropagation()}>
        
        <div className="slideover-header">
          <div>
            <h2 className="slideover-title">Detalle de Solicitud</h2>
            <p className="slideover-subtitle">REF: #{solicitud.id}</p>
          </div>
          <button className="slideover-close" onClick={onClose} aria-label="Cerrar"><X size={24} /></button>
        </div>

        <div className="slideover-body">
          
          <div className="detail-section">
            <div className="status-banner">
              <div className="status-control">
                <span className="status-label">Estado Actual:</span>
                <select 
                  className={`status-select estado-${localEstado}`}
                  value={localEstado} 
                  onChange={handleEstadoChange}
                  disabled={loading}
                >
                  <option value="nueva">NUEVA</option>
                  <option value="proceso">EN PROCESO</option>
                  <option value="confirmada">CONFIRMADA</option>
                  <option value="cancelada">CANCELADA</option>
                </select>
                {loading && <span className="status-loading">...</span>}
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3 className="section-title"><Tag size={16}/> Información Principal</h3>
            <div className="info-box">
              <p className="info-subject">{solicitud.asunto}</p>
              <div className="info-row">
                <Calendar size={14}/> <span>{formatFecha(solicitud.fecha_entrada)}</span>
              </div>
              <div className="info-row">
                <span className="priority-badge">Prioridad: {solicitud.prioridad.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3 className="section-title"><User size={16}/> Datos del Cliente</h3>
            <div className="info-box client-box">
              <p className="client-name">{solicitud.cliente}</p>
              {solicitud.cliente_email && (
                <div className="info-row">
                  <Mail size={14}/> <span>{solicitud.cliente_email}</span>
                </div>
              )}
              {solicitud.cliente_telefono && (
                <div className="info-row">
                  <Phone size={14}/> <span>{solicitud.cliente_telefono}</span>
                </div>
              )}
            </div>
          </div>

          <div className="detail-section flex-grow">
            <h3 className="section-title"><MessageSquare size={16}/> Mensaje / Detalles</h3>
            <div className="message-box">
              {solicitud.cuerpo_mensaje ? (
                <p>{solicitud.cuerpo_mensaje}</p>
              ) : (
                <p className="empty-message">No se proporcionaron detalles adicionales.</p>
              )}
            </div>
          </div>

        </div>

        <div className="slideover-footer">
          <a href={getMailtoLink()} className="btn-reply">
            <Mail size={18}/> Responder al Cliente
          </a>
        </div>

      </div>
    </div>
  );
}
