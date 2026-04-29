// script.js - Versiune COMPLETĂ cu AJAX (Variantele 2, 3, 4)

// ========== VARIABILE GLOBALE ==========
let cart = JSON.parse(localStorage.getItem('groceryCart')) || [];

// Produse pentru grid-ul de pe pagina principală
const products = [
    { id: 1, name: "Varză proaspătă", price: 33, unit: "kg", image: "https://freshmarket.md/wp-content/uploads/2025/01/varza-alba-removebg-preview-1.png", rating: 4.0 },
    { id: 2, name: "Mix Fruit Jam", price: 136, unit: "kg", image: "https://pngimg.com/uploads/jam/jam_PNG41.png", rating: 3.9 },
    { id: 3, name: "Salată-mix", price: 30, unit: "kg", image: "https://freshmarket.md/wp-content/uploads/2023/05/Salata-mix-in-caserola.cleaned.png", rating: 4.5 },
    { id: 4, name: "Ananas", price: 88, unit: "kg", image: "https://freshmarket.md/wp-content/uploads/2023/05/Ananas.cleaned.png", rating: 4.9 },
    { id: 5, name: "Grandanilla", price: 389, unit: "kg", image: "https://freshmarket.md/wp-content/uploads/2024/04/CR6_0703-removebg-preview.png", rating: 4.7 }
];

// Map pentru numele produselor
const productsMap = {
    1: "Varză proaspătă", 2: "Mix Fruit Jam", 3: "Salată-mix",
    4: "Ananas", 5: "Grandanilla", 10: "Lapte 1L",
    11: "Pâine albă", 12: "Detergent 2L", 13: "Bec LED 9W"
};

// ========== FUNCȚII UTILITARE ==========
function showToast(message, type = "success") {
    const toastDiv = document.createElement('div');
    toastDiv.className = 'toast';
    const icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️');
    toastDiv.innerHTML = `<span>${icon}</span> ${message}`;
    document.getElementById('toastContainer').appendChild(toastDiv);
    setTimeout(() => toastDiv.remove(), 2500);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== VARIANT 2: COȘ AJAX CU SERVER ==========
async function addToCartAJAX(productId, quantity = 1) {
    try {
        const formData = new FormData();
        formData.append('action', 'add');
        formData.append('product_id', productId);
        formData.append('quantity', quantity);
        
        const response = await fetch('cart_ajax.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            const cartCountSpan = document.getElementById('cartCount');
            if (cartCountSpan) {
                cartCountSpan.innerText = result.totalItems;
            }
            
            const productName = productsMap[productId] || `Produsul #${productId}`;
            showToast(`✅ ${productName} adăugat în coș`, "success");
            
            const modal = document.getElementById('cartModal');
            if (modal && modal.style.display === 'flex') {
                await refreshCartModal();
            }
        } else {
            showToast(`❌ Eroare: ${result.message}`, "error");
        }
    } catch (error) {
        console.error('AJAX error:', error);
        showToast(`❌ Eroare de conexiune`, "error");
    }
}

async function refreshCartModal() {
    try {
        const response = await fetch('cart_ajax.php?action=get');
        const result = await response.json();
        
        if (result.success) {
            const container = document.getElementById('cartItemsList');
            const totalSpan = document.getElementById('modalTotal');
            
            if (result.cart.length === 0) {
                container.innerHTML = '<p style="color:gray;">Coșul tău este gol.</p>';
                if (totalSpan) totalSpan.innerText = '0';
                return;
            }
            
            let html = '<ul style="list-style:none; text-align:left;">';
            result.cart.forEach(item => {
                html += `<li style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #eee; padding:8px 0;">
                    <div><strong>${escapeHtml(item.name)}</strong><br>${item.price} MDL / ${item.unit}</div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button class="qty-btn-ajax" data-id="${item.id}" data-delta="-1" style="background:#e2e8f0; border:none; width:28px; border-radius:20px; cursor:pointer;">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn-ajax" data-id="${item.id}" data-delta="1" style="background:#e2e8f0; border:none; width:28px; border-radius:20px; cursor:pointer;">+</button>
                        <button class="remove-item-ajax" data-id="${item.id}" style="background:#fee2e2; border:none; border-radius:20px; padding:4px 12px; cursor:pointer;">Șterge</button>
                    </div>
                </li>`;
            });
            html += '</ul>';
            container.innerHTML = html;
            if (totalSpan) totalSpan.innerText = result.total.toFixed(2);
            
            document.querySelectorAll('.qty-btn-ajax').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const productId = parseInt(btn.dataset.id);
                    const delta = parseInt(btn.dataset.delta);
                    await updateCartQuantityAJAX(productId, delta);
                });
            });
            
            document.querySelectorAll('.remove-item-ajax').forEach(btn => {
                btn.addEventListener('click', async () => {
                    await removeFromCartAJAX(parseInt(btn.dataset.id));
                });
            });
        }
    } catch (error) {
        console.error('Refresh cart error:', error);
    }
}

