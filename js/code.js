const renderer = new marked.Renderer();


marked.setOptions({
    renderer: renderer,
    gfm: true,
    pedantic: false,
    sanitize: false,
    tables: true,
    breaks: false,
    smartLists: true,
    smartypants: false,
});

function show_copy_button() {
    const codeBlocks = document.querySelectorAll('pre');
    const codeContainer = document.querySelectorAll(".code-container");
    if (codeBlocks) {
        codeBlocks.forEach(function (codeBlock) {
            var copyButton = document.createElement('span');
            copyButton.className = 'copy';
            copyButton.textContent = '复制代码';
            var container = document.createElement('div');
            container.className = 'code-container';
            container.appendChild(copyButton);
            codeBlock.parentNode.insertBefore(container, codeBlock);
            copyButton.addEventListener('click', function () {
                var code = codeBlock.innerText;
                if (navigator.clipboard && window.isSecureContext) {
                    try {
                        navigator.clipboard.writeText(code).then(() => {
                            this.textContent = '复制成功';
                        }).catch(() => {
                            this.textContent = '复制失败';
                        });
                    } catch (err) {
                        this.textContent = '复制失败';
                    }
                } else {
                    var textarea = document.createElement('textarea');
                    textarea.value = code;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    this.textContent = '复制成功';
                }
                setTimeout(() => {
                    this.textContent = "复制代码";
                }, 1800);
            });
        });
    }
}

async function load_md_data(file) {
    var resdata;
    await fetch(file)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        }).then(data => {
            resdata = data
        });
    return resdata;
}

function load_page() {
    var info = readinfo(decodeURI(location.href).split('?')[1].split('&'))
    if (info.type == undefined) {
        location.href = "."
        return
    }
    if (info.problems == undefined) {
        document.title = info.type
        load(info.type)
        return
    }
    if (info.problem == undefined) {
        document.title = info.problems
        load(info.type + '/' + info.problems)
        return
    }
    document.title = info.title
}

function hl(codeTag){
    console.log(codeTag.querySelectorAll("code"));
    codeTag.querySelectorAll("pre code").forEach(
        function(code){
            hljs.highlightElement(code);
            hljs.lineNumbersBlock(code);
        }
    )
}

async function load_code() {
    var info = readinfo(decodeURI(location.href).split('?')[1].split('&'))
    load_page()
    var path = `${info.type}/${info.problems}/code/${info.problem}`
    load_md_data(`${path}.cont.md`).then(data => {
        console.log(data.replace('$$\\le$$', '≤').replace('$$<$$', '<'))
        var proTag = marked.marked(data.replace('$$\\le$$', '≤').replace('$$<$$', '<'), renderer)
        console.log(proTag)
        var goalTag = document.getElementById("pro")
        var Tag = document.createElement("div")
        Tag.innerHTML = proTag
        hl(Tag)
        goalTag.innerHTML = Tag.innerHTML
    })
    load_md_data(`${path}.code.md`).then(data => {
        var codeTag = marked.marked(data, renderer)
        var Tag = document.getElementById("code")
        Tag.innerHTML = codeTag
        var code = Tag
        hl(code);
        return code;
    }).then((data) => {
        // hljs.highlightAll();
        // hljs.initLineNumbersOnLoad();
    });
}

load_code()