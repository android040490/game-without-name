uniform float uTime;
uniform float uIntensity;
varying vec2 vUv;

void main()
{
    float dist = distance(vUv, vec2(0.5));
    dist = pow(dist, 1.8);

    float vignette = smoothstep(0.0, 0.4, dist);

    vec3 color = vec3(1.0, 0.0, 0.0);
    float pulse = 0.6 + 0.4 * sin(uTime * 10.0);
    float alpha = uIntensity * vignette * pulse;
    gl_FragColor = vec4(color, alpha);
}