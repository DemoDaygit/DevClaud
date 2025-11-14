/**
 * Swarm AI Knowledge Graph v4.0 - Main Application
 * Enterprise-level graph visualization with Cytoscape.js
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Category colors
const CATEGORY_COLORS = {
    foundation: '#4a5568',
    basic_algo: '#38b2ac',
    federated: '#667eea',
    compression: '#f6ad55',
    marl: '#fc8181',
    moe: '#9f7aea',
    merging: '#48bb78',
    quantum: '#4299e1',
    blockchain: '#ed8936'
};

// Edge type colors
const EDGE_COLORS = {
    evolves_to: '#667eea',
    requires: '#ff6b6b',
    resolves: '#4ecdc4',
    implements: '#95e1d3',
    combines: '#f38181',
    contradiction: '#ff6464'
};

// Global state
let cy = null;
let graphData = { nodes: [], edges: [] };

/**
 * Initialize Cytoscape graph
 */
function initCytoscape() {
    cytoscape.use(cytoscapeFcose);
    cytoscape.use(cytoscapeCola);

    cy = cytoscape({
        container: document.getElementById('cy'),

        style: [
            {
                selector: 'node',
                style: {
                    'label': 'data(label)',
                    'background-color': (ele) => CATEGORY_COLORS[ele.data('group')] || '#667eea',
                    'color': '#fff',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': '12px',
                    'font-weight': '600',
                    'width': '60px',
                    'height': '60px',
                    'border-width': 2,
                    'border-color': '#fff',
                    'text-wrap': 'wrap',
                    'text-max-width': '80px'
                }
            },
            {
                selector: 'node:selected',
                style: {
                    'border-width': 4,
                    'border-color': '#ffd700',
                    'background-color': (ele) => lightenColor(CATEGORY_COLORS[ele.data('group')] || '#667eea')
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': (ele) => EDGE_COLORS[ele.data('type')] || '#667eea',
                    'target-arrow-color': (ele) => EDGE_COLORS[ele.data('type')] || '#667eea',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'label': 'data(label)',
                    'font-size': '10px',
                    'color': '#a0aec0',
                    'text-background-color': '#1a1d3a',
                    'text-background-opacity': 0.8,
                    'text-background-padding': '2px'
                }
            },
            {
                selector: 'edge[type="contradiction"]',
                style: {
                    'line-style': 'dashed',
                    'width': 3
                }
            },
            {
                selector: '.highlighted',
                style: {
                    'background-color': '#ffd700',
                    'line-color': '#ffd700',
                    'target-arrow-color': '#ffd700',
                    'transition-property': 'background-color, line-color',
                    'transition-duration': '0.3s'
                }
            }
        ],

        layout: {
            name: 'fcose',
            quality: 'default',
            randomize: false,
            animate: true,
            animationDuration: 1000,
            nodeRepulsion: 4500,
            idealEdgeLength: 100,
            edgeElasticity: 0.45,
            nestingFactor: 0.1,
            gravity: 0.25,
            numIter: 2500,
            tile: true
        }
    });

    setupEventHandlers();
}

/**
 * Load graph data from API
 */
async function loadGraphData() {
    showLoading(true);
    try {
        const response = await fetch(`${API_URL}/api/graph`);
        const data = await response.json();

        graphData = data;
        renderGraph(data);

        // Update stats
        updateStats(data);

    } catch (error) {
        console.error('Failed to load graph data:', error);
        alert('Failed to load graph data. Make sure the backend is running.');
    } finally {
        showLoading(false);
    }
}

/**
 * Render graph in Cytoscape
 */
function renderGraph(data) {
    cy.elements().remove();

    const elements = [
        ...data.nodes.map(node => ({
            data: {
                id: node.id.toString(),
                label: node.label,
                ...node
            }
        })),
        ...data.edges.map(edge => ({
            data: {
                id: `e${edge.from}-${edge.to}`,
                source: edge.from.toString(),
                target: edge.to.toString(),
                ...edge
            }
        }))
    ];

    cy.add(elements);
    cy.layout({ name: 'fcose', animate: true }).run();
}

/**
 * Setup event handlers
 */
