import { Drawable2DObject } from "./DrawableObject";

export class Triangle extends Drawable2DObject {

    static makeTriangle(){
        var points: [number, number, number][] = []
        var indices: [number, number, number][] = []
        points.push([0.5, 0, 0])
        points.push([0, 0.5, 0])
        points.push([0, 0, 0])
        indices.push([0, 1, 2])
        return {points, indices}
    }

    constructor(
        gl: WebGL2RenderingContext,
        shader: WebGLProgram,
    ) {
        var data = Triangle.makeTriangle();
        super(gl, data.points, data.indices, shader);
    }

}