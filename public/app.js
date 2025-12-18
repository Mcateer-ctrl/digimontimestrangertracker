// State management
let digimonData = [];
let collectedDigimon = new Set();
let currentFilter = 'all';
let searchQuery = '';

// DOM Elements
const digimonGrid = document.getElementById('digimonGrid');
const progressBar = document.getElementById('progressBar');
const progressPercentage = document.getElementById('progressPercentage');
const collectedCount = document.getElementById('collectedCount');
const totalCount = document.getElementById('totalCount');
const filterButtons = document.querySelectorAll('.filter-btn');
const selectAllBtn = document.getElementById('selectAllBtn');
const deselectAllBtn = document.getElementById('deselectAllBtn');
const resetBtn = document.getElementById('resetBtn');
const searchInput = document.getElementById('searchInput');
const digimonList = document.getElementById('digimon-list');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFileInput');

// Initialize the app
async function init() {
    showLoading();
    await loadDigimonData();
    loadProgress();
    renderDigimon();
    updateProgress();
    attachEventListeners();
}

// Show loading state
function showLoading() {
    digimonGrid.innerHTML = '<div class="loading">Loading Mega Digimon</div>';
}

// Load Digimon data from API
async function loadDigimonData() {
    try {
        const response = await fetch('/api/digimon');
        digimonData = await response.json();
        
        // Clean up names (remove "Image" prefix)
        digimonData = digimonData.map(digimon => ({
            ...digimon,
            Name: digimon.Name.replace(/^(\w+)\s+Image\1$/, '$1').replace(/^Image/, '').trim()
        }));
        
        totalCount.textContent = digimonData.length;
        populateSearchSuggestions();
    } catch (error) {
        console.error('Error loading Digimon data:', error);
        digimonGrid.innerHTML = '<div class="loading">Error loading data. Please refresh the page.</div>';
    }
}

// Populate search suggestions
function populateSearchSuggestions(query = '') {
    if (!digimonList) return;

    const normalizedQuery = query.trim().toLowerCase();
    digimonList.innerHTML = '';

    // If there's no query, don't show any suggestions
    if (!normalizedQuery) return;

    // Filter names by FIRST LETTER and limit results
    const maxSuggestions = 25;
    const firstChar = normalizedQuery[0];
    const matches = digimonData
        .filter(d => d.Name && d.Name[0] && d.Name[0].toLowerCase() === firstChar)
        .slice(0, maxSuggestions);

    matches.forEach(digimon => {
        const option = document.createElement('option');
        option.value = digimon.Name;
        digimonList.appendChild(option);
    });
}

// Load progress from localStorage
function loadProgress() {
    const saved = localStorage.getItem('digimonProgress');
    if (saved) {
        collectedDigimon = new Set(JSON.parse(saved));
    }
}

// Save progress to localStorage
function saveProgress() {
    localStorage.setItem('digimonProgress', JSON.stringify([...collectedDigimon]));
}

// Render Digimon cards
function renderDigimon() {
    digimonGrid.innerHTML = '';
    
    digimonData.forEach((digimon, index) => {
        const card = createDigimonCard(digimon, index);
        digimonGrid.appendChild(card);
    });
    
    applyFilter();
}

// Create a Digimon card element
function createDigimonCard(digimon, index) {
    const card = document.createElement('div');
    card.className = 'digimon-card';
    card.dataset.index = index;
    card.dataset.attribute = digimon.Attribute;
    
    if (collectedDigimon.has(digimon.Name)) {
        card.classList.add('collected');
    }
    
    const attributeClass = digimon.Attribute.toLowerCase();
    
    // Check if image exists
    const imagePath = `/images/${digimon.Name.replace(/\s+/g, '_')}.png`;
    const imageHTML = `<img src="${imagePath}" alt="${digimon.Name}" class="digimon-image" onerror="this.style.display='none'">`;
    
    card.innerHTML = `
        ${imageHTML}
        <div class="card-header">
            <h3 class="digimon-name">${digimon.Name}</h3>
            <span class="check-icon">✓</span>
        </div>
        <span class="attribute-badge ${attributeClass}">${digimon.Attribute}</span>
        ${digimon.Link ? `<a href="${digimon.Link}" target="_blank" rel="noopener noreferrer" class="digimon-link" onclick="event.stopPropagation()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            View Details
        </a>` : ''}
    `;
    
    card.addEventListener('click', () => toggleDigimon(digimon.Name, card));
    
    return card;
}

// Toggle Digimon collected status
function toggleDigimon(name, card) {
    if (collectedDigimon.has(name)) {
        collectedDigimon.delete(name);
        card.classList.remove('collected');
    } else {
        collectedDigimon.add(name);
        card.classList.add('collected');
        
        // Add a little celebration animation
        card.style.animation = 'none';
        setTimeout(() => {
            card.style.animation = '';
        }, 10);
    }
    
    saveProgress();
    updateProgress();
}

