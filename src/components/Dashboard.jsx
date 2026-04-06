import React, { useState, useEffect } from 'react';
import SolicitudCard from './SolicitudCard';
import NewRequestModal from './NewRequestModal';
import SolicitudDetailModal from './SolicitudDetailModal';

export default function Dashboard() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL'); /* 'ALL', 'MINE', 'UNASSIGNED', 'URGENT' */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const currentUser = 'Mayte'; // Simulación de usuario logueado en base a tus trabajadoras

  useEffect(() => {
    fetch('/api/solicitudes')
      .then(res => res.json())
      .then(data => {
        setSolicitudes(data);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching data:", err));
  }, []);
  
  const handleAssign = async (id, newAsignado) => {
    // 1. Local update for instant response
    setSolicitudes(prev => prev.map(sol => sol.id === id ? { ...sol, asignado_a: newAsignado } : sol));
    
    // 2. Persist safely to Backend
    try {
      await fetch(`/api/solicitudes/${id}/asignar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asignado_a: newAsignado })
      });
    } catch (err) {
      console.error("Error syncing assignment:", err);
    }
  };
  const handleNewRequestSuccess = (newSolicitud) => {
    setSolicitudes(prev => [newSolicitud, ...prev]);
    setIsModalOpen(false);
  };

  const handleUpdateStatus = (id, nuevoEstado) => {
    setSolicitudes(prev => prev.map(sol => sol.id === id ? { ...sol, estado: nuevoEstado } : sol));
    if (selectedSolicitud && selectedSolicitud.id === id) {
      setSelectedSolicitud(prev => ({ ...prev, estado: nuevoEstado }));
    }
  };
  
  const filteredSolicitudes = solicitudes.filter((solicitud) => {
    switch (activeFilter) {
      case 'MINE':
        return solicitud.asignado_a === currentUser;
      case 'UNASSIGNED':
        return solicitud.asignado_a === null;
      case 'URGENT':
        return solicitud.prioridad === 'alta' || solicitud.prioridad === 'urgente';
      default:
        return true; // Mostrar todas
    }
  });

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container">
          <img src="/logo.png" alt="7Worlds Logo" />
        </div>
        <div>
          <h1 className="dashboard-title">Panel de Control</h1>
          <p className="dashboard-subtitle">Gestiona las solicitudes de reservas entrantes</p>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end'}}>
          <button className="fab-button" onClick={() => setIsModalOpen(true)}>
            + Nueva Solicitud
          </button>
        </div>
      </header>

      <div className="filter-bar">
        <button 
          className={`filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveFilter('ALL')}
        >
          Todas
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'MINE' ? 'active' : ''}`}
          onClick={() => setActiveFilter('MINE')}
        >
          Mis Reservas
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'UNASSIGNED' ? 'active' : ''}`}
          onClick={() => setActiveFilter('UNASSIGNED')}
        >
          Pendientes de Asignar
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'URGENT' ? 'active' : ''}`}
          onClick={() => setActiveFilter('URGENT')}
        >
          Urgentes
        </button>
      </div>

      <div className="cards-grid">
        {loading ? (
          <p style={{ color: 'var(--text-secondary)'}}>Conectando a base de datos segura y cargando...</p>
        ) : filteredSolicitudes.length > 0 ? (
          filteredSolicitudes.map((sol) => (
            <SolicitudCard 
              key={sol.id} 
              solicitud={sol} 
              onAssign={handleAssign} 
              currentUser={currentUser} 
              onClick={() => setSelectedSolicitud(sol)}
            />
          ))
        ) : (
          <p style={{ color: 'var(--text-secondary)'}}>No se han encontrado solicitudes con estos filtros.</p>
        )}
      </div>

      {isModalOpen && (
        <NewRequestModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleNewRequestSuccess} 
        />
      )}

      {selectedSolicitud && (
        <SolicitudDetailModal
          solicitud={selectedSolicitud}
          onClose={() => setSelectedSolicitud(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

    </div>
  );
}
