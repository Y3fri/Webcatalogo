document.addEventListener('DOMContentLoaded', function () {
    const productsContainer = document.getElementById('products-container');
    const searchInput = document.getElementById('search');
    const filterSelect = document.getElementById('filter');
    const categoryFilter = document.getElementById('category-filter');

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
            });
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
                </div>
            </div>
        `).join('');
    }

    // Función para configurar búsqueda y filtrado
    function setupSearchFilter(products) {
        function filterProducts() {
            const searchTerm = searchInput.value.toLowerCase();
            const filterValue = filterSelect.value;
            const categoryValue = categoryFilter.value;

            const filtered = products.filter(product => {
                const matchesSearch = product.nombre.toLowerCase().includes(searchTerm) ||
                    product.descripcion.toLowerCase().includes(searchTerm) ||
                    product.categoria.toLowerCase().includes(searchTerm);
                
                const matchesFilter = filterValue === 'all' ||
                    (filterValue === '1' && product.estado) ||
                    (filterValue === '0' && !product.estado);
                
                const matchesCategory = categoryValue === 'all' ||
                    product.categoria === categoryValue;

                return matchesSearch && matchesFilter && matchesCategory;
            });

            displayProducts(filtered);
        }

        searchInput.addEventListener('input', filterProducts);
        filterSelect.addEventListener('change', filterProducts);
        categoryFilter.addEventListener('change', filterProducts);
    }

    // Iniciar la carga de productos
    loadProducts();
});