uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

attribute float aSize;

float remap(float value, float inputMin, float inputMax, float outputMin, float outputMax)
{
    return outputMin + (outputMax - outputMin) * (value - inputMin) / (inputMax - inputMin);
}

void main()
{
    float progress = uProgress;
    vec3 newPosition = position;

    // Explosion
    float explodingProgress = remap(uProgress, 0.0, 1.0, 0.0, 1.0);
    explodingProgress = clamp(explodingProgress, 0.0, 1.0);
    explodingProgress = 1.0 - pow(1.0 - explodingProgress, 3.0);
    newPosition *= explodingProgress;

     // Scaling
    float sizeOpeningProgress = remap(progress, 0.0, 0.125, 0.0, 1.0);
    float sizeClosingProgress = remap(progress, 0.125, 1.0, 1.0, 0.0);
    float sizeProgress = min(sizeOpeningProgress, sizeClosingProgress);

    // Final position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;

    gl_Position = projectionMatrix * viewPosition;

    // Final size
    gl_PointSize = uSize * aSize * sizeProgress * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);
}