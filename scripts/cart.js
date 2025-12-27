document.addEventListener("DOMContentLoaded", function() {
    
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMsg = document.getElementById('empty-cart-msg');
    const cartTable = document.querySelector('.cart-table');
    const cartSummary = document.getElementById('cart-summary');
    const grandTotalEl = document.getElementById('cart-grand-total');

    // --- 新增：获取删除弹窗相关的元素 ---
    const removeModal = document.getElementById('remove-modal');
    const cancelRemoveBtn = document.getElementById('cancel-remove-btn');
    const confirmRemoveBtn = document.getElementById('confirm-remove-btn');

    // 用来暂存“当前准备删除”的商品索引
    let itemToDeleteIndex = null;

    // 1. 从 LocalStorage 读取数据
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];

    // 2. 渲染购物车
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let grandTotal = 0;

        if (cart.length === 0) {
            cartTable.style.display = 'none';
            cartSummary.style.display = 'none';
            emptyCartMsg.style.display = 'block';
            return;
        }

        cartTable.style.display = 'table';
        cartSummary.style.display = 'block';
        emptyCartMsg.style.display = 'none';

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            grandTotal += itemTotal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="product-col">
                    <img src="${item.image}" alt="${item.title}">
                    <span>${item.title}</span>
                </td>
                <td>RM ${item.price.toFixed(2)}</td>
                <td>
                    <div class="qty-box">
                        <button onclick="updateQty(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQty(${index}, 1)">+</button>
                    </div>
                </td>
                <td style="color: #e67e22; font-weight: bold;">RM ${itemTotal.toFixed(2)}</td>
                <td>
                    <button class="remove-btn" onclick="removeItem(${index})">×</button>
                </td>
            `;
            cartItemsContainer.appendChild(tr);
        });

        grandTotalEl.textContent = "RM " + grandTotal.toFixed(2);
    }

    // 3. 全局函数：更新数量
    window.updateQty = function(index, change) {
        if (cart[index].quantity + change > 0) {
            cart[index].quantity += change;
            saveAndRender();
        }
    };

    // 4. 【修改】全局函数：点击删除按钮 -> 打开弹窗
    window.removeItem = function(index) {
        // 记下要删除第几个
        itemToDeleteIndex = index;
        // 显示弹窗
        removeModal.classList.add('show');
    };

    // 5. 【新增】监听弹窗里的按钮
    
    // 点击 "Cancel" -> 关闭弹窗
    if (cancelRemoveBtn) {
        cancelRemoveBtn.addEventListener('click', function() {
            removeModal.classList.remove('show');
            itemToDeleteIndex = null; // 清空记录
        });
    }

    // 点击 "Remove" -> 真正执行删除
    if (confirmRemoveBtn) {
        confirmRemoveBtn.addEventListener('click', function() {
            if (itemToDeleteIndex !== null) {
                cart.splice(itemToDeleteIndex, 1); // 删除数据
                saveAndRender(); // 保存并刷新页面
                removeModal.classList.remove('show'); // 关闭弹窗
                itemToDeleteIndex = null; // 清空记录
            }
        });
    }

    // 点击弹窗外部 -> 关闭弹窗
    window.addEventListener('click', function(e) {
        if (e.target === removeModal) {
            removeModal.classList.remove('show');
            itemToDeleteIndex = null;
        }
    });

    // 6. 保存数据并重新渲染
    function saveAndRender() {
        localStorage.setItem('myCart', JSON.stringify(cart));
        renderCart();
    }

    // 初始化
    renderCart();
});