import * as utils from "./utils.js";
import * as audio from './audio.js';

var canvasWidth = 800, canvasHeight = 600;
var ctx, n = 0, fps = 60;
var analyserNode, audioData;
var playButton;

let cDefault = 10;

//Phyllotaxis variables
var divergence = 137.5;
var c = cDefault;
var size = 4;
var hValue = 361;
var offsetX = 0, offsetY = 0;
let color;
let colorChosen = "rainbow";
let loopNum = 1;
let nMax = 500;
let beatsPerSecond = 124.0 / 60.0;
let alpha = 1;


//Audio Variables
const DEFAULTS = Object.freeze({
    sound1: "media/Unknown.mp3"
});

function init() {
    audio.setupWebaudio(DEFAULTS.sound1);
    let canvas = document.querySelector('canvas');
    ctx = canvas.getContext("2d");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    //Audio
    setupUI(canvas, audio.analyserNode);
    audio.audioCtx.suspend();

    loop();
    //window.requestAnimationFrame(loop);
}

function setupUI(canvasElement, analyserNodeRef) {
    // A - hookup fullscreen button
    const fsButton = document.querySelector("#fsButton");

    // add .onclick event to button
    fsButton.onclick = e => {
        console.log("init called");
        utils.goFullscreen(canvasElement);
    };
    
    //hook up play button
    playButton = document.querySelector('#playButton');
    playButton.onclick = e => {
        loopNum = Math.round(beatsPerSecond * nMax / fps);
        //console.log(`audioCtx.state before = ${audio.audioCtx.state}`);
        if (audio.audioCtx.state == 'suspended') {
            audio.audioCtx.resume();
        }
        //console.log(`audioCtx.state after = ${audio.audioCtx.state}`);
        if (e.target.dataset.playing === "no") {
            audio.playCurrentSound();
            e.target.dataset.playing = "yes";
        }
        else {
            audio.pauseCurrentSound();
            e.target.dataset.playing = "no";
        }
    };

    //hook up volume slider and label
    let volumeSlider = document.querySelector("#volumeSlider");
    let volumeLabel = document.querySelector("#volumeLabel");
    volumeSlider.oninput = e => {
        audio.setVolume(e.target.value);
        volumeLabel.innerHTML = Math.round((e.target.value / 2 * 100));
        size = 2 * e.target.value + 1;
    };
    volumeSlider.dispatchEvent(new Event("input"));

    //hook up track selection
    let trackSelect = document.querySelector("#trackSelect");
    trackSelect.selectedIndex = 0;
    trackSelect.onchange = e => {
        audio.loadSoundFile(e.target.value);
        if (playButton.dataset.playing == "yes") {
            playButton.dispatchEvent(new MouseEvent("click"));
        }
    };

    //hook up song upload
    let fileInput = document.querySelector("#songUpload");
    fileInput.oninput = e => {
        console.log(e.target.value);
        var freader = new FileReader();
        let option = document.createElement("option");
        let file = e.target.files[0];
        option.textContent = file.name;
        console.log(file);
        if ((file.type == "audio/mpeg" && file.size < 10000000) ||
            (file.type == "audio/wav" && file.size < 40000000)) {
            freader.onload = function (e) {
                console.log(e);
                option.value = e.target.result;
                trackSelect.appendChild(option);
                fileInput.value = "";
            };
            freader.readAsDataURL(file);
        }
        else {
            window.alert("File too large");
            fileInput.value = "";
        }
    };

    //hook up color select
    let colorSelect = document.querySelector("#colorSelect");
    colorSelect.onchange = e => {
        colorChosen = e.target.value;
    };

    //hook up pattern select
    let patternSelect = document.querySelector("#patternSelect");
    patternSelect.onchange = e => {
        ctx.save();
        ctx.fillColor = 'black';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
        if (e.target.value == 'regular') {
            n = 0;
            c = cDefault;
            divergence = 137.5;
        }
        else if (e.target.value == 'lines') {
            n = 0;
            divergence = 20;
        }
        else {
            n = 0;
            divergence = 4;
        }
    };

    //hook up opacity slider
    let opacitySlider = document.querySelector("#opacitySlider");
    let opacityLabel = document.querySelector("#opacityLabel");

    opacitySlider.oninput = e => {
        alpha = e.target.value;
        opacityLabel.innerHTML = (e.target.value * 100) + '%';
    };
    opacitySlider.dispatchEvent(new Event("input"));


    analyserNode = analyserNodeRef;

    // 1) create a byte array (values of 0-255) to hold the audio data
    // normally, we do this once when the program starts up, NOT every frame
    audioData = new Uint8Array(analyserNodeRef.fftSize / 2);

    console.log(analyserNode);
} // end setupUI