function setupEventHandlers() {
    // Node click
    cy.on('tap', 'node', (evt) => {
        const node = evt.target;
        showNodeInfo(node.data());
    });

    // Edge click
    cy.on('tap', 'edge', (evt) => {
        const edge = evt.target;
        console.log('Edge clicked:', edge.data());
    });

    // Background click
    cy.on('tap', (evt) => {
        if (evt.target === cy) {
            hideNodeInfo();
        }
    });

    // UI Events
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('yearSlider').addEventListener('input', handleYearFilter);
    document.getElementById('layoutSelect').addEventListener('change', (e) => {
        applyLayout(e.target.value);
    });

    document.getElementById('applyLayout').addEventListener('click', () => {
        const layout = document.getElementById('layoutSelect').value;
        applyLayout(layout);
    });

    document.getElementById('fitBtn').addEventListener('click', () => cy.fit());
    document.getElementById('resetBtn').addEventListener('click', resetView);
    document.getElementById('seedBtn').addEventListener('click', seedDatabase);

    document.getElementById('toggleSidebar').addEventListener('click', () => {
        document.getElementById('leftSidebar').classList.toggle('hidden');
    });

    document.getElementById('toggleAnalytics').addEventListener('click', () => {
        document.getElementById('rightSidebar').classList.toggle('hidden');
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
        document.getElementById('exportModal').classList.add('active');
    });

    document.getElementById('closeExportModal').addEventListener('click', () => {
        document.getElementById('exportModal').classList.remove('active');
    });

    document.getElementById('closeNodeInfo').addEventListener('click', hideNodeInfo);

    // Analytics
    document.getElementById('calcPageRank').addEventListener('click', calculatePageRank);
    document.getElementById('calcCentrality').addEventListener('click', calculateCentrality);
    document.getElementById('detectCommunities').addEventListener('click', detectCommunities);
    document.getElementById('findPath').addEventListener('click', findShortestPath);
    document.getElementById('loadStats').addEventListener('click', loadStatistics);

    // Export buttons
    document.querySelectorAll('[data-export]').forEach(btn => {
        btn.addEventListener('click', () => exportGraph(btn.dataset.export));
    });

    // Analytics tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
}

/**
 * Show node information
 */
function showNodeInfo(nodeData) {
    const panel = document.getElementById('nodeInfo');
    const title = document.getElementById('nodeTitle');
    const body = document.getElementById('nodeInfoBody');

    title.textContent = nodeData.title || nodeData.label;

    body.innerHTML = `
        <p><strong>Description:</strong> ${nodeData.description || 'N/A'}</p>
        <p><strong>Category:</strong> ${nodeData.group}</p>
        <p><strong>Year:</strong> ${nodeData.year}</p>
        ${nodeData.formula ? `<div class="formula"><strong>Formula:</strong><br>${nodeData.formula}</div>` : ''}
        ${nodeData.triz ? `<p><strong>ТРИЗ:</strong> ${nodeData.triz}</p>` : ''}
    `;

    panel.classList.add('active');
}

/**
 * Hide node information
 */
function hideNodeInfo() {
    document.getElementById('nodeInfo').classList.remove('active');
}

/**
 * Handle search
 */
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    if (!query) {
        cy.elements().removeClass('highlighted');
        return;
    }

    cy.nodes().forEach(node => {
        const data = node.data();
        const matches = data.label.toLowerCase().includes(query) ||
                       (data.description && data.description.toLowerCase().includes(query));

        if (matches) {
            node.addClass('highlighted');
        } else {
            node.removeClass('highlighted');
        }
    });
}

/**
 * Handle year filter
 */
function handleYearFilter(e) {
    const year = parseInt(e.target.value);
    document.getElementById('yearValue').textContent = year;

    cy.nodes().forEach(node => {
        if (node.data('year') <= year) {
            node.style('display', 'element');
        } else {
            node.style('display', 'none');
        }
    });
}

/**
 * Apply layout
 */
function applyLayout(layoutName) {
    const layouts = {
        fcose: {
            name: 'fcose',
            quality: 'default',
            animate: true,
            randomize: false,
            nodeRepulsion: 4500
        },
        cola: {
            name: 'cola',
            animate: true,
            randomize: false,
            nodeSpacing: 100
        },
        circle: { name: 'circle', animate: true },
        grid: { name: 'grid', animate: true },
        concentric: { name: 'concentric', animate: true }
    };

    cy.layout(layouts[layoutName] || layouts.fcose).run();
}

/**
 * Reset view
 */
function resetView() {
    cy.elements().removeClass('highlighted');
    cy.fit();
    document.getElementById('searchInput').value = '';
    document.getElementById('yearSlider').value = '2025';
    document.getElementById('yearValue').textContent = '2025';
    hideNodeInfo();
}

/**
 * Seed database
 */
async function seedDatabase() {
    if (!confirm('This will reset the database. Continue?')) return;

    showLoading(true);
    try {
        await fetch(`${API_URL}/api/graph/seed`, { method: 'POST' });
        alert('Database seeded successfully!');
        await loadGraphData();
    } catch (error) {
        console.error('Failed to seed database:', error);
        alert('Failed to seed database');
    } finally {
        showLoading(false);
    }
}

/**
 * Calculate PageRank
 */
async function calculatePageRank() {
    showLoading(true);
    try {
        const response = await fetch(`${API_URL}/api/analytics/pagerank?limit=10`);
        const data = await response.json();

        const resultsDiv = document.getElementById('pagerankResults');
        resultsDiv.innerHTML = data.results.map(item => `
            <div class="result-item">
                <strong>${item.label}</strong>: ${item.pagerank.toFixed(4)}
            </div>
        `).join('');

    } catch (error) {
        console.error('Failed to calculate PageRank:', error);
    } finally {
        showLoading(false);
    }
}

