// app.js - Sistema de Gestión de Agua Inteligente

// Datos de ejemplo para las alertas
const sampleAlerts = [
    {
        id: 1,
        type: 'critical',
        title: 'Fuga Masiva Detectada',
        details: 'Calle Sonora 123, Col. Condesa - Flujo: 45 L/min',
        time: 'Hace 5 minutos',
        address: 'Calle Sonora 123, Col. Condesa, Alc. Cuauhtémoc',
        status: 'pending',
        lat: 19.4125,
        lng: -99.1755
    },
    {
        id: 2,
        type: 'high',
        title: 'Consumo Inusual Persistente',
        details: 'Av. Insurgentes 456, Col. Roma - 300% sobre promedio',
        time: 'Hace 15 minutos',
        address: 'Av. Insurgentes 456, Col. Roma Norte, Alc. Cuauhtémoc',
        status: 'in-progress',
        lat: 19.4170,
        lng: -99.1612
    },
    {
        id: 3,
        type: 'medium',
        title: 'Posible Fuga Menor',
        details: 'Calle Durango 789, Col. Juárez - Flujo constante nocturno',
        time: 'Hace 2 horas',
        address: 'Calle Durango 789, Col. Juárez, Alc. Cuauhtémoc',
        status: 'pending',
        lat: 19.4260,
        lng: -99.1590
    },
    {
        id: 4,
        type: 'low',
        title: 'Medidor Offline',
        details: 'Eje Central 321, Col. Centro - Sin comunicación por 24h',
        time: 'Hace 1 día',
        address: 'Eje Central 321, Col. Centro, Alc. Cuauhtémoc',
        status: 'resolved',
        lat: 19.4326,
        lng: -99.1332
    },
    {
        id: 5,
        type: 'critical',
        title: 'Fuga en Vía Pública',
        details: 'Av. Reforma 654, Col. Tabacalera - Reporte ciudadano',
        time: 'Hace 30 minutos',
        address: 'Av. Reforma 654, Col. Tabacalera, Alc. Cuauhtémoc',
        status: 'in-progress',
        lat: 19.4355,
        lng: -99.1532
    }
];

// Datos de ejemplo para clientes
const sampleCustomers = [
    {
        id: 1,
        name: 'María González Hernández',
        details: 'Calle Sonora 123, Col. Condesa - Medidor: AXC-2345',
        status: 'warning',
        consumption: '345 L/día',
        zone: 'north'
    },
    {
        id: 2,
        name: 'Carlos López Martínez',
        details: 'Av. Insurgentes 456, Col. Roma Norte - Medidor: BCD-5678',
        status: 'active',
        consumption: '210 L/día',
        zone: 'north'
    },
    {
        id: 3,
        name: 'Ana Rodríguez Silva',
        details: 'Calle Durango 789, Col. Juárez - Medidor: CDE-9012',
        status: 'active',
        consumption: '195 L/día',
        zone: 'south'
    },
    {
        id: 4,
        name: 'Roberto Sánchez Pérez',
        details: 'Eje Central 321, Col. Centro - Medidor: DEF-3456',
        status: 'inactive',
        consumption: '0 L/día',
        zone: 'east'
    },
    {
        id: 5,
        name: 'Laura Mendoza Cruz',
        details: 'Av. Reforma 654, Col. Tabacalera - Medidor: EFG-7890',
        status: 'warning',
        consumption: '420 L/día',
        zone: 'west'
    }
];

// Datos de ejemplo para reportes
const sampleReports = [
    {
        id: 1,
        title: 'Reporte de Consumo Mensual',
        details: 'Enero 2024 - Análisis de tendencias de consumo',
        status: 'completed',
        date: '15/01/2024',
        type: 'consumption'
    },
    {
        id: 2,
        title: 'Análisis de Fugas por Zona',
        details: 'Diciembre 2023 - Identificación de zonas críticas',
        status: 'completed',
        date: '05/01/2024',
        type: 'leaks'
    },
    {
        id: 3,
        title: 'Reporte Financiero Trimestral',
        details: 'Oct-Dic 2023 - Estado de cuenta y cobranza',
        status: 'pending',
        date: 'Por generar',
        type: 'financial'
    },
    {
        id: 4,
        title: 'Evaluación de Alertas',
        details: 'Enero 2024 - Eficiencia en respuesta a incidentes',
        status: 'completed',
        date: '10/01/2024',
        type: 'alerts'
    }
];

// Coordenadas para el mapa (CDMX)
const cdmxCoords = [19.4326, -99.1332];
let map, dashboardMap;
let markers = [];

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initMaps();
    loadDashboardData();
    initEventListeners();
});

