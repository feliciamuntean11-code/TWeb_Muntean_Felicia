// script.js
// Cart state
let cart = JSON.parse(localStorage.getItem('groceryCart')) || [];

// Products for homepage grid
const products = [
    { id: 1, name: "Varză proaspătă", price: 33, unit: "kg", image: "https://freshmarket.md/wp-content/uploads/2025/01/varza-alba-removebg-preview-1.png", rating: 4.0 },
    { id: 2, name: "Mix Fruit Jam", price: 136, unit: "kg", image: "https://pngimg.com/uploads/jam/jam_PNG41.png", rating: 3.9 },
    { id: 3, name: "Salată-mix", price: 30, unit: "kg", image: "https://freshmarket.md/wp-content/uploads/2023/05/Salata-mix-in-caserola.cleaned.png", rating: 4.5 },
    { id: 4, name: "Ananas", price: 88, unit: "kg", image: "https://freshmarket.md/wp-content/uploads/2023/05/Ananas.cleaned.png", rating: 4.9 },
    { id: 5, name: "Grandanilla", price: 389, unit: "kg", image: "https://freshmarket.md/wp-content/uploads/2024/04/CR6_0703-removebg-preview.png", rating: 4.7 }
];

// Helper functions
function saveCart() {
    localStorage.setItem('groceryCart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const cartCountSpan = document.getElementById('cartCount');
    if (cartCountSpan) {
        let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.innerText = totalItems;
    }
    const modal = document.getElementById('cartModal');
    if (modal && modal.style.display === 'flex') renderCartModal();
}

function showToast(message, type = "success") {
    const toastDiv = document.createElement('div');
    toastDiv.className = 'toast';
    toastDiv.innerHTML = `<span>${type === 'success' ? '✅' : 'ℹ️'}</span> ${message}`;
    document.getElementById('toastContainer').appendChild(toastDiv);
    setTimeout(() => toastDiv.remove(), 2500);
}

function addToCart(productId, quantity = 1) {
    let product = products.find(p => p.id === productId);
    if (!product) {
        // For products from other pages (lapte etc)
        const specialProducts = {
            10: { id: 10, name: "Lapte 1L", price: 15, unit: "buc" },
            11: { id: 11, name: "Pâine albă", price: 8, unit: "buc" },
            12: { id: 12, name: "Detergent 2L", price: 75, unit: "buc" },
            13: { id: 13, name: "Bec LED 9W", price: 45, unit: "buc" }
        };
        product = specialProducts[productId];
    }
    if (!product) return;
    
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ ...product, quantity: quantity });
    }
    saveCart();
    showToast(`✅ ${product.name} adăugat în coș`, "success");
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCartModal();
}

function updateQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) removeFromCart(productId);
        else saveCart();
        renderCartModal();
    }
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function renderCartModal() {
    const container = document.getElementById('cartItemsList');
    const totalSpan = document.getElementById('modalTotal');
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="color:gray;">Coșul tău este gol.</p>';
        if (totalSpan) totalSpan.innerText = '0';
        return;
    }
    
    let html = '<ul style="list-style:none; text-align:left;">';
    cart.forEach(item => {
        html += `<li style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #eee; padding:8px 0;">
            <div><strong>${item.name}</strong><br>${item.price} MDL / ${item.unit}</div>
            <div style="display:flex; align-items:center; gap:8px;">
                <button class="qty-btn" data-id="${item.id}" data-delta="-1" style="background:#e2e8f0; border:none; width:28px; border-radius:20px; cursor:pointer;">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" data-id="${item.id}" data-delta="1" style="background:#e2e8f0; border:none; width:28px; border-radius:20px; cursor:pointer;">+</button>
                <button class="remove-item" data-id="${item.id}" style="background:#fee2e2; border:none; border-radius:20px; padding:4px 12px; cursor:pointer;">Șterge</button>
            </div>
        </li>`;
    });
    html += '</ul>';
    container.innerHTML = html;
    if (totalSpan) totalSpan.innerText = getCartTotal().toFixed(2);
    
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateQuantity(parseInt(btn.dataset.id), parseInt(btn.dataset.delta));
        });
    });
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id)));
    });
}

// Render homepage product grid
function renderProductGrid() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    let html = '';
    products.forEach(prod => {
        html += `<article class="deal-card">
            <div class="deal-img">
                <img src="${prod.image}" alt="${prod.name}">
                <button class="deal-btn add-to-cart-btn" data-id="${prod.id}">Add To Cart</button>
            </div>
            <div class="deal-meta"><span class="rate">★ ${prod.rating}</span></div>
            <div class="deal-name">${prod.name}</div>
            <div class="deal-sub">Grocery & Staples</div>
            <div class="deal-price">${prod.price} MDL/${prod.unit}</div>
        </article>`;
    });
    grid.innerHTML = html;
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => addToCart(parseInt(btn.dataset.id)));
    });
}

