import { Drawable2DObject } from "./DrawableObject";

export class Square extends Drawable2DObject {

    static makeSquare(){
        var points: number[] = [
            0.5, 0.5, -1.0, 1.0, 1.0,
            0.5, -0.5, 0.0, 1.0, 0.0,
            -0.5, 0.5, -1.0, 0.0, 1.0,
            -0.5, -0.5, 0.0, 0.0, 0.0
        ]
        var indices: [number, number, number][] = []
        indices.push([0, 1, 2])
        indices.push([1, 2, 3])
        return {points, indices}
    }

    constructor(
        gl: WebGL2RenderingContext,
        shader: WebGLProgram,
    ) {
        var data = Square.makeSquare();
        super(gl, data.points, data.indices, shader);
    }

}