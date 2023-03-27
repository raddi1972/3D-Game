import { id_to_rgba, selectionShader } from "./app";
import { Camera } from "./Camera";
import { Drawable } from "./Drawable";

export class Plane extends Drawable {

    id: number

    static makePlane(n: number){
        var points: number[] = [];
        var indices: [number, number, number][] = [];
        var angle = 2*Math.PI/n;

        var initial_point = [0.0, 0.5];
        var temp = initial_point;

        // populating the points array
        points.push(0.0, 0.5, 0.0);
        for(let i=1;i<n;i++)
        {
            var x = Math.cos(angle)*temp[0] - Math.sin(angle)*temp[1];
            var y = Math.sin(angle)*temp[0] + Math.cos(angle)*temp[1];
            if(Math.abs(x)<1e-5){
                x=0;
            }
            if(Math.abs(y)<1e-5){
                y=0;
            }
            points.push(x, y, 0.0);
            temp = [x, y];            
        }

        // populating the indices array
        for(let i=0;i<n-2;i++)
        {
            indices.push([0, i+1, i+2]);
        }

        return {points, indices};
    }

    constructor(
        gl: WebGL2RenderingContext,
        n: number,
        id: number
    ) {
        var data = Plane.makePlane(n);
        super(gl);

        // Binding the Vertex Array. A vertex array stores the information about
        // the indices and vertex data together. It also stores the configuration
        // of the vertex attributes together.
        // So in the draw call we can just bind the VAO and all the data is bounded
        // automatically.
        
        // Vertex data setup
        this.addVertexData(gl, data.points.flat());
        this.addIndexData(gl, data.indices.flat());
        this.addAttribute(gl, 3, gl.FLOAT);
        this.id = id
    }

    draw(gl: WebGL2RenderingContext, shader: WebGLShader, camera: Camera): void {
        
        gl.bindVertexArray(this.VAO);
        gl.useProgram(shader);
        var modelUniform = gl.getUniformLocation(shader, 'model')
        var viewUniform = gl.getUniformLocation(shader, 'view')
        var projectionUniform = gl.getUniformLocation(shader, 'projection')
        gl.uniformMatrix4fv(modelUniform, false, this.getModelMatrix())
        gl.uniformMatrix4fv(viewUniform, false, camera.getView())
        gl.uniformMatrix4fv(projectionUniform, false, camera.projection)
        if(shader == selectionShader) {
            var color = gl.getUniformLocation(shader, 'selection')
            gl.uniform4fv(color, id_to_rgba(gl, this.id));
            // console.log(id_to_rgba(gl, this.id));
        } else {
            var color = gl.getUniformLocation(shader, 'color')
            gl.uniform4fv(color, this.color);
        }

        gl.drawElements(gl.TRIANGLES, this.drawSize, gl.UNSIGNED_SHORT, 0);
    }
}