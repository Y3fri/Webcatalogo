document.addEventListener('DOMContentLoaded', function () {
    const productsContainer = document.getElementById('products-container');
    const searchInput = document.getElementById('search');
    const filterSelect = document.getElementById('filter');
    const categoryFilter = document.getElementById('category-filter');
    const imageModal = document.getElementById('imageModal');
    const closeModal = document.querySelector('.close-modal');

    // Configurar el modal de imagen
    closeModal.addEventListener('click', () => {
        imageModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === imageModal) {
            imageModal.style.display = 'none';
        }
    });

    // Función para cargar y procesar el archivo TXT
    async function loadProducts() {
        try {
            const response = await fetch('productos.txt');
            const data = await response.text();
            const products = parseTxtData(data);
            displayProducts(products);
            setupSearchFilter(products);
        } catch (error) {
            console.error('Error al cargar los productos:', error);
            productsContainer.innerHTML = '<p class="error">Error al cargar los productos. Por favor, inténtalo de nuevo más tarde.</p>';
        }
    }

    function parseTxtData(txtData) {
        return txtData.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
                const parts = line.split('|');
                const [id, imagen, nombre, descripcion, precioOriginal, precioDescuento, garantia, estado, categoria] = parts.map(part => part.trim());

                return {
                    id,
                    imagen,
                    nombre,
                    descripcion: descripcion.replace(/\\n/g, '<br>'),
                    precioOriginal,
                    precioDescuento,
                    garantia,
                    estado: estado === '1',
                    categoria: categoria.toLowerCase()
                };
            })
            .filter(product => product.estado);
    }

    // Función para mostrar los productos
    function displayProducts(products) {
        productsContainer.innerHTML = products.map(product => `
            <div class="product-card" data-status="${product.estado ? '1' : '0'}" data-category="${product.categoria}">
                <div class="product-image">
                    <img src="${product.imagen}" 
                    alt="${product.nombre}"
                    onerror="this.src='https://static.vecteezy.com/system/resources/previews/004/726/030/non_2x/warning-upload-error-icon-with-cloud-vector.jpg'">
                    ${product.estado ? '<span class="product-badge">Disponible</span>' : '<span class="product-badge" style="background-color: var(--gray)">Agotado</span>'}
                    <button class="btn-view" onclick="showImageModal('${product.imagen}')">
                            <i class="fas fa-eye"></i>
                        </button>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.nombre}</h3>
                    <p class="product-description">${product.descripcion}</p>
                    <div class="product-warranty">
                        <i class="fas fa-shield-alt"></i>
                        <span>Garantía: ${product.garantia}</span>
                    </div>
                    <div class="product-price">
                        <div>                             
                            ${product.precioOriginal ? `<span class="original-price">$${product.precioOriginal}</span>` : ''}
                            <span class="discount-price">$${product.precioDescuento}</span>
                        </div>
                        <span class="product-status ${product.estado ? 'status-available' : 'status-unavailable'}">
                            ${product.estado ? 'Disponible' : 'Agotado'}
                        </span>
                    </div>
                    <div class="product-category">
                        <span class="category-tag">${product.categoria.toUpperCase()}</span>
                    </div>
                    <div class="product-actions">
                        
                        <button class="btn-order" onclick="orderProduct('${product.nombre}', '${product.precioDescuento}', '${product.categoria}')" ${!product.estado ? 'disabled' : ''}>
                            <i class="fab fa-whatsapp"></i> Pedir
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Función para configurar búsqueda y filtrado
    function setupSearchFilter(products) {
        function filterProducts() {
            const searchTerm = searchInput.value.toLowerCase();
            const activeChip = document.querySelector('.category-chip.active');
            const categoryValue = activeChip ? activeChip.getAttribute('data-category') : 'all';

            const filtered = products.filter(product => {
                const matchesSearch = product.nombre.toLowerCase().includes(searchTerm) ||
                    product.descripcion.toLowerCase().includes(searchTerm) ||
                    product.categoria.toLowerCase().includes(searchTerm);

                const matchesCategory = categoryValue === 'all' ||
                    product.categoria === categoryValue;

                return matchesSearch && matchesCategory;
            });

            displayProducts(filtered);
        }

        searchInput.addEventListener('input', filterProducts);
        document.addEventListener('categoryChanged', filterProducts);
    }

    // Iniciar la carga de productos
    loadProducts();
});

// Función para mostrar el modal con la imagen ampliada
function showImageModal(imageUrl) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');

    modal.style.display = 'block';
    modalImg.src = imageUrl;
}

// Función para enviar mensaje por WhatsApp
function orderProduct(productName, price, category) {
    const phoneNumber = '+573223890477';
    const message = `¡Hola! Estoy interesado/a en el producto:
    
 *${productName}*
 Precio: $${price}
 Categoría: ${category.toUpperCase()}

¡Gracias! `;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
}

document.addEventListener('DOMContentLoaded', function() {
    const chips = document.querySelectorAll('.category-chip');
    
    chips.forEach(chip => {
        chip.addEventListener('click', function() {
            // Remover clase active de todos los chips
            chips.forEach(c => c.classList.remove('active'));
            
            // Agregar clase active al chip clickeado
            this.classList.add('active');
            
            // Obtener la categoría seleccionada
            const selectedCategory = this.getAttribute('data-category');
            
            // Disparar evento de cambio de categoría
            const event = new CustomEvent('categoryChanged', {
                detail: { category: selectedCategory }
            });
            document.dispatchEvent(event);
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const chipsContainer = document.querySelector('.category-chips');
    const scrollLeftBtn = document.querySelector('.scroll-button.left');
    const scrollRightBtn = document.querySelector('.scroll-button.right');
    
    // Manejar el scroll con botones
    scrollLeftBtn.addEventListener('click', () => {
        chipsContainer.scrollBy({ left: -200, behavior: 'smooth' });
    });
    
    scrollRightBtn.addEventListener('click', () => {
        chipsContainer.scrollBy({ left: 200, behavior: 'smooth' });
    });
    
    // Manejar el scroll con rueda del ratón
    chipsContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        chipsContainer.scrollBy({ left: e.deltaY < 0 ? -100 : 100, behavior: 'smooth' });
    });
    
    // Actualizar visibilidad de botones según scroll
    chipsContainer.addEventListener('scroll', updateScrollButtons);
    
    function updateScrollButtons() {
        const maxScrollLeft = chipsContainer.scrollWidth - chipsContainer.clientWidth;
        
        scrollLeftBtn.disabled = chipsContainer.scrollLeft <= 0;
        scrollRightBtn.disabled = chipsContainer.scrollLeft >= maxScrollLeft - 1;
    }
    
    // Inicializar estado de botones
    updateScrollButtons();
    
    // Manejar clic en chips
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            document.querySelector('.category-chip.active').classList.remove('active');
            this.classList.add('active');
        });
    });
});

// Botón para subir al inicio
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});