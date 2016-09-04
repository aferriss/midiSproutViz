precision highp float;

//setup for 2 texture
varying vec2 vUv;
varying vec2 uv;
//varying vec2 texdim0;
//varying vec2 texdim1;
uniform vec2 amt;
//uniform vec4 scale;
//uniform vec4 bias;
//uniform vec2 boundmode;
uniform sampler2D tex0;
uniform sampler2D tex1;
uniform float time;
uniform float note;
uniform float note2;
uniform float cc;
uniform float resolution;

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



void main()
{
	vec2 tc = uv;
	tc.y *= note;
	tc.x *= note;
	// tc = floor(tc * ( 128.0)) / ( 128.0);
	tc = vec2(0.0,1.0) + vec2(0.5,-0.5) * (tc + 1.0);


	// tc.y = 1.0 - tc.y;
	// tc.x = 1.0 - tc.x;
    // vec2 scale = vec2(1.0,1.0);
    // vec2 bias = vec2(1.0,1.0);	
	// vec2 tc = gl_FragCoord.xy / resolution;
    vec4 look = texture2D(tex1,tc);//sample repos texture
    vec2 offs = vec2(look.x-look.y,look.z-look.x)*amt;
    vec2 coord = offs + tc;	//relative coordinates
    
    vec4 repos = texture2D(tex0,coord);
    
    vec3 hsv = rgb2hsv(repos.rgb);

    hsv.r += note2;
    hsv.r = mod(hsv.r, 1.0);
    
    hsv.g += 0.0005;
    hsv.g = mod(hsv.g, 1.0);
    
    hsv.b += 0.005;
    hsv.b = mod(hsv.b, 1.0);
    
    vec3 rgb = hsv2rgb(hsv);
    
    gl_FragColor = vec4(rgb, 1.0);//vec4(rgb,1.0);//*scale+bias;
      
}