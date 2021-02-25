import * as utils from "./utils.js";

const canvasWidth = 400, canvasHeight = 300;
let ctx, n = 0, fps = 120;

const divergence = 137.5;
let c = 2;
const hValue = 361;

let offsetX = 0, offsetY = 0;

function init() {
    ctx = canvas.getContext("2d");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    loop();
}

function loop() {
    setTimeout(loop, 1000 / fps);

    //Reset when n reaches 1500
    if(n > 1500)
    {
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        n = 0;
        c = 2;
        //Pick a random spot near the center
        offsetX = utils.getRandomInt(-100, 100);
        offsetY = utils.getRandomInt(-100, 100);
    }

    // each frame draw a new dot
    // `a` is the angle
    // `r` is the radius from the center (e.g. "Pole") of the flower
    // `c` is the "padding/spacing" between the dots
    let a = n * utils.dtr(divergence);
    let r = c * Math.sqrt(n);
    //console.log(a, r);

    // now calculate the `x` and `y`
    let x = r * Math.cos(a) + canvasWidth / 2 + offsetX;
    let y = r * Math.sin(a) + canvasHeight / 2 + offsetY;
    //console.log(x, y);

    //let color = `rgb(${n % 256},0,255)`;

    //let aDegrees = (n * divergence) % 256;
    // let color = `rgb(${aDegrees},0,255)`;

    let bDegrees = (n * divergence) % hValue;
    let color = `hsla(${bDegrees},100%,50%, 0.5)`;
    utils.drawCircle(ctx, x, y, 2, color);

    color = `hsla(${n/5 % hValue},100%,50%, 0.5)`;

    utils.drawCircle(ctx, x, y, 2, color);

    n++;
    c += 0.001;
}

export {init};