void main()
{
    vec3 color = vec3(1.0, 0.7686, 0.0);
    float strength = distance(vec2(0.5), gl_PointCoord);
    strength = 1.0 - strength;
    strength = pow(strength, 10.0);

    // Final color 
    color = mix(vec3(0.0), color, strength);

    gl_FragColor = vec4(color, 1.0);
}