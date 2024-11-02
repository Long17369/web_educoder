window.id = window.frameElement.id.split('-')[2]; // 设置当前页面的ID
window.parent.postMessage({ 'type': 'iframe-loaded', 'id': window.id }, '*');// 向父页面发送消息，页面加载完成
function toggleMenu(id) {
    var submenu = document.getElementById("menu-" + id);
    var icon = document.querySelector(".toggle-icon");
    if (submenu.style.display === "none" || submenu.style.display === "") {
        submenu.style.display = "block"; // 展开菜单
        icon.textContent = "▼"; // 更改箭头为向下
    } else {
        submenu.style.display = "none"; // 收起菜单
        icon.textContent = "▶"; // 更改箭头为向右
    }
    resizeIframe(); // 刷新页面
}

function reflash(){
    if(window.Spread===true){
        resizeIframe();
    }
}

function resizeIframe() {
    window.Spread = true; // 标记页面已刷新
    window.parent.postMessage({
        'type': 'resize', 'id': window.id
    }, '*'); // 向父页面发送消息，刷新页面
}