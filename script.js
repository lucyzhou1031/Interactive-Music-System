let midiAccess = null;
let output = null;
let isPlaying = false;
let intervalId = null;

let beatDuration = 0.5;
let velocity = 90;
let articulation = 1;

const lhHeap = ['G3', 'E4', 'F4'];
const rhHeap = ['G4', 'B4', 'C5', 'D5'];

let lhPat = [...lhHeap];
let rhPat = [...rhHeap];
let lhCnt = 0, rhCnt = 0;
let lhPrev = null, rhPrev = null;

const midiNote = {
    G3: 43, E4: 52, F4: 53, G4: 55, B4: 59, C5: 60, D5: 62
};

function selectPitch() {
    const lhw = 1 + lhCnt * lhCnt;
    const rhw = 1 + rhCnt * rhCnt;
    const threshold = lhw / (lhw + rhw);

    if (Math.random() > threshold) {
        lhCnt++;
        let pitch;
        do {
            pitch = lhPat.shift();
            if (!lhPat.length) lhPat = [...lhHeap];
        } while (pitch === lhPrev);
        lhPrev = pitch;
        return pitch;
    } else {
        rhCnt++;
        let pitch;
        do {
            pitch = rhPat.shift();
            if (!rhPat.length) rhPat = [...rhHeap];
        } while (pitch === rhPrev);
        rhPrev = pitch;
        return pitch;
    }
}

function playNote() {
    const pitch = selectPitch();
    const midiPitch = midiNote[pitch];

    output.send([0x90, midiPitch, velocity]);
    setTimeout(() => output.send([0x80, midiPitch, velocity]), beatDuration * articulation * 1000);
}

function startPlayback() {
    if (!isPlaying) {
        intervalId = setInterval(playNote, beatDuration * 1000);
        isPlaying = true;
    }
}

function stopPlayback() {
    if (isPlaying) {
        clearInterval(intervalId);
        isPlaying = false;
    }
}

document.getElementById('startStop').addEventListener('click', () => {
    if (isPlaying) {
        stopPlayback();
        document.getElementById('startStop').innerText = 'Start';
    } else {
        startPlayback();
        document.getElementById('startStop').innerText = 'Stop';
    }
});

document.getElementById('beatDuration').addEventListener('input', (e) => {
    beatDuration = parseFloat(e.target.value);
});

document.getElementById('velocity').addEventListener('input', (e) => {
    velocity = parseInt(e.target.value);
});

document.getElementById('articulation').addEventListener('input', (e) => {
    articulation = parseFloat(e.target.value);
});

document.querySelectorAll('.pitchSet').forEach(button => {
    button.addEventListener('click', (e) => {
        lhHeap.splice(0, lhHeap.length, ...e.target.dataset.lh.split(','));
        rhHeap.splice(0, rhHeap.length, ...e.target.dataset.rh.split(','));
    });
});

document.querySelectorAll('.timbre').forEach(button => {
    button.addEventListener('click', (e) => {
        const program = parseInt(e.target.dataset.program);
        output.send([0xC0, program]);
    });
});

navigator.requestMIDIAccess().then((access) => {
    midiAccess = access;
    output = Array.from(midiAccess.outputs.values())[0];
    console.log('MIDI ready.');
}).catch(err => console.error('MIDI not supported:', err));
