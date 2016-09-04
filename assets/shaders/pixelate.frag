precision highp float;

#pragma glslify: map = require(glsl-map)
// #pragma glslify: hsv2rgb = require(glsl-hsv2rgb);


uniform sampler2D tex0;
// uniform sampler2D to;
uniform float progress;
uniform vec2 resolution;
uniform float note;
uniform float cc;
varying vec2 vUv;
uniform float time;
uniform float cut;

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 2.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(( (q.z + (q.w - q.y) / (6.0 * d + e))) ), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


void main(){
	// vec3 col = hsv2rgb(vec3(note, 1.0 - note, cc));
	// float pixelSize = (cc, 0.0,1.0,4.0,124.0);
	vec2 tc = gl_FragCoord.xy;// / resolution;
	vec2 tc1 = tc;
	vec2 tc2 = tc;
	tc1.x = clamp(tc.x, cut, resolution.x / 2.0);
	tc2.x = clamp(tc.x, resolution.x / 2.0, resolution.x - cut);

	vec2 finalTc;
	if(gl_FragCoord.x < resolution.x / 2.0){
		finalTc.x = tc1.x;
	} else {
		finalTc.x = tc2.x;
	}

	// finalTc.x = tc1.x;
	finalTc.y = tc.y;

	finalTc /= resolution;

	finalTc.x = tc.x;//floor(finalTc.x * cut) / cut;
	// finalTc = finalTc + vec2(0.0,sin(time + finalTc.y*cc)*0.15);
	// tc = floor(tc *  cc) /  cc;
	vec2 modCoord = finalTc ;//+ vec2(0.0,sin(time + finalTc.x*cc)*0.15);
	vec4 tex = texture2D(tex0, vec2(modCoord));

	vec3 hsb = rgb2hsv(tex.rgb);
	hsb.r += note;

	vec3 col = hsv2rgb(hsb);
	gl_FragColor =vec4(col, 1.0);// vec4(tex,1.0);

}