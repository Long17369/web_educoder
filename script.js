function toggleIframe(id) {
    var iframe = document.getElementById("post-iframe-" + id);
    var iframeBody = iframe.contentWindow.document.body;
    var iframeDocument = iframe.contentWindow.document.documentElement;
    var iframeHeight = Math.max(iframeBody.scrollHeight,
        iframeBody.offsetHeight, 
        iframeDocument.clientHeight, 
        iframeDocument.scrollHeight, 
        iframeDocument.offsetHeight);
    iframe.style.height = iframeHeight + "px";
    iframe.style.pointerEvents = "auto";
    console.log("iframe height: " + iframeHeight);
    var a = document.getElementById("post-a-" + id);
    a.style.display = "none";
}