// Countdown timer
function startCountdown() {
    let targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);
    targetDate.setHours(23, 59, 59, 999);
    
    function updateTimer() {
        const diff = targetDate - new Date();
        if (diff <= 0) {
            document.getElementById('days').innerText = '00';
            document.getElementById('hours').innerText = '00';
            document.getElementById('minutes').innerText = '00';
            document.getElementById('seconds').innerText = '00';
            return;
        }
        const days = Math.floor(diff / (1000*60*60*24));
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        document.getElementById('days').innerText = days < 10 ? '0'+days : days;
        document.getElementById('hours').innerText = hours < 10 ? '0'+hours : hours;
        document.getElementById('minutes').innerText = minutes < 10 ? '0'+minutes : minutes;
        document.getElementById('seconds').innerText = seconds < 10 ? '0'+seconds : seconds;
    }
    updateTimer();
    setInterval(updateTimer, 1000);
}

// Search functionality
function initSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    if (!searchBtn) return;
    
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.toLowerCase().trim();
        if (query === "") {
            renderProductGrid();
            return;
        }
        const filtered = products.filter(p => p.name.toLowerCase().includes(query));
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        if (filtered.length === 0) {
            grid.innerHTML = `<p style="grid-column:1/-1; text-align:center;">Nu s-au găsit produse pentru "${query}"</p>`;
        } else {
            let html = '';
            filtered.forEach(prod => {
                html += `<article class="deal-card"><div class="deal-img"><img src="${prod.image}"><button class="deal-btn search-add" data-id="${prod.id}">Add To Cart</button></div><div class="deal-meta"><span class="rate">★ ${prod.rating}</span></div><div class="deal-name">${prod.name}</div><div class="deal-price">${prod.price} MDL/${prod.unit}</div></article>`;
            });
            grid.innerHTML = html;
            document.querySelectorAll('.search-add').forEach(btn => {
                btn.addEventListener('click', () => addToCart(parseInt(btn.dataset.id)));
            });
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBtn.click();
    });
}

// Cart modal initialization
function initCartModal() {
    const cartIcon = document.getElementById('cartIcon');
    const modal = document.getElementById('cartModal');
    const closeBtn = document.getElementById('closeCartModal');
    if (cartIcon) cartIcon.addEventListener('click', () => { renderCartModal(); modal.style.display = 'flex'; });
    if (closeBtn) closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
}

// Back to top
function initBackToTop() {
    const backBtn = document.getElementById('backToTop');
    if (backBtn) backBtn.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

// Product page specific (lapte)
function initProductPage() {
    const addBtn = document.getElementById('addToCartBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const qty = parseInt(document.getElementById('productQty')?.value || 1);
            addToCart(10, qty); // Lapte id = 10
        });
    }
}

// Enhance products table with add to cart
function enhanceProductsTable() {
    const table = document.querySelector('.product-table');
    if (!table) return;
    const productMap = { "Lapte 1L": 10, "Pâine albă": 11, "Detergent 2L": 12, "Bec LED 9W": 13 };
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const nameCell = row.querySelector('.p-name b');
        if (nameCell) {
            const prodName = nameCell.innerText.trim();
            const prodId = productMap[prodName];
            if (prodId) {
                const actionCell = row.querySelector('td:last-child');
                const addBtn = document.createElement('button');
                addBtn.innerText = '🛒 Adaugă';
                addBtn.style.background = '#c2410c';
                addBtn.style.border = 'none';
                addBtn.style.padding = '8px 16px';
                addBtn.style.borderRadius = '30px';
                addBtn.style.color = 'white';
                addBtn.style.fontWeight = 'bold';
                addBtn.style.cursor = 'pointer';
                addBtn.addEventListener('click', () => addToCart(prodId, 1));
                actionCell.appendChild(addBtn);
            }
        }
    });
}

// Contact form
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast("✅ Mesajul a fost trimis! Vom reveni curând.", "success");
            form.reset();
        });
    }
}

// Animate stats on about page
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-num');
    statNumbers.forEach(el => {
        const finalText = el.innerText;
        const finalNum = parseInt(finalText);
        if (!isNaN(finalNum)) {
            let current = 0;
            let increment = finalNum / 30;
            let timer = setInterval(() => {
                current += increment;
                if (current >= finalNum) {
                    el.innerText = finalText;
                    clearInterval(timer);
                } else {
                    el.innerText = Math.floor(current) + (finalText.includes('+') ? '+' : '');
                }
            }, 20);
        }
    });
}

// Initialize all on DOM load
document.addEventListener('DOMContentLoaded', () => {
    renderProductGrid();
    startCountdown();
    initSearch();
    initCartModal();
    initBackToTop();
    initProductPage();
    enhanceProductsTable();
    initContactForm();
    animateStats();
    updateCartUI();
});