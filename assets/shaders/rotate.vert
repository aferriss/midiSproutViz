attribute vec2 position;

varying vec2 vUv;
varying vec2 uv;

uniform float spin;
uniform float time;

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
	gl_Position = vec4(position,0.0, 1.0) * rotationMatrix(vec3(0.0,0.0,1.0), time * spin);
	// vUv = position;
	// uv = vec2(0.0,1.0) + vec2(0.5,-0.5) * (position + 1.0);
	vUv = position *vec2(0.5,-0.5) + 0.5;
	uv = position;
}