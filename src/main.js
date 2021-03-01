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
let nMax = 400; 

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

    for (let loop = 0; loop < 3; loop++) {
        color = `hsla(${n % hValue},100%,50%, 0.5)`;

        createPhylotaxis(ctx, size, color, n, c);

        n++;
        size += .01;
        c += 0.01;        
    }

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

        //let color = `rgb(${n % 256},0,255)`;

        //let aDegrees = (n * divergence) % 256;
        // let color = `rgb(${aDegrees},0,255)`;
        utils.drawCircle(ctx, x, y, size, color);

       
    }

}

export { init };