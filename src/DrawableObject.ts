export abstract class Drawable2DObject {

    points: [number, number, number][]
    indices: [number, number, number][]
    vao: WebGLVertexArrayObject| null;
    vbo: WebGLBuffer | null;
    ebo: WebGLBuffer | null;
    shader: WebGLProgram


    constructor(gl: WebGL2RenderingContext, points: [number, number, number][], indices: [number, number, number][], shader: WebGLProgram) {
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        this.points = points;
        this.indices = indices;

        this.shader = shader;

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.points.flat()), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.indices.flat()),
            gl.STATIC_DRAW
        );
        
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(
            0, 2, gl.FLOAT, false, 0, 0
        );

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    draw(gl: WebGL2RenderingContext) {
        gl.useProgram(this.shader);
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.indices.flat().length, gl.UNSIGNED_SHORT, 0);
    }

}