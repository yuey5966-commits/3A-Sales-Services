document.addEventListener("DOMContentLoaded", function() {
    
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMsg = document.getElementById('empty-cart-msg');
    const cartTable = document.querySelector('.cart-table');
    const cartSummary = document.getElementById('cart-summary');
    const grandTotalEl = document.getElementById('cart-grand-total');

    // 1. 从 LocalStorage 读取数据
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];

    // 2. 渲染购物车
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let grandTotal = 0;

        if (cart.length === 0) {
            // 如果购物车是空的
            cartTable.style.display = 'none';
            cartSummary.style.display = 'none';
            emptyCartMsg.style.display = 'block';
            return;
        }

        // 如果有商品
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

    // 3. 全局函数：更新数量 (挂载到 window 对象，方便 HTML onclick 调用)
    window.updateQty = function(index, change) {
        if (cart[index].quantity + change > 0) {
            cart[index].quantity += change;
            saveAndRender();
        }
    };

    // 4. 全局函数：删除商品
    window.removeItem = function(index) {
        if(confirm("Are you sure you want to remove this item?")) {
            cart.splice(index, 1); // 从数组中删除
            saveAndRender();
        }
    };

    // 5. 保存数据并重新渲染
    function saveAndRender() {
        localStorage.setItem('myCart', JSON.stringify(cart));
        renderCart();
    }

    // 初始化
    renderCart();
});