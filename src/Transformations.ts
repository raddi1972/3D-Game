import { mat4, quat, vec3 } from "gl-matrix";
import { toRadians } from "./Drawable";

export interface Transform {

    applyTransform(matrix : mat4): void

}

export class Scale implements Transform {
    scaler: vec3

    constructor(x: number, y: number, z: number) {
        this.scaler = vec3.fromValues(x, y, z);
    }

    applyTransform(matrix: mat4): void {
        mat4.scale(matrix, matrix, this.scaler);
    }

}

export class Translate implements Transform {
    translate: vec3

    constructor(x: number, y: number, z: number) {
        this.translate = vec3.fromValues(x, y, z);
    }

    applyTransform(matrix: mat4): void {
        mat4.translate(matrix, matrix, this.translate);
    }
}

export class Rotate implements Transform {
    angle: number
    axis: vec3

    constructor(angle: number, x: number, y: number, z: number) {
        this.angle = angle;
        this.axis = vec3.fromValues(x, y, z);
    }

    applyTransform(matrix: mat4): void {
        var q = quat.create()
        quat.setAxisAngle(q, this.axis, toRadians(this.angle))
        var quatMat = mat4.fromQuat(mat4.create(), q)
        mat4.multiply(matrix, matrix, quatMat);
    }
}
