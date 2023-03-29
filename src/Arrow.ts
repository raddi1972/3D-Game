import { vec2, vec3 } from "gl-matrix";
import { Model } from "./Model";

export class Arrow extends Model {

    origin: vec3
    direction: vec2

    constructor(
        gl: WebGL2RenderingContext, 
        filename: string,
        id: number
    ) {
        super(gl, filename, id);
        this.addScaling(0.3, 0.3, 0.3);
        this.origin = vec3.fromValues(0, 0, 0);
        this.direction = vec2.fromValues(0, 0);
        this.addRotate(-90, 0, 0, 1);
    }

    setPosition(x: number, y: number, z: number) {
        this.purgeTranslation();
        this.addTranslation(x, y, z);
    }

    setDirection(x: number,y: number) {
        this.purgeRotation();
        this.addRotate(-90, 0, 0, 1);
        var angle = Math.acos(vec2.normalize(vec2.create(), vec2.fromValues(x, y))[0])
        if (y < 0)
          angle = - angle;
        this.addRotate(180 * (angle/Math.PI), 0, 0, 1);
    }
}