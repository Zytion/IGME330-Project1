// 1 - our WebAudio context, **we will export and make this public at the bottom of the file**
let audioCtx;

// **These are "private" properties - these will NOT be visible outside of this module (i.e. file)**
// 2 - WebAudio nodes that are part of our WebAudio audio routing graph
let element, sourceNode, analyserNode, gainNode, actualBPM;

// 3 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
    gain: 0.5,
    numSamples: 256
});

// 4 - create a new array of 8-bit integers (0-255)
// this is a typed array to hold the audio frequency data
let audioData = new Uint8Array(DEFAULTS.numSamples / 2);

// **Next are "public" methods - we are going to export all of these at the bottom of this file**
function setupWebaudio(filePath) {
    // 1 - The || is because WebAudio has not been standardized across browsers yet
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();


    // 2 - this creates an <audio> element
    element = new Audio();

    // 3 - have it point at a sound file
    loadSoundFile(filePath);

    // 4 - create an a source node that points at the <audio> element
    sourceNode = audioCtx.createMediaElementSource(element);

    // 5 - create an analyser node
    // note the UK spelling of "Analyser"
    analyserNode = audioCtx.createAnalyser();

    /*
    // 6
    We will request DEFAULTS.numSamples number of samples or "bins" spaced equally 
    across the sound spectrum.
    
    If DEFAULTS.numSamples (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz, 
    the third is 344Hz, and so on. Each bin contains a number between 0-255 representing 
    the amplitude of that frequency.
    */
    // fft stands for Fast Fourier Transform
    analyserNode.fftSize = DEFAULTS.numSamples;

    // 7 - create a gain (volume) node
    gainNode = audioCtx.createGain();
    gainNode.gain.value = DEFAULTS.gain;

    // 8 - connect the nodes - we now have an audio graph
    sourceNode.connect(analyserNode);
    analyserNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
}

function loadSoundFile(filePath) {
    element.src = filePath;
    getData(filePath);
}

function playCurrentSound() {
    element.play();
}

function pauseCurrentSound() {
    element.pause();
}

function setVolume(value) {
    value = Number(value);
    gainNode.gain.value = value;
}

function getVolume() {
    return gainNode.gain.value;
}

function getData(url) {
    var source = audioCtx.createBufferSource();
    var request = new XMLHttpRequest();

    request.open('GET', url, true);

    request.responseType = 'arraybuffer';

    request.onload = function () {
        var audioData = request.response;

        audioCtx.decodeAudioData(audioData, function (buffer) {
            source.buffer = buffer;

            source.connect(audioCtx.destination);
            getBPM(buffer);
        },

            function (e) { console.log("Error with decoding audio data" + e.err); });

    }

    request.send();
}
function getBPM(buffer) {
    // Create offline context
    var offlineContext = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);

    // Create buffer source
    var source = offlineContext.createBufferSource();
    source.buffer = buffer;

    // Create filter
    var filter = offlineContext.createBiquadFilter();
    filter.type = "lowpass";

    // Pipe the song into the filter, and the filter into the offline context
    source.connect(filter);
    filter.connect(offlineContext.destination);

    // Schedule the song to start playing at time:0
    source.start(0);

    // Render the song
    offlineContext.startRendering()

    // Act on the result
    offlineContext.oncomplete = function (e) {
        // Filtered buffer!
        var filteredBuffer = e.renderedBuffer;
        let groups = groupNeighborsByTempo(filteredBuffer.getChannelData(0), 0.6, buffer.sampleRate);
        var top = groups.sort(function (intA, intB) {
            return intB.count - intA.count;
        }).splice(0, 5);
        actualBPM = Math.round(top[0].tempo);
        console.log("Actual BPM: " + actualBPM);
    };
}

function getPeaksAtThreshold(data, threshold) {
    var peaksArray = [];
    var length = data.length;
    for (var i = 0; i < length;) {
        if (data[i] > threshold) {
            peaksArray.push(i);
            // Skip forward ~ 1/4s to get past this peak.
            i += 5000;
        }
        i++;
    }
    return peaksArray;
}

function countIntervalsBetweenNearbyPeaks(data, threshold) {
    var intervalCounts = [];
    var peaks = getPeaksAtThreshold(data, threshold);
    peaks.forEach(function (peak, index) {
        for (var i = 0; i < 10; i++) {
            var interval = peaks[index + i] - peak;
            var foundInterval = intervalCounts.some(function (intervalCount) {
                if (intervalCount.interval === interval)
                    return intervalCount.count++;
            });
            if (!foundInterval) {
                intervalCounts.push({
                    interval: interval,
                    count: 1
                });
            }
        }
    });
    return intervalCounts;
}


function groupNeighborsByTempo(data, threshold, sampleRate) {
    var tempoCounts = [];
    let intervalCounts = countIntervalsBetweenNearbyPeaks(data, threshold);
    intervalCounts.forEach(function (intervalCount, i) {
        if (intervalCount.interval !== 0) {
            // Convert an interval to tempo
            var theoreticalTempo = 60 / (intervalCount.interval / sampleRate);

            // Adjust the tempo to fit within the 90-180 BPM range
            while (theoreticalTempo < 90) theoreticalTempo *= 2;
            while (theoreticalTempo > 180) theoreticalTempo /= 2;

            theoreticalTempo = Math.round(theoreticalTempo);
            var foundTempo = tempoCounts.some(function (tempoCount) {
                if (tempoCount.tempo === theoreticalTempo)
                    return tempoCount.count += intervalCount.count;
            });
            if (!foundTempo) {
                tempoCounts.push({
                    tempo: theoreticalTempo,
                    count: intervalCount.count
                });
            }
        }
    });

    return tempoCounts;
}

export { audioCtx, setupWebaudio, playCurrentSound, pauseCurrentSound, loadSoundFile, setVolume, getVolume, analyserNode, actualBPM}