// Navegación entre vistas
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const viewId = this.getAttribute('data-view') + '-view';
            
            // Actualizar navegación activa
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar vista correspondiente
            document.querySelectorAll('.view').forEach(view => {
                view.classList.remove('active');
            });
            document.getElementById(viewId).classList.add('active');
            
            // Cargar datos específicos de la vista
            switch(viewId) {
                case 'map-view':
                    loadMapData();
                    break;
                case 'alerts-view':
                    loadAllAlerts();
                    break;
                case 'customers-view':
                    loadCustomers();
                    break;
                case 'reports-view':
                    loadReports();
                    break;
            }
        });
    });
}

// Inicializar mapas
function initMaps() {
    // Mapa principal
    map = L.map('main-map').setView(cdmxCoords, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Mapa del dashboard
    dashboardMap = L.map('dashboard-map').setView(cdmxCoords, 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(dashboardMap);

    // Agregar marcadores al mapa del dashboard
    addMarkersToMap(dashboardMap, sampleAlerts);
}

// Agregar marcadores al mapa
function addMarkersToMap(mapInstance, alerts) {
    // Limpiar marcadores existentes
    markers.forEach(marker => mapInstance.removeLayer(marker));
    markers = [];

    alerts.forEach(alert => {
        let iconColor;
        switch(alert.type) {
            case 'critical':
                iconColor = 'red';
                break;
            case 'high':
                iconColor = 'orange';
                break;
            case 'medium':
                iconColor = 'blue';
                break;
            default:
                iconColor = 'green';
        }

        const marker = L.marker([alert.lat, alert.lng], {
            icon: L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: ${iconColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            })
        }).addTo(mapInstance);

        marker.bindPopup(`
            <strong>${alert.title}</strong><br>
            ${alert.details}<br>
            <small>${alert.time}</small><br>
            <button class="btn btn-sm btn-primary" onclick="viewAlertDetails(${alert.id})">Ver Detalles</button>
            ${alert.type === 'critical' || alert.type === 'high' ? 
                `<button class="btn btn-sm btn-danger" onclick="openCutoffModal('${alert.address}')">Cortar Suministro</button>` : 
                ''
            }
        `);

        markers.push(marker);
    });
}

// Cargar datos del dashboard
function loadDashboardData() {
    loadAlerts();
    addMarkersToMap(dashboardMap, sampleAlerts);
}

// Cargar alertas en el dashboard
function loadAlerts() {
    const alertsList = document.getElementById('alerts-list');
    alertsList.innerHTML = '';
    
    sampleAlerts.forEach(alert => {
        const alertItem = document.createElement('div');
        alertItem.className = `alert-item alert-${alert.type}`;
        
        alertItem.innerHTML = `
            <div class="alert-icon"></div>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-details">${alert.details} • ${alert.time}</div>
            </div>
            <div class="alert-actions">
                <button class="btn btn-primary view-details" data-id="${alert.id}">Detalles</button>
                ${alert.type === 'critical' || alert.type === 'high' ? 
                  `<button class="btn btn-danger cutoff-action" data-id="${alert.id}" data-address="${alert.address}">Cortar Suministro</button>` : 
                  ''}
            </div>
        `;
        
        alertsList.appendChild(alertItem);
    });
    
    // Agregar event listeners a los botones
    document.querySelectorAll('.cutoff-action').forEach(button => {
        button.addEventListener('click', function() {
            const address = this.getAttribute('data-address');
            openCutoffModal(address);
        });
    });
}

// Cargar todas las alertas (vista de alertas)
function loadAllAlerts() {
    const alertsList = document.getElementById('all-alerts-list');
    alertsList.innerHTML = '';
    
    sampleAlerts.forEach(alert => {
        const alertItem = document.createElement('div');
        alertItem.className = `alert-item alert-${alert.type}`;
        
        let statusBadge = '';
        switch(alert.status) {
            case 'pending':
                statusBadge = '<span class="badge badge-warning">Pendiente</span>';
                break;
            case 'in-progress':
                statusBadge = '<span class="badge badge-info">En Progreso</span>';
                break;
            case 'resolved':
                statusBadge = '<span class="badge badge-success">Resuelta</span>';
                break;
        }
        
        alertItem.innerHTML = `
            <div class="alert-icon"></div>
            <div class="alert-content">
                <div class="alert-title">${alert.title} ${statusBadge}</div>
                <div class="alert-details">${alert.details} • ${alert.time}</div>
            </div>
            <div class="alert-actions">
                <button class="btn btn-primary" onclick="viewAlertDetails(${alert.id})">Detalles</button>
                <button class="btn btn-warning" onclick="changeAlertStatus(${alert.id})">Cambiar Estado</button>
                ${alert.type === 'critical' || alert.type === 'high' ? 
                  `<button class="btn btn-danger" onclick="openCutoffModal('${alert.address}')">Cortar Suministro</button>` : 
                  ''}
            </div>
        `;
        
        alertsList.appendChild(alertItem);
    });
}

// Cargar clientes
function loadCustomers() {
    const customersList = document.getElementById('customers-list');
    customersList.innerHTML = '';
    
    sampleCustomers.forEach(customer => {
        const customerItem = document.createElement('div');
        customerItem.className = `customer-item customer-${customer.status}`;
        
        customerItem.innerHTML = `
            <div class="customer-status"></div>
            <div class="customer-content">
                <div class="customer-name">${customer.name}</div>
                <div class="customer-details">${customer.details} • Consumo: ${customer.consumption}</div>
            </div>
            <div class="customer-actions">
                <button class="btn btn-primary" onclick="viewCustomerDetails(${customer.id})">Ver Detalles</button>
                <button class="btn btn-warning" onclick="editCustomer(${customer.id})">Editar</button>
                <button class="btn btn-info" onclick="viewConsumptionHistory(${customer.id})">Historial</button>
            </div>
        `;
        
        customersList.appendChild(customerItem);
    });
}

// Cargar reportes
function loadReports() {
    const reportsList = document.getElementById('reports-list');
    reportsList.innerHTML = '';
    
    sampleReports.forEach(report => {
        const reportItem = document.createElement('div');
        reportItem.className = `report-item report-${report.status}`;
        
        reportItem.innerHTML = `
            <div class="report-icon"></div>
            <div class="report-content">
                <div class="report-title">${report.title}</div>
                <div class="report-details">${report.details} • Generado: ${report.date}</div>
            </div>
            <div class="report-actions">
                <button class="btn btn-primary" onclick="viewReport(${report.id})">Ver</button>
                <button class="btn btn-success" onclick="downloadReport(${report.id})">Descargar</button>
                ${report.status === 'pending' ? 
                  `<button class="btn btn-warning" onclick="generateReport(${report.id})">Generar</button>` : 
                  ''}
            </div>
        `;
        
        reportsList.appendChild(reportItem);
    });
}

// Cargar datos del mapa
function loadMapData() {
    addMarkersToMap(map, sampleAlerts);
    
    // Actualizar estadísticas del mapa
    document.getElementById('meters-in-view').textContent = '142';
    document.getElementById('alerts-in-view').textContent = sampleAlerts.length;
    document.getElementById('avg-consumption').textContent = '245';
    document.getElementById('leaks-detected').textContent = sampleAlerts.filter(a => a.type === 'critical').length;
}

// Inicializar event listeners
function initEventListeners() {
    // Filtros del dashboard
    document.getElementById('zone-filter').addEventListener('change', filterDashboard);
    document.getElementById('alert-filter').addEventListener('change', filterDashboard);
    
    // Filtros del mapa
    document.getElementById('map-zone-filter').addEventListener('change', filterMap);
    document.getElementById('map-alert-filter').addEventListener('change', filterMap);
    
    // Filtros de alertas
    document.getElementById('alerts-type-filter').addEventListener('change', filterAlerts);
    document.getElementById('alerts-status-filter').addEventListener('change', filterAlerts);
    
    // Filtros de clientes
    document.getElementById('customers-status-filter').addEventListener('change', filterCustomers);
    document.getElementById('customers-zone-filter').addEventListener('change', filterCustomers);
    
    // Reportes
    document.getElementById('generate-report').addEventListener('click', generateReport);
    
    // Botones de actualización
    document.getElementById('refresh-alerts').addEventListener('click', loadAlerts);
    document.getElementById('refresh-map').addEventListener('click', loadMapData);
    document.getElementById('refresh-main-map').addEventListener('click', loadMapData);
    
    // Modal de corte
    document.querySelector('.close-modal').addEventListener('click', closeCutoffModal);
    document.getElementById('cancel-cutoff').addEventListener('click', closeCutoffModal);
    document.getElementById('confirm-cutoff').addEventListener('click', confirmCutoff);
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('cutoff-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCutoffModal();
        }
    });
    
    // Búsqueda en tiempo real
    document.querySelectorAll('.search-input').forEach(input => {
        input.addEventListener('input', function() {
            const view = this.closest('.view').id;
            switch(view) {
                case 'alerts-view':
                    filterAlerts();
                    break;
                case 'customers-view':
                    filterCustomers();
                    break;
            }
        });
    });
}

