varying vec2 vUv;
void main()
{
    vUv = uv;
    vec2 clip = uv * 2.0 - 1.0;
    gl_Position = vec4(clip, 0.0, 1.0);
}