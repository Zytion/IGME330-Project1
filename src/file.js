
var songList = [];

/*WIP storing uploaded songs in local storage for easy access*/
function readSongList() {
    if (typeof (Storage) !== "undefined") {
        // Code for localStorage
        if (localStorage.getItem('songList') != null) {
            songList = JSON.parse(localStorage.getItem('songList'));
        }
    } else {
        // No web storage Support.
        console.log("Local Storage Not Supported");

    }

}

function readFile(e) {
    var freader = new FileReader();
    let option = document.createElement("option");
    let file = e.target.files[0];
    option.textContent = file.name;
    let duplicate = false;
    songList.forEach(element => {
        if (element.name == song.name) {
            duplicate = true;
        }
    });
    //Skip if duplicate
    //Otherwise check if file size is not too large (in bytes)
    if (!duplicate && ((file.type == "audio/mpeg" && file.size < 10000000) ||
        (file.type == "audio/wav" && file.size < 40000000))) {
        freader.onload = function (e) {
            console.log(e);
            option.value = e.target.result;
            trackSelect.appendChild(option);
            trackSelect.selectedIndex = trackSelect.length - 1;
            trackSelect.dispatchEvent(new Event("change"));

        
            /*WIP storing uploaded songs in local storage for easy access*/
            // if (typeof (Storage) !== "undefined") {
            //     // Code for localStorage
            //     let song = {
            //         name: file.name,
            //         index: trackSelect.length - 1,
            //         path: e.target.result,
            //     };
            //     songList.push(song);
            //     console.log(JSON.stringify(songList));

            //     try {
            //         localStorage.setItem('songList', JSON.stringify(songList));
            //     } catch (error) {
            //         console.log(error);
            //     }

            // } else {
            //     // No web storage Support.
            //     console.log("Local Storage Not Supported");
            // }


        };
        freader.readAsDataURL(file);
    }
    else if (duplicate) {
        console.log("duplicate song detected!");
    }
    else {
        window.alert("File too large");
        fileInput.value = "";
    }
}

export { readFile, readSongList }