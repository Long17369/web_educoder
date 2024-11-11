async function load_json_data() {
    if (window.id == 1) var file = './main.json';
    else if (window.id == 2) var file = './pta.json';
    await fetch(file)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            window.contentdata = data;
        });
    return;
}

function creat_content() {
    if (window.contentdata) {
        for (let i = 0; i < window.contentdata.contents.length; i++) {
            let item = window.contentdata.contents[i];
            load_content(item).then(item => {
                var codes = item.codes.split('```c');
                for (let j = 0; j < item.content.length; j++) {
                    if(item.id >=0 )id = [item.id, item.content[j].id];
                    else id = [-item.id-1, item.content[j].id];
                    set_content(id, codes[Number(item.content[j].id) + 1])
                        .then(id => {
                            wait_jsload(showcontent, id);
                        })
                }
            })
        };
    }
}

function wait_jsload(func, ...arguments) {
    if (hljs) {
        func(...arguments);
    }
    else {
        setTimeout((func, ...arguments) => {
            func(arguments);
        }, 1000);
    }
}

function showcontent(id) {
    var content = document.getElementById(id[0] + '_' + id[1]);
    var text = content.children[1].children[0].children[0]
    text.innerHTML = hljs.highlight(window.contentdata.contents[id[0]].content[id[1]].code, { language: text.classList[0].split('-')[1] }).value;
    content.style.display = 'block';
    reflash();
}

async function load_content(content) {
    await fetch('./code/' + content.id + '.md')
        .then(response => {
            if (!response.ok) {
                // throw new Error('Network response was not ok');
            }
            return response.text();
        }).then(text => {
            content.codes = text;
        });
    return content;
}

async function set_content(id, code) {
    code = "```c" + code;
    let c = window.contentdata.contents[id[0]].content[id[1]];
    c.code = code.split('```')[1];
    if (c.code.slice(0, 3) == 'cpp') c.code = c.code.slice(2);
    else c.code = c.code.slice(1);
    document.getElementById('code_' + id[0] + '_' + id[1]).innerHTML = await marked.parse(code);
    return id
}

async function wait_window_id() {
    if (window.id) return;
    else {
        setTimeout(wait_window_id, 1000);
    }
}
wait_window_id().then(() => {
    load_json_data().then(() => {
        creat_content();
    })
});

function highlight() {
    if (hljs) {
        hljs.highlightAll();
    }
    else {
        setTimeout(highlight, 1000);
    }
}