function loop() {

    //loop through the n's
    if (n > nMax) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.8)"
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
        n = 0;
        c = cDefault;

        if (playButton.dataset.playing == "yes") {
            analyserNode.getByteFrequencyData(audioData);
            let totalLoudness = audioData.reduce((total, num) => total + num);
            let averageLoudness = totalLoudness / (analyserNode.fftSize / 2);
            // Now look at loudness in a specific bin
            // 22050 kHz divided by 128 bins = 172.23 kHz per bin
            // the 12th element in array represents loudness at 2.067 kHz
            let loudnessAt2K = audioData[11];
            let vol = (averageLoudness / 40.0 + audio.getVolume() * 2) - 1; //goes from 2 - 4

            // philoPerSecond = beatsPerSecond;
            // dotPerFrame = loopNum;
            // dotPerSecond = dotPerFrame * fps;
            // secondsPerPhilo = nMax / dotPerSecond;

            // secondsPerPhilo = nMax / (loopNum * fps);
            // philoPerSecond = audio.actualBPM / 60.0;

            //secondsPerPhilo = 1.0 / philoPerSecond;
            //nMax / (loopNum * fps) = 1.0 / beatsPerSecond;
            beatsPerSecond = audio.actualBPM / 60.0;
            nMax = Math.round(110 * vol);
            loopNum = Math.round(beatsPerSecond * nMax / 60.0);
            //fps = nMax * beatsPerSecond / loopNum;
        }
        //size = 4;
    }

    //choosing colors
    if (colorChosen == "rainbow") {
        color = `hsla(${n % hValue},100%,50%, ${alpha})`;
    }
    else if (colorChosen == "candy") {
        color = `rgba(${n % hValue + 55}, 0, ${200 - (n % hValue) / 2}, ${alpha})`;
    }
    else if (colorChosen == "cool") {
        color = `rgba(0, ${n % hValue}, ${256 - (n % hValue)}, ${alpha})`;
    }
    else if (colorChosen == "ocean") {
        color = `rgba(0, ${85 - (n % hValue) / 4}, ${n % hValue + 55}, ${alpha})`;
    }
    else {
        color = `hsla(${1 - n % hValue},100%,50%, ${alpha})`;
    }

    if (playButton.dataset.playing == "yes") {
        for (let loop = 0; loop < loopNum; loop++) {
            createPhylotaxis(ctx, size, color, n, c);

            n++;
            //c += 0.01;
        }
    }
    setTimeout(loop, 1000 / fps);
}

function createPhylotaxis(ctx, size, color, n, c) {
    //for (let i = 0; i < repeater; ++i) {
    //Reset when n reaches 1500
    // each frame draw a new dot
    // `a` is the angle
    // `r` is the radius from the center (e.g. "Pole") of the flower
    // `c` is the "padding/spacing" between the dots
    let a = n * utils.dtr(divergence);
    let r = c * Math.sqrt(n);

    // now calculate the `x` and `y`
    let x = r * Math.cos(a) + canvasWidth / 2 + offsetX;
    let y = r * Math.sin(a) + canvasHeight / 2 + offsetY;

    utils.drawCircle(ctx, x, y, size, color);
    //}

}

export { init };