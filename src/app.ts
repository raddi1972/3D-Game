import { Plane } from "./Plane";
import { createShader, createProgram } from "./Shader";
import { Model } from "./Model";
import { Camera } from "./Camera";
import { mat4, vec3, vec4 } from "gl-matrix";
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

export var selectionShader: WebGLProgram | null = null;
export var viewShader: WebGLProgram | null = null;


async function readShaderProgram(filename: string) {
    var file = await fetch(filename);
    var text: string = await file.text();
    return text;
}

async function getProgram(gl: WebGL2RenderingContext, vertexShaderPath: string, fragmentShaderPath: string) {
    var vertex = await readShaderProgram(vertexShaderPath)
    var fragment = await readShaderProgram(fragmentShaderPath)
    // console.log(vertex, fragment);
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex)
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment);

    if (!vertexShader || !fragmentShader) {
        throw Error('Shader Failure!');
    }

    return createProgram(gl, vertexShader, fragmentShader)!;

}

function getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX,
        y: canvas.height - evt.clientY
    };
}

export function rgba_to_id(gl: WebGL2RenderingContext, r: number, g: number, b: number, a: number) {
    var red_bits = gl.getParameter(gl.RED_BITS);
    var green_bits = gl.getParameter(gl.GREEN_BITS);
    var blue_bits = gl.getParameter(gl.BLUE_BITS);
    var alpha_bits = gl.getParameter(gl.ALPHA_BITS);
    var total_bits = red_bits + green_bits + blue_bits + alpha_bits;

    return (r * Math.pow(2, green_bits + blue_bits + alpha_bits)
        + g * Math.pow(2, blue_bits + alpha_bits)
        + b * Math.pow(2, alpha_bits)
        + a);
}

export function id_to_rgba(gl: WebGL2RenderingContext, id: number) {
    var red_bits = gl.getParameter(gl.RED_BITS);
    var green_bits = gl.getParameter(gl.GREEN_BITS);
    var blue_bits = gl.getParameter(gl.BLUE_BITS);
    var alpha_bits = gl.getParameter(gl.ALPHA_BITS);
    var total_bits = red_bits + green_bits + blue_bits + alpha_bits;

    var r, g, b, a;

    r = Math.floor(id / Math.pow(2, green_bits + blue_bits + alpha_bits));
    id = id - (r * Math.pow(2, green_bits + blue_bits + alpha_bits));

    g = Math.floor(id / Math.pow(2, blue_bits + alpha_bits));
    id = id - (g * Math.pow(2, blue_bits + alpha_bits));

    b = Math.floor(id / Math.pow(2, alpha_bits));
    id = id - (b * Math.pow(2, alpha_bits));

    a = id;

    return new Float32Array([r / (Math.pow(2, red_bits) - 1),
    g / (Math.pow(2, green_bits) - 1),
    b / (Math.pow(2, blue_bits) - 1),
    a / (Math.pow(2, alpha_bits) - 1)]);
}

async function main() {
    var gl = canvas.getContext("webgl2"); // get the glContext from the canvas

    if (!gl) {
        throw Error("Unable to create webgl context!");
    }

    resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);

    // model loading -> first reading the model from the static folder
    // to allow the models to be loaded the directory needs to be hosted on the 
    // local server using the live-server or any other method
    
    getProgram(gl, 'static/shaders/vertex.shader', 'static/shaders/fragment.shader').then((shad) => {
        viewShader = shad;
    })
    getProgram(gl, 'static/shaders/vertex.shader', 'static/shaders/selection.shader').then((shad) => {
        selectionShader = shad;
    })

    var model1 = new Model(gl, 'static/models/cube.obj', 2);
    var m = 4
    var n = 5
    var isLoaded = true
    var modelArr: Model[] = []
    var model1: Model

    for(var i=0;i<m;i++)
    {
        model1 = new Model(gl, 'static/models/lamp.obj', i+3);
        modelArr.push(model1);
        isLoaded = isLoaded && model1.loadData(gl);
    }

    var plane1 = new Plane(gl, n, 1);
    // plane1.addRotate(10, 0, 1, 0)
    var perspective = mat4.create()
    mat4.perspective(perspective, toRadians(60.0), (gl.canvas as HTMLCanvasElement).clientWidth / (gl.canvas as HTMLCanvasElement).clientHeight, 0.1, 100.0)
    var camera = new Camera(vec3.fromValues(0, 0, 4), vec3.create(), perspective);
    canvas.addEventListener('mousemove', (evt) => {

        // mouse coordinates ->
        var _mouse = getMousePos(canvas, evt);
        // reading from the color buffer i.e. reading the id
        if(selectionShader != null) {
            plane1.draw(gl!, selectionShader, camera);

            var pixels = new Uint8Array(4)
            gl?.readPixels(_mouse.x, _mouse.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

            var id = rgba_to_id(gl!, pixels[0], pixels[1], pixels[2], pixels[3]);

            if(id == plane1.id) {
                plane1.color = vec4.fromValues(0.5, 0.5, 0.5, 1);
            } else {
                plane1.color = vec4.fromValues(0, 0, 0, 1);
            }
            plane1.draw(gl!, viewShader!, camera);
        }

    })

    function draw() {
        gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);

        var polygonVertices = plane1.vertices;
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
                    modelArr[i].addScaling(0.3, 0.3, 0.3);
                    modelArr[i].addTranslation(polygonVertices[3 * i], polygonVertices[3 * i + 1], polygonVertices[3 * i + 2])
                    // modelArr[i].addRotate(100, 0, 1, 0);
                }
            }
        }
        else
        {
            if (viewShader != null)
                plane1.draw(gl!, viewShader, camera);
            for(var i=0;i<m;i++)
            {
                if (viewShader != null)
                    modelArr[i].draw(gl!, viewShader!, camera);
            }
        }
        window.requestAnimationFrame(draw);
    }

    window.requestAnimationFrame(draw);

}

main()