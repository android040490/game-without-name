uniform float uProgress;

void main()
{
    vec3 color1 = vec3(0.9569, 0.8, 0.0196);
    vec3 color2 = vec3(0.102, 0.0549, 0.9451);
    // vec3 color2 = vec3(0.9843, 0.5059, 0.0549);
    vec3 color = mix(color1, color2, uProgress);
    float strength = distance(vec2(0.5), gl_PointCoord);
    strength = 1.0 - strength;
    strength = pow(strength, 10.0);

    // Final color 
    color = mix(vec3(0.0), color, strength);

    gl_FragColor = vec4(color, 1.0);
}