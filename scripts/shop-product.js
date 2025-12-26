document.addEventListener("DOMContentLoaded", function() {
    
    // ==========================================
    // 1. 获取 HTML 元素
    // ==========================================
    const productGrid = document.querySelector('.product-grid');
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.querySelector('.search-input'); // 【新增】获取搜索框
    const searchBtn = document.querySelector('.search-btn');     // 【新增】获取搜索按钮
    const countLabel = document.getElementById('result-count');
    const paginationContainer = document.getElementById('pagination');
    const itemsPerPage = 30; 

    // 检查数据是否存在
    if (typeof productData === 'undefined') {
        console.error("错误：找不到 productData。请确保 shop-product-menu.js 在 shop-product.js 之前加载。");
        return;
    }

    // 全局变量
    let currentData = productData; // 存储当前筛选后的数据
    let currentPage = 1;

    // ==========================================
    // 2. 核心功能：渲染产品网格
    // ==========================================
    function renderGrid(data) {
        productGrid.innerHTML = '';

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // 【修改】这里删掉了 <button>Add to cart</button>
            card.innerHTML = `
                <div class="product-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${item.title}</h3>
                    <p class="product-category" style="font-size: 12px; color: #999; margin-bottom: 5px;">${item.category}</p>
                    <p class="product-price">${item.price}</p>
                </div>
            `;
            
            productGrid.appendChild(card);
        });
    }

    // ==========================================
    // 3. 分页与显示逻辑
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
    // 4. 事件监听 (Search & Filter)
    // ==========================================

    // 【功能 A】监听分类变化
    if(categoryFilter) {
        categoryFilter.addEventListener('change', function(e) {
            const selectedCategory = e.target.value;
            
            // 筛选数据
            filterData(selectedCategory, searchInput.value);
        });
    }

    // 【功能 B - 新增】监听搜索框输入 (实时搜索)
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value;
            const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
            
            // 筛选数据
            filterData(selectedCategory, searchTerm);
        });
    }

    // 【功能 B - 新增】监听搜索按钮点击
    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault(); // 防止按钮提交表单刷新页面
            const searchTerm = searchInput.value;
            const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
            
            filterData(selectedCategory, searchTerm);
        });
    }

    // 【辅助函数】统一处理筛选逻辑
    // 这个函数会同时考虑 "分类" 和 "搜索词"
    function filterData(category, term) {
        const lowerTerm = term.toLowerCase().trim();

        // 1. 先过滤分类
        let filtered = productData;
        if (category !== 'all') {
            filtered = filtered.filter(item => item.category === category);
        }

        // 2. 再过滤搜索词 (模糊匹配 Title)
        if (lowerTerm !== '') {
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(lowerTerm)
            );
        }

        // 更新全局数据并重新渲染
        currentData = filtered;
        renderGrid(currentData);
        showPage(1); // 搜索后重置回第1页
    }

    // 初始化
    renderGrid(productData);
    showPage(1);
});