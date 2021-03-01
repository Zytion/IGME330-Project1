import * as utils from "./utils.js";
import * as audio from './audio.js';

var canvasWidth = 800, canvasHeight = 600;
var ctx, n = 0, fps = 2000;

//Phyllotaxis variables
var divergence = 137.5;
var c = 4;
var size = 4;
var hValue = 361;
var offsetX = 0, offsetY = 0;
var repeater = 10;
let color;
let colorChosen = "rainbow";
let loopNum = 3;
let nMax = 400; 

let audioData;
let analyserNode; 
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
    setupUI(canvas);

    audio.audioCtx.suspend();
    analyserNode = audio.analyserNode;
    audioData = new Uint8Array(audio.analyserNode.fftSize/2);
    window.requestAnimationFrame(loop);
}

function setupUI(canvasElement) {
    // A - hookup fullscreen button
    const fsButton = document.querySelector("#fsButton");

    // add .onclick event to button
    fsButton.onclick = e => {
        console.log("init called");
        utils.goFullscreen(canvasElement);
    };

    var playButton = document.querySelector('#playButton');
    playButton.onclick = e => {
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

    let volumeSlider = document.querySelector("#volumeSlider");
    let volumeLabel = document.querySelector("#volumeLabel");

    volumeSlider.oninput = e => {
        audio.setVolume(e.target.value);
        volumeLabel.innerHTML = Math.round((e.target.value / 2 * 100));
    };
    volumeSlider.dispatchEvent(new Event("input"));

    let trackSelect = document.querySelector("#trackSelect");
    trackSelect.onchange = e => {
        audio.loadSoundFile(e.target.value);
        if (playButton.dataset.playing == "yes") {
            playButton.dispatchEvent(new MouseEvent("click"));
        }
    };

    let colorSelect = document.querySelector("#colorSelect");
    colorSelect.onchange = e => {
        colorChosen = e.target.value;
    };

    let patternSelect = document.querySelector("#patternSelect");
    patternSelect.onchange = e => {
        ctx.save();
        ctx.fillColor = 'black';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
        if (e.target.value == 'regular') {
            n = 0;
            c = 4;
            size = 4;
            divergence = 137.5;
            loopNum = 3;
        }
        else if (e.target.value == 'lines') {
            n = 0;
            c = 2;
            size = 2;
            divergence = 20;
            nMax = 365;
            loopNum = 3;
        }
        else {
            n = 0;
            c = 1;
            size = 2;
            divergence = 4;
            nMax = 365;
            loopNum = 2;
        }
    };

} // end setupUI

function loop() {
    
    if (n > nMax) {
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        n = 0;
        c = 4;
        size = 4;
    }

    //let bDegrees = (n * divergence) % hValue;
    //let color = `hsla(${bDegrees},100%,50%, 0.5)`;

    if (colorChosen == "rainbow") {
        color = `hsla(${n % hValue},100%,50%, 0.5)`;
    }
    else if (colorChosen == "red") {
        color = `rgb(${n % hValue}, 0, 0)`;
    }
    else if (colorChosen == "green") {
        color = `rgb(0, ${n % hValue}, ${n % hValue - 200})`;
    }
    else if (colorChosen == "blue") {
        color = `rgb(0, ${n % hValue - 100}, ${n % hValue})`;
    }
    else {
        color = `rgb(${n % hValue - 100}, 0, ${n % hValue})`;
    }

    for (let loop = 0; loop < loopNum; loop++) {
        createPhylotaxis(ctx, size, color, n, c);

        n++;
        size += .01;
        c += 0.01;        
    }

    //AUDIO LOOP
	audio.analyserNode.getByteFrequencyData(audioData);
    console.log(audioData);
		
    console.log("-----Audio Stats-----");
    let totalLoudness =  audioData.reduce((total,num) => total + num);
    let averageLoudness =  totalLoudness/(audio.analyserNode.fftSize/2);
    let minLoudness =  Math.min(...audioData); // ooh - the ES6 spread operator is handy!
    let maxLoudness =  Math.max(...audioData); // ditto!
    // Now look at loudness in a specific bin
    // 22050 kHz divided by 128 bins = 172.23 kHz per bin
    // the 12th element in array represents loudness at 2.067 kHz
    let loudnessAt2K = audioData[11]; 
    console.log(`averageLoudness = ${averageLoudness}`);
    console.log(`minLoudness = ${minLoudness}`);
    console.log(`maxLoudness = ${maxLoudness}`);
    console.log(`loudnessAt2K = ${loudnessAt2K}`);
    console.log("---------------------");


    setTimeout(loop, 1000 / fps);
}

function createPhylotaxis(ctx, size, color, n, c) {
    for (let i = 0; i < repeater; ++i) {
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
    }

}

export { init };