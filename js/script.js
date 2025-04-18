function readinfo(info){
    var dict = {}
    for (const i in info) {
        const element = info[i];
        let key = element.split("=")[0];
        let value = element.split("=")[1];
        dict[key] = value;
    }
    return dict
}

function linkinfo(info){
    let link = ""
    for (const i in info) {
        const element = info[i];
        link += i + "=" + element + "&"
    }
    return link.slice(0, -1)
}

function gotopage(pageinfo){
    var location = window.location.href;
    var locationinfo = location.split("?");
    console.log(locationinfo[1])
    var locationpath = locationinfo[0].split("/");
    if (locationpath[locationpath.length-1]=='index.html' || locationpath[locationpath.length-1]==''){
        info = readinfo(pageinfo.split("&"))
        console.log(pageinfo.split("&"))
    }
    else{
        info = readinfo(locationinfo[1].split(1)[0].split("&").concat(pageinfo.split("&")));
    }
    console.log(info);
    var pageurl = './content.html?'+linkinfo(info);
    console.log(pageurl);
    document.location.href = pageurl;
}
