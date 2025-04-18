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

function load_code() {
    var info = readinfo(location.href.split('?')[1].split('&'))
    var path = `${info.type}/${info.problems}/code/${info.problem}`
    load_md_data(`${path}.code.md`).then(data => {
        var codeTag = marked.marked(data, renderer)
        var Tag = document.getElementById("code")
        Tag.innerHTML = codeTag
        var code = Tag
        return code
    }).then(data => {
        hljs.highlightAll();
    }
    )
    load_md_data(`${path}.cont.md`).then(data => {
        var proTag = marked.marked(data, renderer)
        document.getElementById("pro").innerHTML = proTag
    })
}

load_code()