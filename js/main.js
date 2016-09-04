var tickRate = 33;
var shell = require('gl-now')({tickRate: tickRate});
shell.preventDefaults = false; //fixes agro game-shell bug
var drawScreen = require('a-big-triangle');
var createShader = require('gl-shader');
var createTexture = require('gl-texture2d');
var createFbo = require('gl-fbo');
var glslify = require('glslify');
var ndarray = require("ndarray");
var fill = require("ndarray-fill");

var gl;
var baseShader;
var reposShader;
var pixelateShader;
var sinShader;

var reposFbo, baseFbo, sinFbo;

var note = 0;
var cc = 0;
var prevCC = 0;
var prevNote = 0;
var time = 0;

Number.prototype.map = function ( in_min , in_max , out_min , out_max ) {
  return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
};

var midi, data;
// request MIDI access
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({
        sysex: false
    }).then(onMIDISuccess, onMIDIFailure);
} else {
    alert('No MIDI support in your browser.');
}

// midi functions
function onMIDISuccess(midiAccess) {
    // when we get a succesful response, run this code
    midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status

    var inputs = midi.inputs.values();
    // loop over all available inputs and listen for any MIDI input
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        // each time there is a midi message call the onMIDIMessage function
        input.value.onmidimessage = onMIDIMessage;
    }
}

function onMIDIFailure(error) {
    // when we get a failed response, run this code
    console.log('No access to MIDI devices or your browser doesnt support WebMIDI API. Please use WebMIDIAPIShim ' + error);
}

function onMIDIMessage(message) {
    data = message.data; // this gives us our [command/channel, note, velocity] data.
    // console.log('MIDI data', data); // MIDI data [144, 63, 73]
    // console.log(data);
    if(data[0] == 176){
		cc = data[2];
	}

	if (data[0] == 144) {
		note = data[1];
	};

	if(cc == undefined){
		cc = prevCC;
	}
	if(note == undefined){
		note = prevNote;
	}

}


shell.on('gl-init', function(){
	gl = shell.gl;

	gl.disable(gl.DEPTH_TEST);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);


	baseShader = createShader(gl, glslify('../assets/shaders/base.vert'), glslify('../assets/shaders/base.frag'));
	baseShader.attributes.position.location = 0;

	pixelateShader = createShader(gl, glslify('../assets/shaders/base.vert'), glslify('../assets/shaders/pixelate.frag'));
	pixelateShader.attributes.position.location = 0;

	reposShader = createShader(gl, glslify('../assets/shaders/base.vert'), glslify('../assets/shaders/repos.frag'));
	reposShader.attributes.position.location = 0;

	sinShader = createShader(gl, glslify('../assets/shaders/rotate.vert'), glslify('../assets/shaders/sin.frag'));
	sinShader.attributes.position.location = 0;

	
	baseFbo = createFbo(gl, [shell.width, shell.height]);
	reposFbo = createFbo(gl, [shell.width, shell.height]);
	sinFbo = createFbo(gl, [shell.width, shell.height]);

	baseFbo.color[0].magFilter = gl.LINEAR;
	baseFbo.color[0].minFilter = gl.LINEAR;

	reposFbo.color[0].magFilter = gl.LINEAR;
	reposFbo.color[0].minFilter = gl.LINEAR;

	sinFbo.color[0].magFilter = gl.LINEAR;
	sinFbo.color[0].minFilter = gl.LINEAR;

	var initial_conditions = ndarray(new Uint8Array(shell.width*shell.height*4), [shell.width, shell.height, 4])
  fill(initial_conditions, function(x,y,c) {
    if(c === 3) {
      return 255
    }
    return Math.floor(Math.random()*255);
  });
  console.log(initial_conditions);
  sinFbo.color[0].setPixels(initial_conditions)
  baseFbo.color[0].setPixels(initial_conditions)
});

//render to framebuffers...
shell.on('tick', function(){
	reposFbo.bind();
		reposShader.bind();
		reposShader.uniforms.resolution = [shell.width, shell.height];
		reposShader.uniforms.tex0 = baseFbo.color[0].bind(0); 
		reposShader.uniforms.tex1 = sinFbo.color[0].bind(1);
		reposShader.uniforms.amt = [10.0/ shell.width,10.0 / shell.height];
		reposShader.uniforms.note = cc.map(0,127,0.985,1.01);
		reposShader.uniforms.note2 = note.map(0,127,0.00001,0.01);
		reposShader.uniforms.cc = cc;
		drawScreen(gl);

	baseFbo.bind();
		baseShader.bind();
		baseShader.uniforms.tex0 = reposFbo.color[0].bind();
		baseShader.uniforms.resolution = [shell.width, shell.height];
		drawScreen(gl);


	sinFbo.bind();
		pixelateShader.bind();
		pixelateShader.uniforms.tex0 = baseFbo.color[0].bind();
		pixelateShader.uniforms.resolution = [shell.width, shell.height];
		pixelateShader.uniforms.note = note.map(0,127,0,1);
		pixelateShader.uniforms.cc = cc.map(0,127,50.0,5.0);
		pixelateShader.uniforms.time = time*0.01;
		pixelateShader.uniforms.cut = cc.map(0,127,0,1);
			drawScreen(gl);
		time++;
});

//render to screen...
shell.on('gl-render', function(){
	prevCC = cc;
	prevNote = note;
	console.log(cc);
	

	sinShader.bind();
		sinShader.uniforms.tex0 = reposFbo.color[0].bind();
		sinShader.uniforms.resolution = [shell.width, shell.height];
		sinShader.uniforms.cut = cc.map(0,127,1,10);
		sinShader.uniforms.spin = cc.map(0,127,1.5,0.0);
		sinShader.uniforms.time = time*0.001;
		drawScreen(gl);
	// reposShader.bind();
	// reposShader.uniforms.tex0 = baseFbo.color[0].bind(); 
	// reposShader.uniforms.resolution = [shell.width, shell.height];
	// // reposShader.uniforms.tex1 = baseFbo.color[0].bind(1);
	// reposShader.uniforms.amt = [1.0,1.0];
	// reposShader.uniforms.note = note;
	// reposShader.uniforms.cc = cc;

	// drawScreen(gl);
});