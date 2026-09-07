import * as THREE from 'three';

export interface TrailPoint {
  posLeft: THREE.Vector3;
  posRight: THREE.Vector3;
  color: THREE.Color;
  alpha: number;
}

/**
 * Cyberpunk Ground Surface Neon Trail Ribbon
 * Creates a horizontal neon light ribbon that lies directly on the surface of the track
 * tracing the exact trajectory of the bolide as in high-end arcade racers.
 */
export class NeonBikeTrail {
  // Long smooth ground trail
  private maxPoints: number = 240;
  private points: TrailPoint[] = [];
  private mesh: THREE.Mesh;
  private geometry: THREE.BufferGeometry;
  private material: THREE.MeshBasicMaterial;

  private positions: Float32Array;
  private colors: Float32Array;

  constructor(baseColorHex: string = '#00f0ff') {
    this.geometry = new THREE.BufferGeometry();

    // 2 vertices per segment (quad strip)
    const vertexCount = this.maxPoints * 2;
    this.positions = new Float32Array(vertexCount * 3);
    this.colors = new Float32Array(vertexCount * 4);

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 4));

    // Build quad indices
    const indices: number[] = [];
    for (let i = 0; i < this.maxPoints - 1; i++) {
      const i0 = i * 2;
      const i1 = i * 2 + 1;
      const i2 = (i + 1) * 2;
      const i3 = (i + 1) * 2 + 1;
      // Two triangles per quad
      indices.push(i0, i1, i2);
      indices.push(i1, i3, i2);
    }
    this.geometry.setIndex(indices);

    this.material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public addPoint(
    centerPos: THREE.Vector3,
    normalOutward: THREE.Vector3,
    tangentForward: THREE.Vector3,
    ribbonColorHex: string,
    width: number = 0.85
  ) {
    // Horizontal neon track ribbon:
    // Sits flush on the track surface (lifted slightly by 0.05m to eliminate Z-fighting)
    // and spans horizontally across the track perpendicular to tangent
    const lateral = new THREE.Vector3().crossVectors(tangentForward, normalOutward).normalize();
    const halfWidth = width * 0.5;

    const surfaceOffset = normalOutward.clone().multiplyScalar(0.05);
    const basePos = centerPos.clone().add(surfaceOffset);

    const posLeft = basePos.clone().addScaledVector(lateral, -halfWidth);
    const posRight = basePos.clone().addScaledVector(lateral, halfWidth);

    const c = new THREE.Color(ribbonColorHex);

    this.points.unshift({
      posLeft,
      posRight,
      color: c,
      alpha: 1.0,
    });

    if (this.points.length > this.maxPoints) {
      this.points.pop();
    }

    this.updateGeometry();
  }

  private updateGeometry() {
    const len = this.points.length;
    const posAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    const colAttr = this.geometry.getAttribute('color') as THREE.BufferAttribute;

    for (let i = 0; i < this.maxPoints; i++) {
      const idx = i * 2;
      if (i < len) {
        const pt = this.points[i];
        // Gradual fade along the ribbon
        const lifeRatio = 1.0 - i / this.maxPoints;
        const alpha = Math.min(1.0, lifeRatio * 1.4) * Math.pow(lifeRatio, 1.2);

        // Left vertex (on surface)
        this.positions[idx * 3] = pt.posLeft.x;
        this.positions[idx * 3 + 1] = pt.posLeft.y;
        this.positions[idx * 3 + 2] = pt.posLeft.z;

        this.colors[idx * 4] = pt.color.r * 1.3;
        this.colors[idx * 4 + 1] = pt.color.g * 1.3;
        this.colors[idx * 4 + 2] = pt.color.b * 1.3;
        this.colors[idx * 4 + 3] = alpha;

        // Right vertex (on surface)
        this.positions[(idx + 1) * 3] = pt.posRight.x;
        this.positions[(idx + 1) * 3 + 1] = pt.posRight.y;
        this.positions[(idx + 1) * 3 + 2] = pt.posRight.z;

        this.colors[(idx + 1) * 4] = pt.color.r * 1.3;
        this.colors[(idx + 1) * 4 + 1] = pt.color.g * 1.3;
        this.colors[(idx + 1) * 4 + 2] = pt.color.b * 1.3;
        this.colors[(idx + 1) * 4 + 3] = alpha;
      } else if (len > 0) {
        // Degenerate to last known point
        const last = this.points[len - 1];
        this.positions[idx * 3] = last.posLeft.x;
        this.positions[idx * 3 + 1] = last.posLeft.y;
        this.positions[idx * 3 + 2] = last.posLeft.z;
        this.colors[idx * 4 + 3] = 0;

        this.positions[(idx + 1) * 3] = last.posRight.x;
        this.positions[(idx + 1) * 3 + 1] = last.posRight.y;
        this.positions[(idx + 1) * 3 + 2] = last.posRight.z;
        this.colors[(idx + 1) * 4 + 3] = 0;
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  }

  public clear() {
    this.points = [];
    this.updateGeometry();
  }

  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
