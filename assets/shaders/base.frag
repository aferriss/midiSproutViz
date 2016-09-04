precision highp float;

// #pragma glslify: map = require(glsl-map)
// #pragma glslify: hsv2rgb = require(glsl-hsv2rgb);


uniform sampler2D tex0;
// uniform sampler2D to;
uniform float progress;
uniform vec2 resolution;
uniform float note;
uniform float cc;
varying vec2 vUv;

void main(){
	// vec3 col = hsv2rgb(vec3(note, 1.0 - note, cc));
	vec2 tc = gl_FragCoord.xy / resolution;
	// tc = floor(tc * ( 64.0)) / ( 64.0);
	vec4 tex = texture2D(tex0, vec2(vUv));
	gl_FragColor =tex;// vec4(tex,1.0);
}