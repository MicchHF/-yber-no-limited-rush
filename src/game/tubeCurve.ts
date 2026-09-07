import * as THREE from 'three';

/**
 * Procedural 3D Curving Tube Spine
 * Computes a smooth, winding 3D path in deep space with continuous tangents and normal frames.
 * The tube radius is R = 6.5.
 * The hyper-bike rides on the OUTSIDE surface of this curving tube.
 */
export class CosmicTubePath {
  public readonly RADIUS = 6.5;

  // Coefficients for smooth, organic 3D winding
  private freqX1 = 0.0055;
  private freqX2 = 0.014;
  private ampX1 = 38.0;
  private ampX2 = 18.0;

  private freqY1 = 0.0048;
  private freqY2 = 0.012;
  private ampY1 = 32.0;
  private ampY2 = 14.0;

  /**
   * Get 3D center point of the tube at distance z
   */
  public getCenter(z: number): THREE.Vector3 {
    const x = Math.sin(z * this.freqX1) * this.ampX1 + Math.cos(z * this.freqX2) * this.ampX2;
    const y = Math.cos(z * this.freqY1) * this.ampY1 + Math.sin(z * this.freqY2) * this.ampY2;
    return new THREE.Vector3(x, y, z);
  }

  /**
   * Analytical 1st derivative (velocity/tangent before normalization)
   */
  public getTangent(z: number): THREE.Vector3 {
    const dx =
      Math.cos(z * this.freqX1) * this.ampX1 * this.freqX1 -
      Math.sin(z * this.freqX2) * this.ampX2 * this.freqX2;
    const dy =
      -Math.sin(z * this.freqY1) * this.ampY1 * this.freqY1 +
      Math.cos(z * this.freqY2) * this.ampY2 * this.freqY2;
    const dz = 1.0;
    return new THREE.Vector3(dx, dy, dz).normalize();
  }

  /**
   * Analytical 2nd derivative (curvature direction)
   */
  public getCurvature(z: number): THREE.Vector3 {
    const ddx =
      -Math.sin(z * this.freqX1) * this.ampX1 * this.freqX1 * this.freqX1 -
      Math.cos(z * this.freqX2) * this.ampX2 * this.freqX2 * this.freqX2;
    const ddy =
      -Math.cos(z * this.freqY1) * this.ampY1 * this.freqY1 * this.freqY1 -
      Math.sin(z * this.freqY2) * this.ampY2 * this.freqY2 * this.freqY2;
    return new THREE.Vector3(ddx, ddy, 0);
  }

  /**
   * Builds an orthonormal reference frame (Right, Up, Forward) at position z
   * where Forward is the tangent of the curve.
   */
  public getFrame(z: number): { forward: THREE.Vector3; right: THREE.Vector3; up: THREE.Vector3 } {
    const forward = this.getTangent(z);

    // Global reference up
    let worldUp = new THREE.Vector3(0, 1, 0);
    if (Math.abs(forward.dot(worldUp)) > 0.95) {
      worldUp = new THREE.Vector3(0, 0, 1);
    }

    // Rigorously right-handed orthonormal reference frame (det = +1.0):
    // right = worldUp x forward, up = forward x right
    // => right x up = forward (no coordinate inversion or mirroring!)
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
    const r = this.RADIUS + extraRadius;

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
