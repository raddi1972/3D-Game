import * as objLoader from "webgl-obj-loader"
import { mat4, vec3 } from "gl-matrix";

function toRadians(angle: number) {
    return (angle * Math.PI) / 180
}

export class Model {
    meshData: objLoader.Mesh | null
    vao: WebGLVertexArrayObject | null;
    vbo: WebGLBuffer | null;
    ebo: WebGLBuffer | null;
    model: mat4
    view: mat4
    projection: mat4
    constructor(gl: WebGL2RenderingContext, filename: string) {
        this.meshData = null;

        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        this.model = mat4.create()
        this.view = mat4.create()
        mat4.translate(this.view, this.view, vec3.fromValues(0.0, 0.0, -3.0))
        this.projection = mat4.create()
        mat4.perspective(this.projection, toRadians(45.0), gl.canvas.width / gl.canvas.height, 0.1, 100.0)

        fetch(filename).then(async (response) => {
            const text = await response.text()
            this.meshData = new objLoader.Mesh(text);
        })
    }
    loadData(gl: WebGL2RenderingContext) : boolean {
        if (this.meshData == null)
          return false

        this.model = mat4.create()
        this.view = mat4.create()
        mat4.translate(this.view, this.view, vec3.fromValues(0.0, 0.0, -5.0))
        this.projection = mat4.create()
        mat4.perspective(this.projection, toRadians(45.0), gl.canvas.width / gl.canvas.height, 0.1, 100.0)

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.meshData.vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.meshData.indices),
            gl.STATIC_DRAW
        );

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(
            0, 3, gl.FLOAT, false, 0, 0
        );

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return true;
    }

    draw(gl: WebGL2RenderingContext, shader: WebGLShader) {
        var modelUniform = gl.getUniformLocation(shader, 'model')
        var viewUniform = gl.getUniformLocation(shader, 'view')
        var projectionUniform = gl.getUniformLocation(shader, 'projection')
        mat4.rotateX(this.model, this.model, toRadians(1))
        mat4.rotateY(this.model, this.model, toRadians(1))
        gl.useProgram(shader);
        gl.uniformMatrix4fv(modelUniform, false, this.model)
        gl.uniformMatrix4fv(viewUniform, false, this.view)
        gl.uniformMatrix4fv(projectionUniform, false, this.projection)

        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.meshData!.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}