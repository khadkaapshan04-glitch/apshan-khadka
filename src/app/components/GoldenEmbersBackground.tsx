import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  alpha: number;
  baseAlpha: number;
  speedY: number;
  swaySpeed: number;
  swayAmp: number;
  swayOffset: number;
  color: [number, number, number]; // RGB
  blur: number;
}

export function GoldenEmbersBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    // Color palette matching Flavoré's warm gold accent (#d4a574)
    const goldPalette: [number, number, number][] = [
      [0.83, 0.65, 0.45], // Theme gold (#d4a574)
      [0.92, 0.78, 0.58], // Light warm gold (#ebd494)
      [0.72, 0.51, 0.31], // Dark amber (#b8824f)
      [0.96, 0.88, 0.78], // Creamy white gold (#f5ebd7)
      [0.88, 0.58, 0.35], // Orange copper (#e09459)
    ];

    // Create particle systems
    const particleCount = 120;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const baseSize = Math.random() * 8 + 3;
      const baseAlpha = Math.random() * 0.45 + 0.15;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        size: baseSize,
        baseSize,
        alpha: baseAlpha,
        baseAlpha,
        speedY: -(Math.random() * 0.6 + 0.25),
        swaySpeed: Math.random() * 0.01 + 0.005,
        swayAmp: Math.random() * 0.8 + 0.2,
        swayOffset: Math.random() * Math.PI * 2,
        color: goldPalette[Math.floor(Math.random() * goldPalette.length)],
        blur: Math.random() * 0.8,
      });
    }

    // Vertex shader
    const VS = `
      attribute vec2 a_pos;
      attribute float a_size;
      attribute vec4 a_color;
      attribute float a_blur;
      
      varying vec4 v_color;
      varying float v_blur;
      
      uniform vec2 u_resolution;

      void main() {
        // Convert screen coordinates to WebGL clip space (-1.0 to 1.0)
        vec2 zeroToOne = a_pos / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        
        // Flip Y to match standard screen space coordinates
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        gl_PointSize = a_size;
        
        v_color = a_color;
        v_blur = a_blur;
      }
    `;

    // Fragment shader for rendering soft glowing round points (bokeh embers)
    const FS = `
      precision mediump float;
      varying vec4 v_color;
      varying float v_blur;

      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        
        if (dist > 0.5) {
          discard;
        }
        
        // Soft gradient falloff
        float alpha = smoothstep(0.5, 0.0, dist);
        
        // Modulate alpha to make the edges even softer/blurred
        alpha = pow(alpha, 1.2 + v_blur * 2.5);
        
        gl_FragColor = vec4(v_color.rgb, v_color.a * alpha);
      }
    `;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Shader compilation failed:", gl.getShaderInfoLog(s));
      }
      return s;
    };

    const prog = gl.createProgram();
    if (!prog) return;
    const vsShader = compile(gl.VERTEX_SHADER, VS);
    const fsShader = compile(gl.FRAGMENT_SHADER, FS);
    if (!vsShader || !fsShader) return;

    gl.attachShader(prog, vsShader);
    gl.attachShader(prog, fsShader);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Program linking failed:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // Get locations
    const aPosLoc = gl.getAttribLocation(prog, "a_pos");
    const aSizeLoc = gl.getAttribLocation(prog, "a_size");
    const aColorLoc = gl.getAttribLocation(prog, "a_color");
    const aBlurLoc = gl.getAttribLocation(prog, "a_blur");
    const uResLoc = gl.getUniformLocation(prog, "u_resolution");

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Track mouse
    let mouse = { x: -1000, y: -1000, active: false };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Array to pack all dynamic attribute data: x, y, size, r, g, b, a, blur (8 floats per particle)
    const stride = 8;
    const dataArray = new Float32Array(particleCount * stride);
    const buffer = gl.createBuffer();

    let lastTime = 0;

    const render = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      // Clear with very subtle dark transparency
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Simulation & packing
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        // 1. Upward float & sway
        p.y += p.speedY;
        p.x += Math.sin(time * p.swaySpeed + p.swayOffset) * p.swayAmp;

        // 2. Mouse Repulsion Force
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const limit = 160;

          if (dist < limit) {
            const force = (limit - dist) / limit;
            // Add push velocity
            p.vx += (dx / dist) * force * 0.9;
            p.vy += (dy / dist) * force * 0.9;
          }
        }

        // Apply friction and move by velocities
        p.vx *= 0.93;
        p.vy *= 0.93;
        p.x += p.vx;
        p.y += p.vy;

        // Reset if offscreen
        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
          p.vx = 0;
          p.vy = 0;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        // Pack float data
        const offset = i * stride;
        dataArray[offset] = p.x;
        dataArray[offset + 1] = p.y;
        dataArray[offset + 2] = p.size;
        dataArray[offset + 3] = p.color[0];
        dataArray[offset + 4] = p.color[1];
        dataArray[offset + 5] = p.color[2];
        dataArray[offset + 6] = p.alpha;
        dataArray[offset + 7] = p.blur;
      }

      // Bind and upload data
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, dataArray, gl.DYNAMIC_DRAW);

      // Set attribute pointers
      const FSIZE = Float32Array.BYTES_PER_ELEMENT;

      gl.enableVertexAttribArray(aPosLoc);
      gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, FSIZE * stride, 0);

      gl.enableVertexAttribArray(aSizeLoc);
      gl.vertexAttribPointer(aSizeLoc, 1, gl.FLOAT, false, FSIZE * stride, FSIZE * 2);

      gl.enableVertexAttribArray(aColorLoc);
      gl.vertexAttribPointer(aColorLoc, 4, gl.FLOAT, false, FSIZE * stride, FSIZE * 3);

      gl.enableVertexAttribArray(aBlurLoc);
      gl.vertexAttribPointer(aBlurLoc, 1, gl.FLOAT, false, FSIZE * stride, FSIZE * 7);

      // Set resolution uniform
      gl.uniform2f(uResLoc, width, height);

      // Draw particles
      gl.drawArrays(gl.POINTS, 0, particleCount);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0, // Sit on top of container solid background, but behind relative items
        pointerEvents: "none",
      }}
    />
  );
}
