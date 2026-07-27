import * as THREE from 'three';

export class HolographicMaterial extends THREE.ShaderMaterial {
  constructor(parameters = {}) {
    super({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(parameters.color || '#00d5ff') },
        uScanlineSize: { value: parameters.scanlineSize || 8.0 },
        uSignalSpeed: { value: parameters.signalSpeed || 0.45 },
        uBrightness: { value: parameters.brightness || 1.4 },
        uOpacity: { value: parameters.opacity || 0.85 }
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        uniform float uTime;

        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;

          vec3 transformed = position;
          float glitchTime = uTime - transformed.y;
          float glitchStrength = sin(glitchTime * 4.0) * cos(glitchTime * 2.0);
          glitchStrength = smoothstep(0.7, 1.0, glitchStrength) * 0.02;
          transformed.x += (fract(sin(dot(transformed.xz + uTime, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * glitchStrength;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uScanlineSize;
        uniform float uSignalSpeed;
        uniform float uBrightness;
        uniform float uOpacity;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = dot(viewDir, normal);
          fresnel = clamp(1.0 - abs(fresnel), 0.0, 1.0);
          fresnel = pow(fresnel, 2.0);

          float scanline = sin((vPosition.y * uScanlineSize) - (uTime * uSignalSpeed * 10.0));
          scanline = smoothstep(0.0, 0.5, scanline);

          float finalAlpha = (fresnel + (scanline * 0.3)) * uOpacity;
          vec3 finalColor = uColor * uBrightness * (fresnel + 0.5);

          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `
    });
  }

  update(delta) {
    this.uniforms.uTime.value += delta;
  }
}
