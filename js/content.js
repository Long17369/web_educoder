function load_json_data() {
    fetch('./main.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            window.contentdata = data;
        });
}
async function creat_content() {
    if (window.contentdata) {
        for (let i = 0; i < window.contentdata.contents.length; i++) {
            let item = window.contentdata.contents[i];
            load_content(item).then(item => {
                    var code = item.code.split('```c');
                    for (let j = 0; j < item.content.length; j++) {
                        set_content([item.id, item.content[j].id], code[Number(item.content[j].id) + 1]);
                        showcontent([item.id, item.content[j].id]);
                    }
                });
        }
    }
    else {
        setTimeout(creat_content, 1000);
    }
}
function showcontent(id) {
    var content = document.getElementById(id[0] + '_' + id[1]);
    console.log(content);
    content.style.display = 'block';
}
async function load_content(content) {
    await fetch('./code/' + content.id + '.md')
        .then(response => {
            if (!response.ok) {
                // throw new Error('Network response was not ok');
            }
            return response.text();
        }).then(text => {
            content.code = text;
        });
    return content;
}
function set_content(id, code) {
    document.getElementById('code_'+id[0] + '_' + id[1]).innerHTML = marked.parse("```c" + code);
}
load_json_data();
creat_content();

