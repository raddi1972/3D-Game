import { mat4, vec3 } from "gl-matrix";
import { Camera } from "./Camera";

export function toRadians(angle: number) {
    return (angle * Math.PI) / 180
}

function getTypeSize(type: number) {
    if(type = WebGL2RenderingContext.FLOAT) {
        return 4
    }
    return 4
}

function setTextureParameters(gl: WebGL2RenderingContext) {

    /* 
    These 2 parameters are for when we specify the texture range outside of (0, 1) at the edges.
    Then these help to determine what will be the action, if we specify repeat then opengl will start to repeat the textures
    */
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    /* 
    This is for what will happen if we are interpolating the high resolution image to the lower dimension. So what kind of 
    filtering will take place. The second option tells what we will do when we are scaling up
    */
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}

function loadTexture(gl: WebGL2RenderingContext, url: string) {
    // Creating a new texture buffer to store the texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    /*
      level : the level of detail. level 0 is the base image level and n is the n-th mipmap reduction level
      internalformat : specifying the color components in the texture
      width, height : specifies the widht and the height of the texture
      border : The border width. must be 0?
      type : data type of the texels
      pixels : pixel source for the texture -> in the below call the pixel is a opaque blue object as the image might take time to load
      from the internet
    */

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
    const image = new Image();
    image.crossOrigin = "anonymous"
    image.src = url;
    image.onload = ()=>{ // So after the image has been loaded
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D, 
            0, 
            gl.RGB, 
            gl.RGB, 
            gl.UNSIGNED_BYTE, 
            image  // Now we add the image instead of the opaque blue
        );
        setTextureParameters(gl);
        gl.generateMipmap(gl.TEXTURE_2D);
        
    }
    // Adding the image url
    return texture;
}

export abstract class Drawable {
    VAO: WebGLVertexArrayObject | null
    VBO: WebGLBuffer | null
    EBO: WebGLBuffer | null
    drawSize = 0
    model: mat4
    attribValue: number = 0
    stride: number = 0
    offset: number = 0
    vertices: number[] = []
    
    constructor(gl: WebGL2RenderingContext) {
        // These 3 properties are common across everywhere thus we instantiate in the super class
        this.VAO = gl.createVertexArray();
        this.VBO = gl.createBuffer();
        this.EBO = gl.createBuffer();

        // model matrix is the property of the object itself thus including it here
        // view and projection matrices are global property
        // view, projection are used with camera
        this.model = mat4.create();
    }

    abstract draw(gl: WebGL2RenderingContext, shader: WebGLShader, camera: Camera): void

    protected addVertexData(gl: WebGL2RenderingContext, vertexData :number[]) {
        gl.bindVertexArray(this.VAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(vertexData),
            gl.STATIC_DRAW
        )
    }

    protected addIndexData(gl: WebGL2RenderingContext, indexData: number[])
    {
        gl.bindVertexArray(this.VAO);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.EBO);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indexData),
            gl.STATIC_DRAW
        );
        this.drawSize = indexData.length;
    }


    protected addAttribute(gl: WebGL2RenderingContext, size: number, type: number) {
        gl.bindVertexArray(this.VAO);
        this.stride += getTypeSize(type) * size
        gl.vertexAttribPointer(this.attribValue, size, gl.FLOAT, false, this.stride, this.offset);
        gl.enableVertexAttribArray(this.attribValue);
        this.attribValue++;
        this.offset = this.stride;
    }

    // constructor(gl: WebGL2RenderingContext, points: number[], indices: [number, number, number][], shader: WebGLProgram) {
    //     this.vao = gl.createVertexArray();
    //     this.vbo = gl.createBuffer();
    //     this.ebo = gl.createBuffer();

    //     this.points = points;
    //     this.indices = indices;
    //     this.shader = shader;

    //     this.model = mat4.create()
    //     this.view = mat4.create()
    //     mat4.translate(this.view, this.view, vec3.fromValues(0.0, 0.0, -3.0))
    //     this.projection = mat4.create()
    //     mat4.perspective(this.projection, toRadians(45.0), gl.canvas.width/gl.canvas.height, 0.1, 100.0)

    //     gl.bindVertexArray(this.vao);
    //     gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    //     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.points.flat()), gl.STATIC_DRAW);

    //     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
    //     gl.bufferData(
    //         gl.ELEMENT_ARRAY_BUFFER,
    //         new Uint16Array(this.indices.flat()),
    //         gl.STATIC_DRAW
    //     );
        
    //     gl.enableVertexAttribArray(0);
    //     gl.vertexAttribPointer(
    //         0, 3, gl.FLOAT, false, 5 * 4, 0
    //     );

    //     gl.enableVertexAttribArray(1);
    //     gl.vertexAttribPointer(
    //         1, 2, gl.FLOAT, false, 5 * 4, 3 * 4
    //     )
    //     this.texture = loadTexture(gl, "https://i.postimg.cc/RVGWYtXg/awesomeface.png")!;
    //     gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    //     gl.bindVertexArray(null);
    //     gl.bindBuffer(gl.ARRAY_BUFFER, null);
    //     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    // }

}