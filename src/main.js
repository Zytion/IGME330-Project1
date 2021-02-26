import * as utils from "./utils.js";
import * as audio from './audio.js';

var canvasWidth = 400, canvasHeight = 300;
var ctx, n = 0, fps = 1000;

//Phyllotaxis variables
var divergence = 137.5;
var c = 2;
var hValue = 361;
var offsetX = 0, offsetY = 0;
var repeater = 10;

//Audio Variables
const DEFAULTS = Object.freeze({
	sound1  :  "media/Unknown.mp3"
});

function init() {
    audio.setupWebaudio(DEFAULTS.sound1);
    var canvas = document.querySelector('canvas');
    ctx = canvas.getContext("2d");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    //Audio
	setupUI(canvas);

    window.requestAnimationFrame(loop);
}

function setupUI(canvasElement){
    // A - hookup fullscreen button
    const fsButton = document.querySelector("#fsButton");
      
    // add .onclick event to button
    fsButton.onclick = e => {
      console.log("init called");
      utils.goFullscreen(canvasElement);
    };
    
    var playButton = document.querySelector('#playButton');
    playButton.onclick = e => {
        console.log(`audioCtx.state before = ${audio.audioCtx.state}`);
        if(audio.audioCtx.state == "suspended")
        {
            audio.audioCtx.resume();
        }
        console.log(`audioCtx.state after = ${audio.audioCtx.state}`);
        if(e.target.dataset.playing == "no")
        {
            audio.playCurrentSound();
            e.target.dataset.playing = "yes";
        }
        else
        {
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
        if(playButton.dataset.playing == "yes")
        {
            playButton.dispatchEvent(new MouseEvent("click"));
        }
    };

  } // end setupUI

function loop() {
    for (var i = 0; i < repeater; ++i) {
        //Reset when n reaches 1500
        if (n > 1500) {
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            n = 0;
            c = 2;
            //Pick a random spot near the center
            //offsetX = utils.getRandomInt(-100, 100);
            //offsetY = utils.getRandomInt(-100, 100);
        }

        // each frame draw a new dot
        // `a` is the angle
        // `r` is the radius from the center (e.g. "Pole") of the flower
        // `c` is the "padding/spacing" between the dots
        var a = n * utils.dtr(divergence);
        var r = c * Math.sqrt(n);
        //console.log(a, r);

        // now calculate the `x` and `y`
        var x = r * Math.cos(a) + canvasWidth / 2 + offsetX;
        var y = r * Math.sin(a) + canvasHeight / 2 + offsetY;
        //console.log(x, y);

        //let color = `rgb(${n % 256},0,255)`;

        //let aDegrees = (n * divergence) % 256;
        // let color = `rgb(${aDegrees},0,255)`;

        var bDegrees = (n * divergence) % hValue;
        var color = `hsla(${bDegrees},100%,50%, 0.5)`;
        utils.drawCircle(ctx, x, y, 2, color);

        color = `hsla(${n / 5 % hValue},100%,50%, 0.5)`;

        utils.drawCircle(ctx, x, y, 2, color);

        n++;
        c += 0.001;
    }
    window.requestAnimationFrame(loop);
}

export { init };