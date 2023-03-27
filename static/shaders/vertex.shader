// an attribute will receive data from a buffer
attribute vec3 a_position;
// attribute vec2 a_tex_coordinates;
uniform mat4 model;    
uniform mat4 view;    
uniform mat4 projection;    
// all shaders have a main function

// varying highp vec2 vTextureCoord;
void main() {

    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = projection * view * model * vec4(a_position, 1.0);
    // vTextureCoord = a_tex_coordinates;
}