// Filtrar dashboard
function filterDashboard() {
    const zoneFilter = document.getElementById('zone-filter').value;
    const alertFilter = document.getElementById('alert-filter').value;
    
    let filteredAlerts = [...sampleAlerts];
    
    if (alertFilter !== 'all') {
        filteredAlerts = filteredAlerts.filter(alert => alert.type === alertFilter);
    }
    
    // En una implementación real, aquí se filtraría por zona también
    loadAlertsList(filteredAlerts, 'alerts-list');
    addMarkersToMap(dashboardMap, filteredAlerts);
}

// Filtrar mapa
function filterMap() {
    const zoneFilter = document.getElementById('map-zone-filter').value;
    const alertFilter = document.getElementById('map-alert-filter').value;
    
    let filteredAlerts = [...sampleAlerts];
    
    if (alertFilter !== 'all') {
        filteredAlerts = filteredAlerts.filter(alert => alert.type === alertFilter);
    }
    
    // En una implementación real, aquí se filtraría por zona también
    addMarkersToMap(map, filteredAlerts);
    
    // Actualizar estadísticas
    document.getElementById('alerts-in-view').textContent = filteredAlerts.length;
    document.getElementById('leaks-detected').textContent = 
        filteredAlerts.filter(a => a.type === 'critical').length;
}

