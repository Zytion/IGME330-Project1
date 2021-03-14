
var songList = [];
var reader;
/*WIP storing uploaded songs in local storage for easy access*/
function readSongList() {
    reader = new FileReader();
    if (typeof (Storage) !== "undefined") {
        // Code for localStorage
        //console.log(localStorage);
        if (localStorage.getItem('songlist') != null) {
            songList = JSON.parse(localStorage.getItem('songlist'));
            songList.forEach(song => {
                //WIP
                console.log(song.name);
                addOption(song.name, song.path);
            });
        }
    } else {
        // No web storage Support.
        console.log("Local Storage Not Supported");
    }
}

function readFile(e) {
    let file = e.target.files[0];
    let fileInput = document.querySelector("#songUpload");
    let duplicate = false;
    songList.forEach(element => {
        if (element.name == file.name) {
            duplicate = true;
        }
    });
    //Skip if duplicate
    //Otherwise check if file size is not too large (in bytes)
    if (!duplicate && ((file.type == "audio/mpeg" && file.size < 10000000) ||
        (file.type == "audio/wav" && file.size < 40000000))) {
        reader.onload = function (e) {
            addOption(file.name, e.target.result);
            trackSelect.selectedIndex = trackSelect.length - 1;
            trackSelect.dispatchEvent(new Event("change"));
           
            if (typeof (Storage) !== "undefined") {
                //console.log(e.target.result);
                // Code for localStorage
                let song = {
                    name: file.name,
                    path: URL.createObjectURL(file)
                    //path: e.target.result
                };
                songList.push(song);
                // try {
                //     localStorage.setItem('songlist', JSON.stringify(songList));
                // } catch (error) {
                //     console.log(error);
                // }

            } else {
                // No web storage Support.
                console.log("Local Storage Not Supported");
            }


        };
        reader.readAsDataURL(file);
    }
    else if (duplicate) {
        console.log("duplicate song detected!");
    }
    else {
        window.alert(`File is too large:\n${file.name}`);
    }
    fileInput.value = "";
}

function addOption(name, path)
{
    let option = document.createElement("option");
    option.textContent = name;
    option.value = path;
    trackSelect.appendChild(option);
}

export { readFile, readSongList }