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

