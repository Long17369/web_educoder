function toggleIframe(id) {
    var iframe = document.getElementById("post-iframe-" + id);
    iframe.contentWindow.id = id;
    var iframeBody = iframe.contentWindow.document.body;
    var iframeDocument = iframe.contentWindow.document.documentElement;
    iframe.height = "0px";
    var iframeHeight = Math.max(iframeBody.clientHeight,
        iframeBody.scrollHeight,
        iframeBody.offsetHeight);
    iframe.style.height = iframeHeight + "px";
    iframe.style.pointerEvents = "auto";
    console.log("iframe height: " + iframeHeight);
    var a = document.getElementById("post-a-" + id);
    a.style.display = "none";
}

window.addEventListener('message', function (event) {
    if (event.data.type == 'resize') {
        toggleIframe(event.data.id);
    } else if (event.data.type == 'iframe-loaded') {
        hideLoading(event.data.id)
    }
});

function hideLoading(id) {
    document.getElementById("post-loading-" + id).style.display = 'none';
    document.getElementById("post-container-" + id).style.display = 'block';
}
function showLoading(id) {
    document.getElementById('content').innerHTML = marked(markdownContent);
}