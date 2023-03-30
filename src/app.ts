import { Plane } from "./Plane";
import { createShader, createProgram } from "./Shader";
import { Model } from "./Model";
import { Camera } from "./Camera";
import { mat4, vec2, vec3, vec4 } from "gl-matrix";
import { toRadians } from "./Drawable";
import { Arrow } from "./Arrow";
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
var initialMousePosition: vec2| null = null


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

function generateDest(m: number, id:number, empty: number[]) {
    var temp = id;
    while(true)
    {
        temp = Math.floor(Math.random()*(m+2-2) + 2);
        if(temp!=id && !empty.includes(temp))
        {
            break;
        }
    }
    return temp;
}

function generateEmptyDest(empty: number[])
{
    var len = empty.length;
    return empty[Math.floor(Math.random()*len)];
}

function initialiseEmptyVertices(empty: number[], m:number, n:number){
    for(let i=m;i<n;i++)
    {
        empty.push(i+2);
    }
    return empty;
}

function dotProduct(vect_A:vec3, vect_B:vec3)
{

    let product = 0;

    // Loop for calculate dot product
    for (let i = 0; i < 3; i++)
        product = product + vect_A[i] * vect_B[i];
    return product;
}

function crossProduct(vect_A: vec3, vect_B: vec3)
{
    var cross_P: number[] = [];
    cross_P[0] = vect_A[1] * vect_B[2] - vect_A[2] * vect_B[1];
    cross_P[1] = vect_A[2] * vect_B[0] - vect_A[0] * vect_B[2];
    cross_P[2] = vect_A[0] * vect_B[1] - vect_A[1] * vect_B[0];
    return cross_P;
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
    var isCentered = false;
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

    var m = 4
    var n = 5
    var isLoaded = true
    var modelArr: Model[] = []
    var model1: Model

    for(var i=0;i<m;i++)
    {
        model1 = new Model(gl, 'static/models/lamp.obj', i+2);
        modelArr.push(model1);
        isLoaded = isLoaded && model1.loadData(gl);
    }

    var plane1 = new Plane(gl, n, 1);
    var perspective = mat4.create()
    mat4.perspective(perspective, toRadians(60.0), (gl.canvas as HTMLCanvasElement).clientWidth / (gl.canvas as HTMLCanvasElement).clientHeight, 0.1, 100.0)
    var cameraTop = new Camera(vec3.fromValues(0, 0, 3), vec3.fromValues(0, 0, 1), perspective, vec3.fromValues(0, 1, 0));
    var cameraCenter = new Camera(vec3.fromValues(0, 0, 0.1), vec3.fromValues(1, 1, 0), perspective, vec3.fromValues(0, 0, 1));
    var camera = cameraTop
    var polygonVertices = plane1.vertices;
    var emptyVertices = initialiseEmptyVertices([], m, n);

    var catcher: Model | null = null;

    var arrow1 : Arrow | null = null;
    var arrow2 : Arrow | null = null;
    var isDown = false;

    // When in 3D mode use the mousedown and mouseup to figure
    // out the vector and take its component along x axis.
    // Use this information to find out how much to rotate.

    canvas.addEventListener("mousedown", (evt) => {
        var _mouse = getMousePos(canvas, evt);
        if(isCentered) {
            initialMousePosition = vec2.fromValues(_mouse.x , _mouse.y)
        }
        else {
            var _mouse = getMousePos(canvas, evt);
            isDown = true;
            // reading from the color buffer i.e. reading the id
            if (selectionShader != null && catcher == null) {
                plane1.draw(gl!, selectionShader, camera);
                for (var i = 0; i < m; i++) {
                    if (viewShader != null)
                        modelArr[i].draw(gl!, selectionShader, camera);
                }

                var pixels = new Uint8Array(4)
                gl?.readPixels(_mouse.x, _mouse.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

                var id = rgba_to_id(gl!, pixels[0], pixels[1], pixels[2], pixels[3]);
                var dest: number, dest2: number;
                var direction: vec3|null = null, direction2: vec3|null = null;

                for (var i = 0; i < modelArr.length; i++) {
                    if (id == i + 2) {
                        catcher = modelArr[i];
                        catcher.color = vec4.fromValues(0.5, 0.5, 0.5, 1);
                        
                        // Generating destination for catcher
                        dest = generateDest(m, id, emptyVertices)-2;
                        arrow1 = new Arrow(gl!, 'static/models/new_arrow.obj', 100);
                        arrow1.color = vec4.fromValues(1, 0.0, 0.0, 1);
                        // console.log("catcher", catcher.id-2, "destination", dest);
                        direction = vec3.fromValues(polygonVertices[3*dest] - polygonVertices[3*(catcher.id-2)], polygonVertices[3*dest + 1] - polygonVertices[3*(catcher.id-2)+1], polygonVertices[3*dest+2] - polygonVertices[3*(catcher.id-2)+2]);
                        console.log(direction);
                        arrow1.setDirection(direction[0], direction[1]);
                        arrow1.setPosition(polygonVertices[3*(catcher.id-2)], polygonVertices[3*(catcher.id-2)+1], polygonVertices[3*(catcher.id-2)+2]);

                        // Generating new position for destination
                        dest2 = generateEmptyDest(emptyVertices) - 2; // generateDest(m, dest+2)-2;
                        arrow2 = new Arrow(gl!, 'static/models/new_arrow.obj', 100);
                        arrow2.color = vec4.fromValues(1, 0.0, 0.0, 1);
                        direction2 = vec3.fromValues(polygonVertices[3*dest2] - polygonVertices[3*(dest)], polygonVertices[3*dest2 + 1] - polygonVertices[3*(dest)+1], polygonVertices[3*dest2+2] - polygonVertices[3*(dest)+2]);
                        arrow2.setDirection(direction2[0], direction2[1]);
                        arrow2.setPosition(polygonVertices[3*(dest)], polygonVertices[3*(dest)+1], polygonVertices[3*(dest)+2]);

                        var index = emptyVertices.indexOf(dest2+2);
                        emptyVertices[index] = catcher.id;
                        console.log(emptyVertices);
                    }
                }

                canvas.addEventListener("mouseup", (evt3) => {
                    isDown=false;
                })

                canvas.addEventListener("mousemove", (evt2) => {
                    if(isDown)
                    {
                        var _newmouse = getMousePos(canvas, evt2);
                        var x = _newmouse.x - _mouse.x;
                        var y = _newmouse.y - _mouse.y;
                        var distance = (Math.sqrt(x*x + y*y))/500;
                        // console.log(polygonVertices[3*(catcher!.id-2)] + direction[0]*distance, polygonVertices[3*(catcher!.id-2)+1] + direction[1]*distance);
                        arrow1!.setPosition(polygonVertices[3*(catcher!.id-2)] + direction![0]*distance, polygonVertices[3*(catcher!.id-2)+1] + direction![1]*distance, 0);
                        modelArr[catcher!.id-2].purgeTranslation();
                        modelArr[catcher!.id-2].addTranslation(polygonVertices[3*(catcher!.id-2)] + direction![0]*distance, polygonVertices[3*(catcher!.id-2)+1] + direction![1]*distance, 0);
                        
                        arrow2!.setPosition(polygonVertices[3*(dest)] + direction2![0]*distance, polygonVertices[3*(dest)+1] + direction2![1]*distance, 0);
                        modelArr[dest].purgeTranslation();
                        modelArr[dest].addTranslation(polygonVertices[3*(dest)] + direction2![0]*distance, polygonVertices[3*(dest)+1] + direction2![1]*distance, 0);
                        // console.log(polygonVertices[3*(catcher!.id-2)] + direction[0]*distance - polygonVertices[3*dest]);
                        if(polygonVertices[3*(catcher!.id-2)] + direction![0]*distance - polygonVertices[3*dest] < 0.01 
                            && polygonVertices[3*(catcher!.id-2)+1] + direction![1]*distance - polygonVertices[3*dest + 1] < 0.01)
                            {
                                catcher!.color = vec4.fromValues(Math.random(),Math.random(),Math.random(),1);
                                
                                var temp = catcher!.id;
                                catcher!.id = modelArr[dest].id;
                                modelArr[dest].id = dest2;
                                
                                isDown = false;
                                arrow1 = null;
                                arrow2 = null;
                                direction = null;
                                direction2 = null;
                                catcher = null;
                                dest = -1;
                                dest2 = -1;
                                
                            }
                    }
                })

                plane1.draw(gl!, viewShader!, camera);
            }
        }
    })    

    canvas.addEventListener('mouseup', (evt) => {
        var _mouse = getMousePos(canvas, evt);
        if(isCentered && initialMousePosition != null) {
            var difference = vec2.sub(vec2.create(), vec2.fromValues(_mouse.x, _mouse.y), initialMousePosition);
            vec2.normalize(difference, difference);
            camera.rotateCamera(difference[0] * 10);
        }
        
    })

    // Now when you press v the camera angles change from 3D to drag mode
    document.onkeydown = (e) => {
        if (e.key == 'v') {
            isCentered = !isCentered;
        }

    }

    // canvas.addEventListener('mousemove', (evt) => {

    //     // mouse coordinates ->
        

    // })

    function draw() {
        if (viewShader != null) {

            if(isCentered) {
                camera = cameraCenter;
            } else {
                camera = cameraTop;
            }
            gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);
            if (arrow1!=null && arrow1.loadData(gl!)) {
                arrow1.draw(gl!, viewShader, camera);
            }
            if (arrow2!=null && arrow2.loadData(gl!)) {
                arrow2.draw(gl!, viewShader, camera);
            }
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
                        modelArr[i].addRotate(180, 0, 1, 0);
                        modelArr[i].addScaling(0.3, 0.3, 0.3);
                        modelArr[i].addTranslation(polygonVertices[3 * i], polygonVertices[3 * i + 1], polygonVertices[3 * i + 2])
                        modelArr[i].addFront(vec3.fromValues(0 - polygonVertices[3 * i], 0 - polygonVertices[3 * i + 1], 0 - polygonVertices[3 * i + 2]));
                        modelArr[i].addTranslation(0, 0, 0.2);
                    }
                }
            }
            else
            {
                plane1.draw(gl!, viewShader, camera);
                for(var i=0;i<m;i++)
                {
                    if(modelArr[i] != catcher)
                        modelArr[i].draw(gl!, viewShader!, camera);
                }
                catcher?.draw(gl!, viewShader, camera);
            }
        }       
        window.requestAnimationFrame(draw);
    }

    window.requestAnimationFrame(draw);

}

main()