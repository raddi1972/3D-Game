import * as objLoader from "webgl-obj-loader"
import { mat4, vec3, vec4 } from "gl-matrix";
import { Drawable } from "./Drawable";
import { Camera } from "./Camera";
import { id_to_rgba, selectionShader } from "./app";

function toRadians(angle: number) {
    return (angle * Math.PI) / 180
}

export class Model extends Drawable {
    meshData: objLoader.Mesh | null
    id: number
    constructor(gl: WebGL2RenderingContext, filename: string, id: number) {
        super(gl);
        this.meshData = null;
        this.id = id;
        this.color = vec4.fromValues(0.6, 0.7, 0.3, 1);

        fetch(filename).then(async (response) => {
            const text = await response.text()
            this.meshData = new objLoader.Mesh(text);
        })
    }
    loadData(gl: WebGL2RenderingContext) : boolean {
        if (this.meshData == null)
          return false

        this.addVertexData(gl, this.meshData.vertices);
        this.addIndexData(gl, this.meshData.indices)
        this.addAttribute(gl, 3, gl.FLOAT);
        return true;
    }

    draw(gl: WebGL2RenderingContext, shader: WebGLShader, camera: Camera) {
        gl.useProgram(shader);
        gl.bindVertexArray(this.VAO);
        var modelUniform = gl.getUniformLocation(shader, 'model')
        var viewUniform = gl.getUniformLocation(shader, 'view')
        var projectionUniform = gl.getUniformLocation(shader, 'projection')
        gl.uniformMatrix4fv(modelUniform, false, this.getModelMatrix())
        gl.uniformMatrix4fv(viewUniform, false, camera.getView())
        gl.uniformMatrix4fv(projectionUniform, false, camera.projection)
        if (shader == selectionShader) {
            var color = gl.getUniformLocation(shader, 'selection')
            gl.uniform4fv(color, id_to_rgba(gl, this.id));
        } else {
            var color = gl.getUniformLocation(shader, 'color')
            gl.uniform4f(color, this.color[0], this.color[1], this.color[2], this.color[3])
        }

        gl.drawElements(gl.TRIANGLES, this.drawSize, gl.UNSIGNED_SHORT, 0);
    }
}