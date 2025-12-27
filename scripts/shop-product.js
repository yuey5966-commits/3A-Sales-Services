document.addEventListener("DOMContentLoaded", function() {
    
    // ... (前面的变量获取保持不变) ...
    const productGrid = document.querySelector('.product-grid');
    const categoryFilter = document.getElementById('category-filter');
    const sortDropdown = document.querySelector('.sort-dropdown'); 
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const countLabel = document.getElementById('result-count');
    const paginationContainer = document.getElementById('pagination');
    const itemsPerPage = 30; 

    // --- 弹窗相关元素 ---
    const modal = document.getElementById('cart-modal');
    const modalTitle = document.getElementById('modal-product-title');
    const modalUnitPrice = document.getElementById('modal-unit-price');
    const modalTotalPrice = document.getElementById('modal-total-price');
    const qtyInput = document.getElementById('qty-input');
    const qtyMinusBtn = document.getElementById('qty-minus');
    const qtyPlusBtn = document.getElementById('qty-plus');
    const cancelBtn = document.getElementById('cancel-btn');
    const confirmBtn = document.getElementById('confirm-btn');
    const toast = document.getElementById('toast-notification');

    let currentProductPrice = 0; 
    let currentProductImage = ""; // 【新增】用来暂存当前产品的图片链接

    if (typeof productData === 'undefined') {
        console.error("错误：找不到 productData。");
        return;
    }

    let currentData = [...productData]; 
    let currentPage = 1;

    // ... (renderGrid 函数) ...
    function renderGrid(data) {
        productGrid.innerHTML = '';

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // 【修改】在 button 上增加了 data-image
            card.innerHTML = `
                <div class="product-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${item.title}</h3>
                    <p class="product-category" style="font-size: 12px; color: #999; margin-bottom: 5px;">${item.category}</p>
                    <p class="product-price">${item.price}</p>
                    <button class="add-to-cart-btn" 
                        data-title="${item.title}" 
                        data-price="${item.price}"
                        data-image="${item.image}"> 
                        Add to cart
                    </button>
                </div>
            `;
            
            productGrid.appendChild(card);
        });
    }

    // ... (辅助函数保持不变) ...
    function parsePrice(priceStr) {
        if (!priceStr) return 0;
        return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    }

    function formatPrice(num) {
        return "RM " + num.toFixed(2);
    }

    function updateModalTotal() {
        const qty = parseInt(qtyInput.value) || 1;
        const total = currentProductPrice * qty;
        modalTotalPrice.textContent = formatPrice(total);
    }

    // 【修改】openModal 现在接收 image 参数
    function openModal(title, priceStr, image) {
        modalTitle.textContent = title;
        currentProductPrice = parsePrice(priceStr);
        currentProductImage = image; // 保存图片链接
        modalUnitPrice.textContent = formatPrice(currentProductPrice);
        
        qtyInput.value = 1;
        updateModalTotal();

        modal.classList.add('show'); 
    }

    function closeModal() {
        modal.classList.remove('show');
    }

    function showToast() {
        toast.classList.add("show");
        setTimeout(function(){ 
            toast.classList.remove("show"); 
        }, 3000);
    }

    // 【修改】Grid 点击事件，获取 image
    productGrid.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const title = e.target.getAttribute('data-title');
            const price = e.target.getAttribute('data-price');
            const image = e.target.getAttribute('data-image'); // 获取图片
            openModal(title, price, image);
        }
    });

    // ... (数量加减监听保持不变) ...
    if (qtyMinusBtn) {
        qtyMinusBtn.addEventListener('click', function() {
            let qty = parseInt(qtyInput.value) || 1;
            if (qty > 1) { qtyInput.value = qty - 1; updateModalTotal(); }
        });
    }

    if (qtyPlusBtn) {
        qtyPlusBtn.addEventListener('click', function() {
            let qty = parseInt(qtyInput.value) || 1;
            qtyInput.value = qty + 1;
            updateModalTotal();
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }

    // 【重要修改】点击确认按钮 -> 保存到 LocalStorage
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const qty = parseInt(qtyInput.value) || 1;
            
            // 1. 构建商品对象
            const cartItem = {
                title: modalTitle.textContent,
                price: currentProductPrice,
                image: currentProductImage,
                quantity: qty
            };

            // 2. 获取现有的购物车数据 (如果还没存过，就是个空数组 [])
            let cart = JSON.parse(localStorage.getItem('myCart')) || [];

            // 3. 检查购物车里是不是已经有这个商品了
            // 如果有，就只增加数量；如果没有，就加进去
            const existingItemIndex = cart.findIndex(item => item.title === cartItem.title);
            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += qty;
            } else {
                cart.push(cartItem);
            }

            // 4. 保存回 LocalStorage
            localStorage.setItem('myCart', JSON.stringify(cart));

            // 5. 关闭弹窗并提示
            closeModal();
            showToast();
        });
    }

    window.addEventListener('click', function(e) {
        if (e.target === modal) { closeModal(); }
    });

    // ... (updateDisplay, showPage, renderPagination 等其余逻辑保持完全不变) ...
    // 为了节省篇幅，这里只要把你原来的 updateDisplay 及后面的代码照搬即可
    // 或者如果你需要，我可以把完整代码再次贴出
    
    function updateDisplay() {
        const category = categoryFilter ? categoryFilter.value : 'all';
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const sortValue = sortDropdown ? sortDropdown.value : 'default'; 

        let filtered = productData.filter(item => {
            const matchCategory = (category === 'all') || (item.category === category);
            const matchSearch = (searchTerm === '') || item.title.toLowerCase().includes(searchTerm);
            return matchCategory && matchSearch;
        });

        let sorted = [...filtered]; 

        if (sortValue === 'price-low') {
            sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        } else if (sortValue === 'price-high') {
            sorted.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        } else if (sortValue === 'latest') {
            sorted.reverse();
        } else {
            sorted.sort((a, b) => a.title.localeCompare(b.title, 'en', { numeric: true }));
        }

        currentData = sorted;
        currentPage = 1; 
        renderGrid(currentData); 
        showPage(1);
    }

    function showPage(page) {
        const products = document.querySelectorAll('.product-card');
        const totalItems = products.length;
        const itemsPerPage = 30; // 确保这里有定义
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        if (page < 1) page = 1;
        if (page > totalPages && totalPages > 0) page = totalPages;
        currentPage = page;

        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        products.forEach((product, index) => {
            if (index >= start && index < end) {
                product.style.display = 'flex';
            } else {
                product.style.display = 'none';
            }
        });

        if (totalItems === 0) {
            if(countLabel) countLabel.textContent = "No products found";
        } else {
            const displayEnd = end > totalItems ? totalItems : end;
            if(countLabel) countLabel.textContent = `Showing ${start + 1}–${displayEnd} of ${totalItems} results`;
        }

        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        if(paginationContainer) {
            paginationContainer.innerHTML = "";
            if (totalPages <= 1) return;

            const prevBtn = document.createElement('a');
            prevBtn.href = "#";
            prevBtn.innerHTML = "&laquo; Prev";
            prevBtn.className = "page-link";
            if (currentPage === 1) prevBtn.style.display = 'none';
            prevBtn.onclick = (e) => { e.preventDefault(); showPage(currentPage - 1); };
            paginationContainer.appendChild(prevBtn);

            for (let i = 1; i <= totalPages; i++) {
                const pageLink = document.createElement('a');
                pageLink.href = "#";
                pageLink.textContent = i;
                pageLink.className = "page-link";
                if (i === currentPage) pageLink.classList.add('active');
                pageLink.onclick = (e) => { e.preventDefault(); showPage(i); };
                paginationContainer.appendChild(pageLink);
            }

            const nextBtn = document.createElement('a');
            nextBtn.href = "#";
            nextBtn.innerHTML = "Next &raquo;";
            nextBtn.className = "page-link";
            if (currentPage === totalPages) nextBtn.style.display = 'none';
            nextBtn.onclick = (e) => { e.preventDefault(); showPage(currentPage + 1); };
            paginationContainer.appendChild(nextBtn);
        }
    }

    if(categoryFilter) categoryFilter.addEventListener('change', updateDisplay);
    if(sortDropdown) sortDropdown.addEventListener('change', updateDisplay);
    if (searchInput) searchInput.addEventListener('input', updateDisplay);
    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            updateDisplay();
        });
    }

    updateDisplay();
});