async function updateCartQuantityAJAX(productId, delta) {
    try {
        const response_get = await fetch('cart_ajax.php?action=get');
        const result_get = await response_get.json();
        const currentItem = result_get.cart.find(item => item.id === productId);
        const newQuantity = Math.max(0, (currentItem?.quantity || 0) + delta);
        
        const formData = new FormData();
        formData.append('action', 'update');
        formData.append('product_id', productId);
        formData.append('quantity', newQuantity);
        
        const response = await fetch('cart_ajax.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.success) {
            document.getElementById('cartCount').innerText = result.totalItems;
            await refreshCartModal();
        }
    } catch (error) {
        console.error('Update quantity error:', error);
    }
}

async function removeFromCartAJAX(productId) {
    try {
        const formData = new FormData();
        formData.append('action', 'remove');
        formData.append('product_id', productId);
        
        const response = await fetch('cart_ajax.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.success) {
            document.getElementById('cartCount').innerText = result.totalItems;
            await refreshCartModal();
            showToast(`🗑️ Produs eliminat din coș`, "info");
            
            if (result.totalItems === 0) {
                const modal = document.getElementById('cartModal');
                if (modal) modal.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Remove from cart error:', error);
    }
}

async function fetchCartOnLoad() {
    try {
        const response = await fetch('cart_ajax.php?action=get');
        const result = await response.json();
        if (result.success && document.getElementById('cartCount')) {
            document.getElementById('cartCount').innerText = result.totalItems;
        }
    } catch (error) {
        console.error('Fetch cart on load error:', error);
    }
}

// ========== VARIANT 3: CONTACT FORM AJAX ==========
function initContactFormAjax() {
    const form = document.getElementById('contactFormAjax');
    if (!form) {
        console.log('Formularul contactFormAjax nu există pe această pagină');
        return;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Resetare erori
        document.getElementById('nameError').innerHTML = '';
        document.getElementById('emailError').innerHTML = '';
        document.getElementById('msgError').innerHTML = '';
        
        let isValid = true;
        const nume = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const mesaj = document.getElementById('contactMsg').value.trim();
        
        if (nume === '') {
            document.getElementById('nameError').innerHTML = '⚠️ Numele este obligatoriu!';
            isValid = false;
        }
        
        const emailPattern = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        if (email === '') {
            document.getElementById('emailError').innerHTML = '⚠️ Emailul este obligatoriu!';
            isValid = false;
        } else if (!emailPattern.test(email)) {
            document.getElementById('emailError').innerHTML = '⚠️ Email invalid!';
            isValid = false;
        }
        
        if (mesaj === '') {
            document.getElementById('msgError').innerHTML = '⚠️ Mesajul este obligatoriu!';
            isValid = false;
        } else if (mesaj.length < 10) {
            document.getElementById('msgError').innerHTML = '⚠️ Mesajul trebuie să aibă minim 10 caractere!';
            isValid = false;
        }
        
        if (!isValid) return;
        
        const submitBtn = document.getElementById('submitContactBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '⏳ Se trimite...';
        submitBtn.disabled = true;
        
        try {
            const formData = new FormData(form);
            const response = await fetch('process_contact_ajax.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            const responseDiv = document.getElementById('contactAjaxResponse');
            if (result.success) {
                responseDiv.innerHTML = `<div class="success-message" style="background: #16a34a; color: white; padding: 12px; border-radius: 12px;">
                    ✅ ${result.message}
                </div>`;
                form.reset();
            } else {
                responseDiv.innerHTML = `<div class="error-message" style="background: #fee2e2; color: #dc2626; padding: 12px; border-radius: 12px;">
                    ❌ ${result.message}
                </div>`;
            }
        } catch (error) {
            document.getElementById('contactAjaxResponse').innerHTML = `<div class="error-message" style="background: #fee2e2; color: #dc2626; padding: 12px; border-radius: 12px;">
                ❌ Eroare de conexiune. Vă rugăm încercați din nou.
            </div>`;
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            setTimeout(() => {
                const responseDiv = document.getElementById('contactAjaxResponse');
                if (responseDiv) responseDiv.innerHTML = '';
            }, 5000);
        }
    });
}

// ========== VARIANT 4: STOC ÎN TIMP REAL ==========
async function checkStock(productId, quantity) {
    try {
        const response = await fetch(`check_stock.php?id=${productId}&qty=${quantity}`);
        const data = await response.json();
        
        const stockInfoDiv = document.getElementById('stockInfo');
        const totalPriceSpan = document.getElementById('dynamicTotal');
        const addToCartBtn = document.getElementById('addToCartBtn');
        
        if (data.success) {
            if (totalPriceSpan) {
                totalPriceSpan.innerText = data.total_price;
            }
            
            if (data.is_available) {
                if (stockInfoDiv) {
                    stockInfoDiv.innerHTML = `
                        <div style="background: #dcfce7; color: #166534; padding: 10px; border-radius: 8px;">
                            ✅ În stoc: ${data.available_stock} bucăți disponibile<br>
                            Preț unitar: ${data.price_per_unit} MDL
                        </div>
                    `;
                }
                if (addToCartBtn) {
                    addToCartBtn.disabled = false;
                    addToCartBtn.style.opacity = '1';
                    addToCartBtn.style.cursor = 'pointer';
                }
            } else {
                if (stockInfoDiv) {
                    stockInfoDiv.innerHTML = `
                        <div style="background: #fee2e2; color: #991b1b; padding: 10px; border-radius: 8px;">
                            ⚠️ ${data.warning}<br>
                            Vă rugăm să reduceți cantitatea la maximum ${data.max_allowed} bucăți.
                        </div>
                    `;
                }
                if (addToCartBtn) {
                    addToCartBtn.disabled = true;
                    addToCartBtn.style.opacity = '0.5';
                    addToCartBtn.style.cursor = 'not-allowed';
                }
            }
        } else if (stockInfoDiv) {
            stockInfoDiv.innerHTML = `<div style="background: #fee2e2; color: #991b1b; padding: 10px; border-radius: 8px;">❌ ${data.message}</div>`;
        }
    } catch (error) {
        console.error('Stock check error:', error);
    }
}

function initProductPageWithStock() {
    const addBtn = document.getElementById('addToCartBtn');
    const qtyInput = document.getElementById('productQty');
    const productId = 10; // Lapte
    
    if (qtyInput) {
        checkStock(productId, parseInt(qtyInput.value));
        
        qtyInput.addEventListener('input', function() {
            let qty = parseInt(this.value);
            if (isNaN(qty) || qty < 1) {
                qty = 1;
                this.value = 1;
            }
            checkStock(productId, qty);
        });
        
        qtyInput.addEventListener('blur', function() {
            let qty = parseInt(this.value);
            if (isNaN(qty) || qty < 1) {
                this.value = 1;
                qty = 1;
            }
            const max = parseInt(this.max);
            if (qty > max) {
                this.value = max;
                qty = max;
            }
            checkStock(productId, qty);
        });
    }
    
    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            const qty = parseInt(document.getElementById('productQty')?.value || 1);
            
            const stockCheck = await fetch(`check_stock.php?id=${productId}&qty=${qty}`);
            const stockData = await stockCheck.json();
            
            if (stockData.is_available) {
                await addToCartAJAX(productId, qty);
                showToast(`✅ ${stockData.product_name} x${qty} adăugat în coș`, "success");
            } else {
                showToast(`❌ ${stockData.warning}`, "error");
            }
        });
    }
}

