import { Square } from "./Triangle";
import { createShader, createProgram } from "./Shader";
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

function main() {
    var gl = canvas.getContext("webgl2"); // get the glContext from the canvas

    if (!gl) {
        throw Error("Unable to create webgl context!");
    }

    resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);



    var shader = getProgram(gl);
    var triangle = new Square(gl, shader)
    function draw() {
        triangle.draw(gl!);
        window.requestAnimationFrame(draw);
    }

    window.requestAnimationFrame(draw);

}

main();