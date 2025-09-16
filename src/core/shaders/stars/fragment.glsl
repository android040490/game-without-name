uniform sampler2D uTexture;
uniform float uOpacity;

varying vec2 vUv;

void main()
{
    vec3 color = texture(uTexture, vUv).rgb;

    gl_FragColor = vec4(color, uOpacity);

    #include <tonemapping_fragment>
	#include <colorspace_fragment>
}