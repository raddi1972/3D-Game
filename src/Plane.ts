import { mat3, mat4, vec2, vec3 } from "gl-matrix";
import { Drawable2DObject } from "./DrawableObject";

export class Plane extends Drawable2DObject {

    static makePlane(n: number){
        var points: number[] = [];
        var indices: [number, number, number][] = [];
        var angle = 2*Math.PI/n;

        var initial_point = [0.0, 0.5];
        var temp = initial_point;

        // populating the points array
        points.push(0.0, 0.5, -1.0, 1.0, 1.0);
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
            points.push(x, y, -1.0, 1.0, 1.0);
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
        shader: WebGLProgram,
        n: number,
    ) {
        var data = Plane.makePlane(n);
        super(gl, data.points, data.indices, shader);
    }
}