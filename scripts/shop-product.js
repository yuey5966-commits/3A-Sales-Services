document.addEventListener("DOMContentLoaded", function() {
    
    // ==========================================
    // 1. 获取 HTML 元素
    // ==========================================
    const productGrid = document.querySelector('.product-grid');
    const categoryFilter = document.getElementById('category-filter');
    const sortDropdown = document.querySelector('.sort-dropdown'); 
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const countLabel = document.getElementById('result-count');
    const paginationContainer = document.getElementById('pagination');
    const itemsPerPage = 30; 

    // 检查数据
    if (typeof productData === 'undefined') {
        console.error("错误：找不到 productData。");
        return;
    }

    // 全局变量
    let currentData = [...productData]; 
    let currentPage = 1;

    // ==========================================
    // 2. 核心功能：渲染产品网格
    // ==========================================
    function renderGrid(data) {
        productGrid.innerHTML = '';

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            card.innerHTML = `
                <div class="product-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${item.title}</h3>
                    <p class="product-category" style="font-size: 12px; color: #999; margin-bottom: 5px;">${item.category}</p>
                    <p class="product-price">${item.price}</p>
                    <button class="add-to-cart-btn">Add to cart</button>
                </div>
            `;
            
            productGrid.appendChild(card);
        });
    }

    // ==========================================
    // 3. 辅助功能：处理价格排序
    // ==========================================
    function parsePrice(priceStr) {
        if (!priceStr) return 0;
        return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    }

    // ==========================================
    // 4. 总控逻辑：筛选 + 搜索 + 排序
    // ==========================================
    function updateDisplay() {
        // 1. 获取当前所有筛选条件的值
        const category = categoryFilter ? categoryFilter.value : 'all';
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const sortValue = sortDropdown ? sortDropdown.value : 'default'; // 默认值设为 A-Z

        // 2. 第一步：筛选 (Category & Search)
        let filtered = productData.filter(item => {
            const matchCategory = (category === 'all') || (item.category === category);
            const matchSearch = (searchTerm === '') || item.title.toLowerCase().includes(searchTerm);
            return matchCategory && matchSearch;
        });

        // 3. 第二步：排序 (Sort)
        let sorted = [...filtered]; 

        if (sortValue === 'price-low') {
            // 价格：低 -> 高
            sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        } else if (sortValue === 'price-high') {
            // 价格：高 -> 低
            sorted.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        } else if (sortValue === 'latest') {
            // 最新：倒序
            sorted.reverse();
        } else {
            // 【默认逻辑修改】
            // 这里现在处理 "alphabetical" 以及所有其他情况
            // 执行 A -> Z 排序 (开启 numeric: true 以支持数字优先)
            sorted.sort((a, b) => a.title.localeCompare(b.title, 'en', { numeric: true }));
        }

        // 4. 更新数据并重置页码
        currentData = sorted;
        currentPage = 1; 
        
        // 5. 渲染页面
        renderGrid(currentData); 
        showPage(1);
    }

    // ==========================================
    // 5. 分页显示逻辑
    // ==========================================
    function showPage(page) {
        const products = document.querySelectorAll('.product-card');
        const totalItems = products.length;
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

        // 更新统计文字
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

    // ==========================================
    // 6. 事件监听
    // ==========================================

    if(categoryFilter) {
        categoryFilter.addEventListener('change', updateDisplay);
    }

    if(sortDropdown) {
        sortDropdown.addEventListener('change', updateDisplay);
    }

    if (searchInput) {
        searchInput.addEventListener('input', updateDisplay);
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            updateDisplay();
        });
    }

    // 初始化页面
    updateDisplay();
});