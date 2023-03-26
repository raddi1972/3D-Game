import { mat4, vec3 } from "gl-matrix";

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
        mat4.translate(view, view, vec3.fromValues(0.0, 0.0, -5.0))
        return view
    }

}
