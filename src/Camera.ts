import { mat4, vec3, vec4 } from "gl-matrix";

export class Camera {

    position: vec3
    direction: vec3
    projection: mat4
    up: vec3

    constructor(position:vec3 , direction: vec3, projection: mat4, up: vec3) {
        this.position = position;
        this.direction = direction;
        this.projection = projection;
        this.up = up
    }

    getView() {
        var view = mat4.lookAt(mat4.create(), this.position, vec3.subtract(vec3.create(), this.position, this.direction), this.up)
        return view
    }

    invertMouse(x: number, y: number) {
        var output = mat4.mul(mat4.create(), this.projection, this.getView());
        var _viewport = vec4.fromValues(x, y, 0, 0);
        return vec4.transformMat4(_viewport, _viewport, output);
    }

}