// Update progress bar and counter
function updateProgress() {
    const collected = collectedDigimon.size;
    const total = digimonData.length;
    const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;
    
    collectedCount.textContent = collected;
    progressBar.style.width = `${percentage}%`;
    progressPercentage.textContent = `${percentage}%`;
}

// Apply current filter
function applyFilter() {
    const cards = document.querySelectorAll('.digimon-card');
    cards.forEach(card => {
        const attribute = card.dataset.attribute;
        const index = parseInt(card.dataset.index);
        const name = digimonData[index] ? digimonData[index].Name : '';

        const matchesFilter = currentFilter === 'all' || attribute === currentFilter;
        const matchesSearch = !searchQuery || name.toLowerCase().includes(searchQuery);

        if (matchesFilter && matchesSearch) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// Export progress as JSON file
function exportProgress() {
    const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        collected: [...collectedDigimon]
    };

    try {
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'digimon-progress.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Export failed', err);
        alert('Failed to export progress. See console for details.');
    }
}

function importProgressFromObject(obj) {
    let incoming = [];
    if (Array.isArray(obj)) incoming = obj;
    else if (obj && Array.isArray(obj.collected)) incoming = obj.collected;
    else {
        alert('Invalid progress file format.');
        return;
    }

    incoming = incoming.filter(item => typeof item === 'string');

    if (incoming.length === 0) {
        alert('No valid Digimon names found in the file.');
        return;
    }

    // If we have the dataset loaded, warn about unknown names so user can spot typos
    if (digimonData.length > 0) {
        const known = new Set(digimonData.map(d => d.Name));
        const unknown = incoming.filter(n => !known.has(n));
        if (unknown.length > 0) {
            // don't block import, just inform
            alert(`${unknown.length} imported name(s) were not found in the current dataset and will be ignored for UI marking.`);
        }
    }
    const replace = confirm('Replace existing progress with imported progress? OK = Replace, Cancel = Merge');

    if (replace) {
        collectedDigimon = new Set(incoming);
    } else {
        incoming.forEach(n => collectedDigimon.add(n));
    }

    saveProgress();
    // Re-render so cards reflect the newly imported progress
    renderDigimon();
    updateProgress();
    alert('Progress imported successfully.');
}

function handleImportFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = JSON.parse(reader.result);
            importProgressFromObject(parsed);
        } catch (err) {
            console.error('Failed to parse imported file', err);
            alert('Failed to parse JSON file: ' + err.message);
        }
    };
    reader.onerror = () => alert('Failed to read file.');
    reader.readAsText(file);
}

// Attach event listeners
function attachEventListeners() {
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            applyFilter();
        });
    });
    
    // Select all button
    selectAllBtn.addEventListener('click', () => {
        const visibleCards = document.querySelectorAll('.digimon-card:not(.hidden)');
        
        visibleCards.forEach(card => {
            const index = parseInt(card.dataset.index);
            const digimon = digimonData[index];
            
            if (!collectedDigimon.has(digimon.Name)) {
                collectedDigimon.add(digimon.Name);
                card.classList.add('collected');
            }
        });
        
        saveProgress();
        updateProgress();
    });
    
    // Deselect all button
    deselectAllBtn.addEventListener('click', () => {
        const visibleCards = document.querySelectorAll('.digimon-card:not(.hidden)');
        
        visibleCards.forEach(card => {
            const index = parseInt(card.dataset.index);
            const digimon = digimonData[index];
            
            if (collectedDigimon.has(digimon.Name)) {
                collectedDigimon.delete(digimon.Name);
                card.classList.remove('collected');
            }
        });
        
        saveProgress();
        updateProgress();
    });
    
    // Reset button
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            collectedDigimon.clear();
            saveProgress();
            
            document.querySelectorAll('.digimon-card').forEach(card => {
                card.classList.remove('collected');
            });
            
            updateProgress();
        }
    });

    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const value = e.target.value || '';
            searchQuery = value.toLowerCase();
            populateSearchSuggestions(value);
            applyFilter();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (searchInput) searchInput.value = '';
            searchQuery = '';
            applyFilter();
            searchInput && searchInput.focus();
        });
    }

    // Export / Import handlers
    if (exportBtn) {
        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            exportProgress();
        });
    }

    if (importBtn && importFileInput) {
        importBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            importFileInput.value = '';
            importFileInput.click();
        });

        importFileInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) handleImportFile(file);
        });
    }
}

// Add celebration animation
const style = document.createElement('style');
style.textContent = `
    @keyframes celebrate {
        0%, 100% {
            transform: scale(1) translateY(-5px);
        }
        50% {
            transform: scale(1.05) translateY(-8px);
        }
    }
    
    .digimon-card.collected {
        animation: celebrate 0.4s ease-out;
    }
`;
document.head.appendChild(style);

// Start the app
init();
