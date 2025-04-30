document.addEventListener('DOMContentLoaded', function () {
    const productsContainer = document.getElementById('products-container');
    const searchInput = document.getElementById('search');
    const filterSelect = document.getElementById('filter');

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
                const [id, imagen, nombre, descripcion, precioOriginal, precioDescuento, garantia, estado] = line.split('|');
                
                return {
                    id: id.trim(),
                    imagen: imagen.trim(),
                    nombre: nombre.trim(),
                    descripcion: descripcion.trim().replace(/\\n/g, '<br>'), // Convierte \n en <br>
                    precioOriginal: precioOriginal.trim(),
                    precioDescuento: precioDescuento.trim(),
                    garantia: garantia.trim(),
                    estado: estado.trim() === '1'
                };
            });
    }
    

    // Función para mostrar los productos
    function displayProducts(products) {
        productsContainer.innerHTML = products.map(product => `
            <div class="product-card" data-status="${product.estado ? '1' : '0'}">
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
                </div>
            </div>
        `).join('');
    }

    // Función para configurar búsqueda y filtrado
    function setupSearchFilter(products) {
        function filterProducts() {
            const searchTerm = searchInput.value.toLowerCase();
            const filterValue = filterSelect.value;

            const filtered = products.filter(product => {
                const matchesSearch = product.nombre.toLowerCase().includes(searchTerm) ||
                    product.descripcion.toLowerCase().includes(searchTerm);
                const matchesFilter = filterValue === 'all' ||
                    (filterValue === '1' && product.estado) ||
                    (filterValue === '0' && !product.estado);

                return matchesSearch && matchesFilter;
            });

            displayProducts(filtered);
        }

        searchInput.addEventListener('input', filterProducts);
        filterSelect.addEventListener('change', filterProducts);
    }

    // Iniciar la carga de productos
    loadProducts();
});