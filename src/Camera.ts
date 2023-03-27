import { mat4, vec3, vec4 } from "gl-matrix";

export class Camera {

    position: vec3
    direction: vec3
    projection: mat4

    constructor(position:vec3 , direction: vec3, projection: mat4) {
        this.position = position;
        this.direction = direction;
        this.projection = projection;
    }

    getView() {
        var view = mat4.create()
        mat4.translate(view, view, vec3.fromValues(0.0, 0.0, -2.0))
        return view
    }

    invertMouse(x: number, y: number) {
        var output = mat4.mul(mat4.create(), this.projection, this.getView());
        var _viewport = vec4.fromValues(x, y, 0, 0);
        return vec4.transformMat4(_viewport, _viewport, output);
    }

}
