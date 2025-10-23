// State management
let digimonData = [];
let collectedDigimon = new Set();
let currentFilter = 'all';

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
    } catch (error) {
        console.error('Error loading Digimon data:', error);
        digimonGrid.innerHTML = '<div class="loading">Error loading data. Please refresh the page.</div>';
    }
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
    
    card.innerHTML = `
        <div class="card-header">
            <h3 class="digimon-name">${digimon.Name}</h3>
            <span class="check-icon">✓</span>
        </div>
        <span class="attribute-badge ${attributeClass}">${digimon.Attribute}</span>
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
        
        if (currentFilter === 'all' || attribute === currentFilter) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
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
