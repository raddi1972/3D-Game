import { Drawable } from "./Drawable";

export class Stage extends Drawable {
    children: Drawable[]


    constructor(
        gl: WebGL2RenderingContext,
        shader: WebGLProgram,
    ) {
        super(gl);
        this.children = []
    }

    createData(n: number, m: number) {

    }

    addChildren(child: Drawable) {
        this.children.push(child);
    }

    draw(gl: WebGL2RenderingContext, shader: WebGLShader): void {
        
    }

}