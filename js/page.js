async function load_json_data(file) {
    var resdata;
    await fetch(file)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            resdata = data
        });
    return resdata;
}

function handle_data(data, type) {
    var ret = []
    if (type == "problems") {
        data.forEach(element => {
            ret.push([element, element])
        })
        return ret
    }
    data.content.forEach(element => {
        ret.push([element.proid + '.' + element.title, element.id])
    });
    return ret
}

async function load(path) {
    var info = readinfo(location.href.split('?')[1].split('&'))
    if (info.problems == undefined) {
        var type = "problems"
    }
    else {
        var type = "problem"
    }
    var pagedata = load_json_data('./' + path + '/data.json')
    pagedata.then(data => handle_data(data, type)).then(data => {
        console.log(data)
        for (const i in data) {
            const element = data[i];
            let tag = document.createElement("li");
            let main = document.getElementsByTagName("main")[0];
            let ul = main.getElementsByTagName("ul")[0];
            tag.onclick = function () {
                gotopage(type + '=' + element[1])
            }
            tag.textContent = element[0];
            ul.appendChild(tag);
        }
    })
}

function load_page() {
    var info = readinfo(location.href.split('?')[1].split('&'))
    if (info.type == undefined) {
        location.href = "."
        return
    }
    if (info.problems == undefined) {
        location.title = info.type
        load(info.type)
        return
    }
    if (info.problem == undefined) {
        location.title = info.problems
        load(info.type + '/' + info.problems)
        return
    }
    location.href = "./code.html?" + linkinfo(info)
}


load_page()