// ========== FUNCȚII EXISTENTE (adaptate) ==========
function renderProductGrid() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    let html = '';
    products.forEach(prod => {
        html += `<article class="deal-card">
            <div class="deal-img">
                <img src="${prod.image}" alt="${prod.name}">
                <button class="deal-btn add-to-cart-btn-ajax" data-id="${prod.id}">Add To Cart</button>
            </div>
            <div class="deal-meta"><span class="rate">★ ${prod.rating}</span></div>
            <div class="deal-name">${prod.name}</div>
            <div class="deal-sub">Grocery & Staples</div>
            <div class="deal-price">${prod.price} MDL/${prod.unit}</div>
        </article>`;
    });
    grid.innerHTML = html;
    document.querySelectorAll('.add-to-cart-btn-ajax').forEach(btn => {
        btn.addEventListener('click', () => addToCartAJAX(parseInt(btn.dataset.id)));
    });
}

function startCountdown() {
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
        return;
    }
    
    let targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);
    targetDate.setHours(23, 59, 59, 999);
    
    function updateTimer() {
        const diff = targetDate - new Date();
        if (diff <= 0) {
            daysEl.innerText = '00';
            hoursEl.innerText = '00';
            minutesEl.innerText = '00';
            secondsEl.innerText = '00';
            return;
        }
        const days = Math.floor(diff / (1000*60*60*24));
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        daysEl.innerText = days < 10 ? '0'+days : days;
        hoursEl.innerText = hours < 10 ? '0'+hours : hours;
        minutesEl.innerText = minutes < 10 ? '0'+minutes : minutes;
        secondsEl.innerText = seconds < 10 ? '0'+seconds : seconds;
    }
    updateTimer();
    setInterval(updateTimer, 1000);
}

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
                html += `<article class="deal-card"><div class="deal-img"><img src="${prod.image}"><button class="deal-btn search-add-ajax" data-id="${prod.id}">Add To Cart</button></div><div class="deal-meta"><span class="rate">★ ${prod.rating}</span></div><div class="deal-name">${prod.name}</div><div class="deal-price">${prod.price} MDL/${prod.unit}</div></article>`;
            });
            grid.innerHTML = html;
            document.querySelectorAll('.search-add-ajax').forEach(btn => {
                btn.addEventListener('click', () => addToCartAJAX(parseInt(btn.dataset.id)));
            });
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBtn.click();
    });
}

function initCartModal() {
    const cartIcon = document.getElementById('cartIcon');
    const modal = document.getElementById('cartModal');
    const closeBtn = document.getElementById('closeCartModal');
    if (cartIcon) cartIcon.addEventListener('click', async () => { 
        await refreshCartModal(); 
        modal.style.display = 'flex'; 
    });
    if (closeBtn) closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
}

function initBackToTop() {
    const backBtn = document.getElementById('backToTop');
    if (backBtn) backBtn.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

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
                addBtn.addEventListener('click', () => addToCartAJAX(prodId, 1));
                actionCell.appendChild(addBtn);
            }
        }
    });
}

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

// ========== INITIALIZARE ==========
document.addEventListener('DOMContentLoaded', () => {
    renderProductGrid();
    startCountdown();
    initSearch();
    initCartModal();
    initBackToTop();
    initProductPageWithStock();
    enhanceProductsTable();
    initContactFormAjax();  // Noua funcție AJAX
    animateStats();
    fetchCartOnLoad();
});