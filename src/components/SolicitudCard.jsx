import React from 'react';
import { Calendar, User, CheckCircle2 } from 'lucide-react';

export default function SolicitudCard({ solicitud, onAssign, currentUser }) {
  const { 
    asunto, 
    cliente, 
    fecha_entrada, 
    estado, 
    prioridad, 
    asignado_a 
  } = solicitud;

  // Determinar clases extra de estado
  const isNueva = estado === 'nueva';
  const isEnProceso = estado === 'proceso';
  const isConfirmada = estado === 'confirmada';
  const isUrgente = prioridad === 'alta' || prioridad === 'urgente';

  // Formatear Fecha
  const formatFecha = (isoString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(isoString).toLocaleDateString('es-ES', options);
  };

  // Helper para las inicales del Avatar
  const getInitials = (name) => {
    if (!name) return '';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`solicitud-card ${isNueva ? 'estado-nueva' : ''} ${isEnProceso ? 'estado-proceso' : ''}`}>
      
      <div className="card-header">
        <div className="card-date">
          <Calendar size={14} />
          <span>{formatFecha(fecha_entrada)}</span>
        </div>
        {isUrgente && <div className="tag-urgente">Urgente</div>}
      </div>

      <div className="card-body">
        <h3 className="card-subject">{asunto}</h3>
        <div className="card-client">
          <User size={14} />
          <span>{cliente}</span>
        </div>
      </div>

      <div className="card-footer">
        {/* Renderizado especial para Confirmada vs Otros */}
        <div className={`estado-badge ${estado}`}>
          {isConfirmada && <CheckCircle2 size={16} />}
          <span>{estado.toUpperCase()}</span>
        </div>

        <div className="assigned-info">
          {asignado_a && (
            <div className="avatar" title={`Asignado a: ${asignado_a}`}>
              {getInitials(asignado_a)}
            </div>
          )}
          <select 
            className={`assign-select ${!asignado_a ? 'unassigned-select' : ''}`}
            value={asignado_a || ""}
            onChange={(e) => onAssign(solicitud.id, e.target.value || null)}
          >
            <option value="">SIN ASIGNAR</option>
            <option value="Mayte">Mayte</option>
            <option value="Pepi">Pepi</option>
            <option value="Erika">Erika</option>
          </select>
        </div>
      </div>

    </div>
  );
}