// Filtrar alertas
function filterAlerts() {
    const typeFilter = document.getElementById('alerts-type-filter').value;
    const statusFilter = document.getElementById('alerts-status-filter').value;
    const searchTerm = document.querySelector('#alerts-view .search-input').value.toLowerCase();
    
    let filteredAlerts = [...sampleAlerts];
    
    if (typeFilter !== 'all') {
        // Simulación de filtrado por tipo
        filteredAlerts = filteredAlerts.filter(alert => 
            alert.title.toLowerCase().includes(typeFilter) || 
            alert.details.toLowerCase().includes(typeFilter)
        );
    }
    
    if (statusFilter !== 'all') {
        filteredAlerts = filteredAlerts.filter(alert => alert.status === statusFilter);
    }
    
    if (searchTerm) {
        filteredAlerts = filteredAlerts.filter(alert => 
            alert.title.toLowerCase().includes(searchTerm) || 
            alert.details.toLowerCase().includes(searchTerm) ||
            alert.address.toLowerCase().includes(searchTerm)
        );
    }
    
    loadAlertsList(filteredAlerts, 'all-alerts-list');
}

// Filtrar clientes
function filterCustomers() {
    const statusFilter = document.getElementById('customers-status-filter').value;
    const zoneFilter = document.getElementById('customers-zone-filter').value;
    const searchTerm = document.querySelector('#customers-view .search-input').value.toLowerCase();
    
    let filteredCustomers = [...sampleCustomers];
    
    if (statusFilter !== 'all') {
        filteredCustomers = filteredCustomers.filter(customer => customer.status === statusFilter);
    }
    
    if (zoneFilter !== 'all') {
        filteredCustomers = filteredCustomers.filter(customer => customer.zone === zoneFilter);
    }
    
    if (searchTerm) {
        filteredCustomers = filteredCustomers.filter(customer => 
            customer.name.toLowerCase().includes(searchTerm) || 
            customer.details.toLowerCase().includes(searchTerm)
        );
    }
    
    loadCustomersList(filteredCustomers);
}

// Cargar lista de alertas
function loadAlertsList(alerts, listId) {
    const alertsList = document.getElementById(listId);
    alertsList.innerHTML = '';
    
    alerts.forEach(alert => {
        const alertItem = document.createElement('div');
        alertItem.className = `alert-item alert-${alert.type}`;
        
        let statusBadge = '';
        switch(alert.status) {
            case 'pending':
                statusBadge = '<span style="background: #f39c12; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">Pendiente</span>';
                break;
            case 'in-progress':
                statusBadge = '<span style="background: #3498db; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">En Progreso</span>';
                break;
            case 'resolved':
                statusBadge = '<span style="background: #27ae60; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">Resuelta</span>';
                break;
        }
        
        alertItem.innerHTML = `
            <div class="alert-icon"></div>
            <div class="alert-content">
                <div class="alert-title">${alert.title} ${statusBadge}</div>
                <div class="alert-details">${alert.details} • ${alert.time}</div>
            </div>
            <div class="alert-actions">
                <button class="btn btn-primary" onclick="viewAlertDetails(${alert.id})">Detalles</button>
                <button class="btn btn-warning" onclick="changeAlertStatus(${alert.id})">Cambiar Estado</button>
                ${alert.type === 'critical' || alert.type === 'high' ? 
                  `<button class="btn btn-danger" onclick="openCutoffModal('${alert.address}')">Cortar Suministro</button>` : 
                  ''}
            </div>
        `;
        
        alertsList.appendChild(alertItem);
    });
}

