// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;
// precision highp float;

// Getting a custom color as a uniform
uniform vec4 selection; 

// varying highp vec2 vTextureCoord;
// uniform sampler2D uSampler;

void main() {
    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting
    // gl_FragColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor = selection;
}