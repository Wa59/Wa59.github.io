// Display options:

const CANVAS_WIDTH  = 400//1920;
const CANVAS_HEIGHT = 600//1080;
const FRAME_RATE    = 20;

let settings = {
	size:          1024,
	energy:        -0,
	median:        0.001,
	sigma:         0.5,
	timeStep:      1E-6,
	stepsPerFrame: 20,
	maxFrames:     1000,
	potential:     x => 20000000*x,
	label:         'Potencial linear',
	momentumZoom:  1,
	scaleFactor:   1,
	underlay:      null,
	imageFile:     null
};

let quantumParticle;

function setup() {
	frameRate(FRAME_RATE);
	createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
	settings.underlay = createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT);
	background(0);
	
	quantumParticle = new Schroedinger(settings);
}

// Draw loop:

function draw() {
	quantumParticle.simulationStep();
}