// Cargar lista de clientes
function loadCustomersList(customers) {
    const customersList = document.getElementById('customers-list');
    customersList.innerHTML = '';
    
    customers.forEach(customer => {
        const customerItem = document.createElement('div');
        customerItem.className = `customer-item customer-${customer.status}`;
        
        customerItem.innerHTML = `
            <div class="customer-status"></div>
            <div class="customer-content">
                <div class="customer-name">${customer.name}</div>
                <div class="customer-details">${customer.details} • Consumo: ${customer.consumption}</div>
            </div>
            <div class="customer-actions">
                <button class="btn btn-primary" onclick="viewCustomerDetails(${customer.id})">Ver Detalles</button>
                <button class="btn btn-warning" onclick="editCustomer(${customer.id})">Editar</button>
                <button class="btn btn-info" onclick="viewConsumptionHistory(${customer.id})">Historial</button>
            </div>
        `;
        
        customersList.appendChild(customerItem);
    });
}

// Abrir modal de confirmación de corte
function openCutoffModal(address) {
    const modal = document.getElementById('cutoff-modal');
    document.getElementById('cutoff-address').textContent = address;
    modal.style.display = 'flex';
}

// Cerrar modal de confirmación de corte
function closeCutoffModal() {
    const modal = document.getElementById('cutoff-modal');
    modal.style.display = 'none';
    // Limpiar formulario
    document.getElementById('cutoff-reason').value = '';
    document.getElementById('cutoff-notes').value = '';
}

// Confirmar corte de suministro
function confirmCutoff() {
    const reason = document.getElementById('cutoff-reason').value;
    const notes = document.getElementById('cutoff-notes').value;
    
    if (!reason) {
        alert('Por favor, seleccione una justificación para el corte.');
        return;
    }
    
    // Aquí iría la lógica para enviar el comando de corte al servidor
    console.log('Corte confirmado:', {
        address: document.getElementById('cutoff-address').textContent,
        reason: reason,
        notes: notes
    });
    
    // Mostrar confirmación
    alert('Comando de corte enviado correctamente. El suministro se cortará en los próximos minutos.');
    
    closeCutoffModal();
}

// Funciones de utilidad (simuladas)
function viewAlertDetails(alertId) {
    const alert = sampleAlerts.find(a => a.id === alertId);
    alert(`Detalles de la alerta:\n\n${alert.title}\n${alert.details}\n${alert.address}\n${alert.time}`);
}

function changeAlertStatus(alertId) {
    const alert = sampleAlerts.find(a => a.id === alertId);
    const newStatus = prompt('Cambiar estado de la alerta:', alert.status);
    if (newStatus) {
        alert.status = newStatus;
        loadAllAlerts();
        alert('Estado de la alerta actualizado correctamente.');
    }
}

function viewCustomerDetails(customerId) {
    const customer = sampleCustomers.find(c => c.id === customerId);
    alert(`Detalles del cliente:\n\n${customer.name}\n${customer.details}\nConsumo: ${customer.consumption}`);
}

function editCustomer(customerId) {
    const customer = sampleCustomers.find(c => c.id === customerId);
    alert(`Editando cliente: ${customer.name}`);
    // En una implementación real, aquí se abriría un formulario de edición
}

function viewConsumptionHistory(customerId) {
    alert('Mostrando historial de consumo del cliente');
    // En una implementación real, aquí se mostraría un gráfico de consumo
}

function viewReport(reportId) {
    const report = sampleReports.find(r => r.id === reportId);
    alert(`Vista previa del reporte:\n\n${report.title}\n${report.details}\nFecha: ${report.date}`);
}

function downloadReport(reportId) {
    alert('Descargando reporte...');
    // En una implementación real, aquí se generaría y descargaría el reporte
}

function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const reportPeriod = document.getElementById('report-period').value;
    
    alert(`Generando reporte de ${reportType} para el período: ${reportPeriod}`);
    // En una implementación real, aquí se generaría el reporte con los datos actuales
}

// Exportar funcionalidades para uso global
window.openCutoffModal = openCutoffModal;
window.viewAlertDetails = viewAlertDetails;
window.changeAlertStatus = changeAlertStatus;
window.viewCustomerDetails = viewCustomerDetails;
window.editCustomer = editCustomer;
window.viewConsumptionHistory = viewConsumptionHistory;
window.viewReport = viewReport;
window.downloadReport = downloadReport;
window.generateReport = generateReport;