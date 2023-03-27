import { Plane } from "./Plane";
import { createShader, createProgram } from "./Shader";
import { Model } from "./Model";
import { Camera } from "./Camera";
import { mat4, vec3 } from "gl-matrix";
import { toRadians } from "./Drawable";
export var canvas = <HTMLCanvasElement>document.querySelector("#c"); // Get the canvas

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    const needResize = canvas.width !== displayWidth ||
        canvas.height !== displayHeight;

    if (needResize) {
        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }

    return needResize;
}

function getProgram(gl: WebGL2RenderingContext) {
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, (<HTMLScriptElement>document.querySelector('#vertex-shader-2d')).text)
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, (<HTMLScriptElement>document.querySelector('#fragment-shader-2d')).text)

    if (!vertexShader || !fragmentShader) {
        throw Error('Shader Failure!');
    }

    return createProgram(gl, vertexShader, fragmentShader)!;

}

async function main() {
    var gl = canvas.getContext("webgl2"); // get the glContext from the canvas

    if (!gl) {
        throw Error("Unable to create webgl context!");
    }

    resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // model loading -> first reading the model from the static folder
    // to allow the models to be loaded the directory needs to be hosted on the 
    // local server using the live-server or any other method
    
    var shader = getProgram(gl);

    var m = 4
    var n = 5
    var isLoaded = true
    var modelArr: Model[] = []
    var model1: Model

    for(var i=0;i<m;i++)
    {
        model1 = new Model(gl, 'static/models/lamp.obj');
        modelArr.push(model1);
        isLoaded = isLoaded && model1.loadData(gl);
    }

    var plane1 = new Plane(gl, n);
    var perspective = mat4.create()
    mat4.perspective(perspective, toRadians(45.0), gl.canvas.width / gl.canvas.height, 0.1, 100.0)
    var camera = new Camera(vec3.create(), vec3.create(), perspective);

    var polygonVertices = plane1.vertices;
    
    function draw() {
        if(!isLoaded)
        {
            isLoaded=true;
            for(var i=0;i<m;i++)
            {
                isLoaded = isLoaded && modelArr[i].loadData(gl!);
            }
            if(isLoaded)
            {
                for(var i=0;i<m;i++)
                {
                    mat4.translate(modelArr[i].model, modelArr[i].model, vec3.fromValues(polygonVertices[3*i], polygonVertices[3*i+1], polygonVertices[3*i+2]));
                    mat4.scale(modelArr[i].model, modelArr[i].model, vec3.fromValues(0.3, 0.3, 0.3));
                }
            }
        }
        else
        {
            plane1.draw(gl!, shader, camera);
            for(var i=0;i<m;i++)
            {
                modelArr[i].draw(gl!, shader);
            }
        }
        window.requestAnimationFrame(draw);
    }

    window.requestAnimationFrame(draw);

}

main()