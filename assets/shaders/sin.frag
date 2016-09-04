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


float colormap_red(float x) {
    return 1.61361058036781E+00 * x - 1.55391688559828E+02;
}

float colormap_green(float x) {
    return 9.99817607003891E-01 * x + 1.01544260700389E+00;
}

float colormap_blue(float x) {
    return 3.44167852062589E+00 * x - 6.19885917496444E+02;
}

vec4 colormap(float x) {
    float t = x * 255.0;
    float r = clamp(colormap_red(t) / 255.0, 0.0, 1.0);
    float g = clamp(colormap_green(t) / 255.0, 0.0, 1.0);
    float b = clamp(colormap_blue(t) / 255.0, 0.0, 1.0);
    return vec4(r, g, b, 1.0);
}

float luma(vec3 color) {
  return dot(color.rgb, vec3(0.299, 0.587, 0.114));
}


mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

void main(){
	// vec3 col = hsv2rgb(vec3(note, 1.0 - note, cc));
	// float pixelSize = (cc, 0.0,1.0,4.0,124.0);
	vec2 tc = vUv;//gl_FragCoord.xy / resolution;
	tc.y = 1.0 - tc.y;
	// vec2 tc1 = tc;
	// vec2 tc2 = tc;
	// tc1.x = clamp(tc.x, cut, resolution.x / 2.0);
	// tc2.x = clamp(tc.x, resolution.x / 2.0, resolution.x - cut);

	// vec2 finalTc;
	// if(gl_FragCoord.x < resolution.x / 2.0){
	// 	finalTc.x = tc1.x;
	// } else {
	// 	finalTc.x = tc2.x;
	// }

	// finalTc.x = tc1.x;
	// finalTc.y = tc.y;

	// finalTc /= resolution;

	// finalTc.x = floor(finalTc.x * cut) / cut;
	// finalTc = finalTc + vec2(0.0,sin(time + finalTc.y*cc)*0.15);
	// tc = floor(tc *  cc) /  cc;
	vec2 modCoord = tc ;//+ vec2(0.0,sin(time*10.0 + tc.y*cut)*(1.0/cut));
	float sin_factor = sin(time * cut);
    float cos_factor = cos(time * cut);
	// modCoord = vec2(modCoord.x - (0.5 * resolution.x / resolution.y), modCoord.y - 0.5) * mat2(cos_factor, sin_factor, -sin_factor, cos_factor);
	// modCoord += 0.75;
	vec4 tex = texture2D(tex0, vec2(modCoord) );//* rotationMatrix(vec3(0.0,0.0,1.0), time * cut));

	vec3 hsb = rgb2hsv(tex.rgb);
	hsb.r += note;

	vec3 col = hsv2rgb(hsb);
	gl_FragColor = vec4(col, 1.0);//colormap(luma(col));//vec4(col, 1.0);// vec4(tex,1.0);

}