/**
 * Calculate centrality
 */
async function calculateCentrality() {
    const type = document.getElementById('centralityType').value;
    showLoading(true);
    try {
        const response = await fetch(`${API_URL}/api/analytics/centrality?type=${type}&limit=10`);
        const data = await response.json();

        const resultsDiv = document.getElementById('centralityResults');
        resultsDiv.innerHTML = data.results.map(item => `
            <div class="result-item">
                <strong>${item.label}</strong>: ${item.centrality.toFixed(4)}
            </div>
        `).join('');

    } catch (error) {
        console.error('Failed to calculate centrality:', error);
    } finally {
        showLoading(false);
    }
}

/**
 * Detect communities
 */
async function detectCommunities() {
    showLoading(true);
    try {
        const response = await fetch(`${API_URL}/api/analytics/communities`);
        const data = await response.json();

        const resultsDiv = document.getElementById('communitiesResults');
        resultsDiv.innerHTML = `
            <p><strong>Total Communities:</strong> ${data.totalCommunities}</p>
            ${data.communities.slice(0, 5).map(comm => `
                <div class="result-item">
                    <strong>Community ${comm.communityId}</strong>: ${comm.size} nodes
                </div>
            `).join('')}
        `;

    } catch (error) {
        console.error('Failed to detect communities:', error);
    } finally {
        showLoading(false);
    }
}

/**
 * Find shortest path
 */
async function findShortestPath() {
    const from = document.getElementById('pathFrom').value;
    const to = document.getElementById('pathTo').value;

    if (!from || !to) {
        alert('Please enter both node IDs');
        return;
    }

    showLoading(true);
    try {
        const response = await fetch(`${API_URL}/api/analytics/shortest-path?from=${from}&to=${to}`);
        const data = await response.json();

        const resultsDiv = document.getElementById('pathResults');
        if (data.found) {
            resultsDiv.innerHTML = `
                <p><strong>Distance:</strong> ${data.distance}</p>
                <p><strong>Path:</strong> ${data.path.join(' → ')}</p>
            `;
        } else {
            resultsDiv.innerHTML = '<p>No path found</p>';
        }

    } catch (error) {
        console.error('Failed to find path:', error);
    } finally {
        showLoading(false);
    }
}

/**
 * Load statistics
 */
async function loadStatistics() {
    showLoading(true);
    try {
        const response = await fetch(`${API_URL}/api/analytics/statistics`);
        const data = await response.json();

        const resultsDiv = document.getElementById('statsResults');
        resultsDiv.innerHTML = `
            <div class="stat-card">
                <div class="stat-card-value">${data.nodes}</div>
                <div class="stat-card-label">Nodes</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-value">${data.edges}</div>
                <div class="stat-card-label">Edges</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-value">${data.density.toFixed(3)}</div>
                <div class="stat-card-label">Density</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-value">${data.avgDegree.toFixed(1)}</div>
                <div class="stat-card-label">Avg Degree</div>
            </div>
        `;

    } catch (error) {
        console.error('Failed to load statistics:', error);
    } finally {
        showLoading(false);
    }
}

/**
 * Export graph
 */
async function exportGraph(format) {
    showLoading(true);
    try {
        let url = `${API_URL}/api/export/${format}`;
        if (format.startsWith('csv-')) {
            const type = format.split('-')[1];
            url = `${API_URL}/api/export/csv?type=${type}`;
        }

        const response = await fetch(url);
        const blob = await response.blob();

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `knowledge-graph.${format}`;
        link.click();

        document.getElementById('exportModal').classList.remove('active');

    } catch (error) {
        console.error('Failed to export:', error);
        alert('Export failed');
    } finally {
        showLoading(false);
    }
}

/**
 * Update statistics
 */
function updateStats(data) {
    document.getElementById('nodeCount').textContent = data.nodes.length;
    document.getElementById('edgeCount').textContent = data.edges.length;

    const nodeCount = data.nodes.length;
    const edgeCount = data.edges.length;
    const density = nodeCount > 1 ? (2 * edgeCount) / (nodeCount * (nodeCount - 1)) : 0;
    document.getElementById('density').textContent = density.toFixed(3);
}

/**
 * Show/hide loading
 */
function showLoading(show) {
    document.getElementById('loadingOverlay').classList.toggle('active', show);
}

/**
 * Helper: Lighten color
 */
function lightenColor(color) {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, (num >> 16) + 50);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + 50);
    const b = Math.min(255, (num & 0x0000FF) + 50);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Initialize application
 */
document.addEventListener('DOMContentLoaded', () => {
    initCytoscape();
    loadGraphData();
});
