document.addEventListener("DOMContentLoaded", function() {
    
    // ==========================================
    // 1. 获取 HTML 元素
    // ==========================================
    const productGrid = document.querySelector('.product-grid');
    const categoryFilter = document.getElementById('category-filter'); // 获取分类下拉菜单
    const countLabel = document.getElementById('result-count');
    const paginationContainer = document.getElementById('pagination');
    const itemsPerPage = 30; // 一页显示多少个

    // 检查 productData 是否存在
    if (typeof productData === 'undefined') {
        console.error("错误：找不到 productData。请确保 shop-product-menu.js 在 shop-product.js 之前加载。");
        return;
    }

    // 全局变量，用于存储当前“正在显示”的数据（可能是全部，也可能是筛选后的）
    let currentData = productData;
    let currentPage = 1;

    // ==========================================
    // 2. 核心功能：渲染产品网格
    // ==========================================
    function renderGrid(data) {
        // 清空现有的网格
        productGrid.innerHTML = '';

        // 循环数据，生成 HTML 卡片
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
    // 3. 分页与显示逻辑
    // ==========================================
    function showPage(page) {
        // 重新获取当前页面上所有的卡片（因为 renderGrid 可能刚更新过它们）
        const products = document.querySelectorAll('.product-card');
        const totalItems = products.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        if (page < 1) page = 1;
        if (page > totalPages && totalPages > 0) page = totalPages;
        currentPage = page;

        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        // 控制每个卡片的显示/隐藏
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

        // 更新分页按钮
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
    // 4. 初始化与事件监听
    // ==========================================

    // 监听分类下拉菜单的变化
    if(categoryFilter) {
        categoryFilter.addEventListener('change', function(e) {
            const selectedCategory = e.target.value;

            // 如果选的是 'all'，就显示全部；否则筛选出匹配的 category
            if (selectedCategory === 'all') {
                currentData = productData;
            } else {
                currentData = productData.filter(item => item.category === selectedCategory);
            }

            // 1. 重新渲染网格
            renderGrid(currentData);
            // 2. 重置回第一页并显示
            showPage(1);
        });
    }

    // 页面刚加载时：渲染全部数据 -> 显示第一页
    renderGrid(productData);
    showPage(1);
});