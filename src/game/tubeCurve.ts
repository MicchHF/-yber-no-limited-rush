import * as THREE from 'three';
import { getTubeRadiusAtDistance } from './biomes';

/**
 * Procedural 3D Curving Tube Spine
 * Computes a smooth, winding 3D path in deep space with continuous tangents and normal frames.
 * The tube radius is fixed per biome (Neo Metropolis: 14m, Inferno: 10m, Cryo: 18m, Quantum: 12m, Boss: 16m)
 * with smooth narrowing/widening transitions and zero obstacles in transition zones.
 * The hyper-bike rides on the OUTSIDE surface of this curving tube.
 */
export class CosmicTubePath {
  public readonly RADIUS = 14.0;

  // Coefficients for smooth, organic 3D winding
  private freqX1 = 0.0052;
  private freqX2 = 0.013;
  private ampX1 = 44.0;
  private ampX2 = 20.0;

  private freqY1 = 0.0045;
  private freqY2 = 0.011;
  private ampY1 = 36.0;
  private ampY2 = 16.0;

  /**
   * Exact biome cylinder radius:
   * Fixed inside each biome with smooth hermite S-curve transitions at boundaries.
   */
  public getRadius(z: number): number {
    return getTubeRadiusAtDistance(z);
  }

  /**
   * Get 3D center point of the tube at distance z
   * Includes thrilling 3D roller-coaster corkscrew loops, vertical apexes & banked dives!
   */
  public getCenter(z: number): THREE.Vector3 {
    let x = Math.sin(z * this.freqX1) * this.ampX1 + Math.cos(z * this.freqX2) * this.ampX2;
    let y = Math.cos(z * this.freqY1) * this.ampY1 + Math.sin(z * this.freqY2) * this.ampY2;

    // Periodic dramatic 3D roller-coaster loops & helical corkscrews (every 2400m)
    const loopInterval = 2400;
    const localZ = ((z % loopInterval) + loopInterval) % loopInterval;

    // Feature 1: Colossal 3D Zero-G Apex Loop & Swooping Dive (450m - 1020m)
    if (localZ > 450 && localZ < 1020) {
      const p = (localZ - 450) / 570; // 0 to 1
      // Raised cosine bell envelope for C2 continuous smooth entry and exit
      const env = (1.0 - Math.cos(p * Math.PI * 2.0)) * 0.5;
      // High-altitude soaring loop crest (+64m into the sky) with deep banked dive
      y += Math.sin(p * Math.PI) * 64.0 * env;
      x += Math.sin(p * Math.PI * 2.0) * 44.0 * env;
    }

    // Feature 2: High-Speed 3D Helical Vortex Corkscrew Loop (1450m - 2150m)
    if (localZ > 1450 && localZ < 2150) {
      const p = (localZ - 1450) / 700; // 0 to 1
      const env = (1.0 - Math.cos(p * Math.PI * 2.0)) * 0.5;
      const corkscrewAngle = p * Math.PI * 2.0;

      // 3D helical loop: lateral swirl + vertical inverted loop cycle
      x += Math.sin(corkscrewAngle) * (56.0 * env);
      y += (1.0 - Math.cos(corkscrewAngle)) * (48.0 * env);
    }

    return new THREE.Vector3(x, y, z);
  }

  /**
   * Analytical & Central-difference continuous tangent vector
   */
  public getTangent(z: number): THREE.Vector3 {
    const dz = 0.08;
    const pAhead = this.getCenter(z + dz);
    const pBehind = this.getCenter(z - dz);
    return pAhead.sub(pBehind).normalize();
  }

  /**
   * Curvature direction
   */
  public getCurvature(z: number): THREE.Vector3 {
    const dz = 0.1;
    const tAhead = this.getTangent(z + dz);
    const tBehind = this.getTangent(z - dz);
    return tAhead.sub(tBehind).divideScalar(2 * dz);
  }

  /**
   * Builds an orthonormal reference frame (Right, Up, Forward) at position z
   * where Forward is the tangent of the curve.
   */
  public getFrame(z: number): { forward: THREE.Vector3; right: THREE.Vector3; up: THREE.Vector3 } {
    const forward = this.getTangent(z);

    // Global reference up
    let worldUp = new THREE.Vector3(0, 1, 0);
    if (Math.abs(forward.dot(worldUp)) > 0.92) {
      worldUp = new THREE.Vector3(0, 0, 1);
    }

    // Rigorously right-handed orthonormal reference frame (det = +1.0):
    const right = new THREE.Vector3().crossVectors(worldUp, forward).normalize();
    const up = new THREE.Vector3().crossVectors(forward, right).normalize();

    return { forward, right, up };
  }

  /**
   * Returns point on the OUTSIDE surface of the tube at (z, angle)
   * angle = 0 is Right, PI/2 is Up, PI is Left, 3PI/2 is Down
   */
  public getSurfacePoint(z: number, angle: number, extraRadius: number = 0): THREE.Vector3 {
    const center = this.getCenter(z);
    const { right, up } = this.getFrame(z);
    const r = this.getRadius(z) + extraRadius;

    const radialOffset = new THREE.Vector3()
      .addScaledVector(right, Math.cos(angle) * r)
      .addScaledVector(up, Math.sin(angle) * r);

    return center.add(radialOffset);
  }

  /**
   * Radial outward normal vector (pointing away from tube center)
   */
  public getRadialNormal(z: number, angle: number): THREE.Vector3 {
    const { right, up } = this.getFrame(z);
    return new THREE.Vector3()
      .addScaledVector(right, Math.cos(angle))
      .addScaledVector(up, Math.sin(angle))
      .normalize();
  }
}

export const cosmicTube = new CosmicTubePath();
