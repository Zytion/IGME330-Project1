let audioCtx;

let element, sourceNode, analyserNode, gainNode;

const DEFAULTS = Object.freeze({
    gain : 0.5,
    numSamples : 256
});

let audioData = new Uint8Array(DEFAULTS.numSamples / 2);

function setupWebaudio(filePath)
{
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    audioCtx = new AudioContext();

    element = new Audio();

    loadSoundFile(filePath);

    sourceNode = audioCtx.createMediaElementSource(element);

    analyserNode = audioCtx.createAnalyser();


    analyserNode.fftSize = DEFAULTS.numSamples;

    gainNode = audioCtx.createGain();
    gainNode.gain.value = DEFAULTS.gain;

    sourceNode.connect(analyserNode);
    gainNode.connect(audioCtx.destination);
}

function loadSoundFile(filePath)
{
    element.src = filePath;
}

function playCurrentSound(){
    element.play();
}

function pauseCurrentSound(){
    element.pause();
}

function setVolume(value)
{
    value = Number(value);
    gainNode.gain.value = value;
}

export {audioCtx, setupWebaudio, playCurrentSound, pauseCurrentSound, loadSoundFile, setVolume, analyserNode}