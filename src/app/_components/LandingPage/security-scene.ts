import {
  AmbientLight,
  BufferGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  OrthographicCamera,
  RingGeometry,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  WebGLRenderer,
  BoxGeometry,
} from "three";

export type SceneController = {
  setActive(active: boolean): void;
  setPointer(x: number, y: number): void;
  dispose(): void;
};

/** A disposable, demand-rendered illustration; no remote assets or permanent render loop. */
export function createSecurityScene(container: HTMLElement): SceneController {
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x071b32, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";

  const scene = new Scene();
  const camera = new OrthographicCamera(-4, 4, 3.5, -3.5, 0.1, 50);
  camera.position.set(5.5, 3.5, 7.5);
  camera.lookAt(0, -0.02, 0.4);

  const silver = new MeshStandardMaterial({ color: 0xdce5ee, metalness: 0.42, roughness: 0.3 });
  const highlight = new MeshStandardMaterial({ color: 0xf2f8fc, metalness: 0.25, roughness: 0.23 });
  const steel = new MeshStandardMaterial({ color: 0x66829b, metalness: 0.65, roughness: 0.38 });
  const black = new MeshStandardMaterial({ color: 0x081522, metalness: 0.15, roughness: 0.45 });
  const rim = new MeshStandardMaterial({ color: 0x253e51, metalness: 0.72, roughness: 0.27 });
  const glass = new MeshPhysicalMaterial({
    color: 0x0b2942,
    metalness: 0.5,
    roughness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
  });
  const innerGlass = new MeshPhysicalMaterial({
    color: 0x102b46,
    metalness: 0.55,
    roughness: 0.06,
    clearcoat: 1,
  });
  const blue = new MeshBasicMaterial({ color: 0x73d6ff });
  const opticHighlight = new MeshBasicMaterial({
    color: 0x73d6ff,
    transparent: true,
    opacity: 0.3,
    side: DoubleSide,
    depthWrite: false,
  });

  scene.add(new AmbientLight(0xb2d5ec, 2));
  const key = new DirectionalLight(0xf4fbff, 4.2);
  key.position.set(-3, 6, 5);
  scene.add(key);
  const edge = new DirectionalLight(0x73d6ff, 2.8);
  edge.position.set(3, 2, -5);
  scene.add(edge);
  const fill = new DirectionalLight(0xbad8f0, 1.4);
  fill.position.set(5, -1, 2);
  scene.add(fill);

  const rig = new Group();
  rig.position.set(0.12, 0.45, -0.1);
  rig.scale.setScalar(1.16);
  scene.add(rig);

  const cylinder = (
    radius: number,
    depth: number,
    z: number,
    material = silver,
    radialSegments = 64
  ) => {
    const mesh = new Mesh(new CylinderGeometry(radius, radius, depth, radialSegments), material);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.z = z;
    rig.add(mesh);
    return mesh;
  };
  const ring = (radius: number, thickness: number, z: number, material = rim) => {
    const mesh = new Mesh(new TorusGeometry(radius, thickness, 10, 64), material);
    mesh.position.z = z;
    rig.add(mesh);
    return mesh;
  };

  // The housing is intentionally unbranded rather than a replica of a commercial camera.
  cylinder(0.78, 1.84, -0.1, silver);
  cylinder(0.795, 0.08, -0.92, steel);
  cylinder(0.76, 0.1, -0.99, silver);
  cylinder(0.835, 0.45, 0.8, highlight);
  cylinder(0.755, 0.07, 1.047, steel);
  cylinder(0.71, 0.075, 1.09, black);
  ring(0.725, 0.022, 1.145, silver);
  cylinder(0.56, 0.08, 1.15, rim);
  ring(0.535, 0.035, 1.207, black);
  ring(0.485, 0.018, 1.228, steel);
  cylinder(0.463, 0.045, 1.225, glass);
  ring(0.405, 0.009, 1.255, rim);
  cylinder(0.337, 0.018, 1.258, innerGlass);
  ring(0.329, 0.008, 1.272, steel);
  cylinder(0.22, 0.015, 1.274, black);
  cylinder(0.105, 0.008, 1.285, innerGlass, 48);

  const reflection = new Mesh(new RingGeometry(0.34, 0.39, 48, 1, 0.5, 1.55), opticHighlight);
  reflection.position.set(-0.018, 0.018, 1.289);
  rig.add(reflection);
  const reflectionSmall = new Mesh(new SphereGeometry(0.08, 16, 10), opticHighlight);
  reflectionSmall.scale.set(1, 0.45, 0.05);
  reflectionSmall.position.set(0.2, -0.23, 1.294);
  rig.add(reflectionSmall);

  for (let index = 0; index < 6; index += 1) {
    const angle = (index / 6) * Math.PI * 2 + 0.25;
    const diode = new Mesh(new SphereGeometry(0.049, 12, 8), steel);
    diode.scale.z = 0.35;
    diode.position.set(Math.cos(angle) * 0.635, Math.sin(angle) * 0.635, 1.14);
    rig.add(diode);
  }
  const indicator = new Mesh(new SphereGeometry(0.019, 10, 8), blue);
  indicator.position.set(0.58, -0.18, 1.151);
  rig.add(indicator);

  const mountJoint = new Mesh(new SphereGeometry(0.22, 24, 16), steel);
  mountJoint.position.set(0, -0.79, -0.35);
  rig.add(mountJoint);
  const stem = new Mesh(new CylinderGeometry(0.12, 0.17, 0.72, 24), silver);
  stem.position.set(0, -1.12, -0.5);
  stem.rotation.x = -0.32;
  rig.add(stem);
  const base = new Mesh(new CylinderGeometry(0.4, 0.45, 0.12, 48), highlight);
  base.position.set(0, -1.5, -0.62);
  rig.add(base);
  const baseInset = new Mesh(new TorusGeometry(0.31, 0.012, 8, 48), steel);
  baseInset.rotation.x = Math.PI / 2;
  baseInset.position.set(0, -1.431, -0.62);
  rig.add(baseInset);
  for (const x of [-0.27, 0.27]) {
    const screw = new Mesh(new CylinderGeometry(0.025, 0.025, 0.008, 12), steel);
    screw.position.set(x, -1.435, -0.62);
    rig.add(screw);
  }
  for (let index = 0; index < 3; index += 1) {
    const vent = new Mesh(new BoxGeometry(0.04, 0.018, 0.38), steel);
    vent.position.set(0.45 + index * 0.07, 0.61 - index * 0.07, -0.2);
    rig.add(vent);
  }

  const architecture = new Group();
  architecture.position.y = -1.39;
  scene.add(architecture);
  const gridMaterial = new LineBasicMaterial({
    color: 0x73d6ff,
    transparent: true,
    opacity: 0.085,
  });
  const gridVertices: number[] = [];
  for (let line = -5; line <= 5; line += 0.65) {
    gridVertices.push(-5, 0, line, 5, 0, line, line, 0, -5, line, 0, 5);
  }
  const gridGeometry = new BufferGeometry();
  gridGeometry.setAttribute("position", new Float32BufferAttribute(gridVertices, 3));
  architecture.add(new LineSegments(gridGeometry, gridMaterial));
  const buildingMaterial = new LineBasicMaterial({
    color: 0xa3c3dc,
    transparent: true,
    opacity: 0.2,
  });
  const buildBlock = (x: number, z: number, width: number, depth: number, height: number) => {
    const box = new BoxGeometry(width, height, depth);
    const lines = new LineSegments(new EdgesGeometry(box), buildingMaterial);
    box.dispose();
    lines.position.set(x, height / 2, z);
    architecture.add(lines);
  };
  buildBlock(-2.5, -1.7, 1.15, 1, 1.15);
  buildBlock(-3.1, -0.25, 0.7, 0.65, 0.72);
  buildBlock(2.25, -1.1, 0.9, 1.3, 0.72);

  const coverageVertices = [
    0, 0.35, 1.4, -1.9, -1.38, 4.2, 1.9, -1.38, 4.2, 0, 0.35, 1.4, -1.9, -1.38, 4.2, -1.9, -1.38,
    1.9, 0, 0.35, 1.4, 1.9, -1.38, 1.9, 1.9, -1.38, 4.2,
  ];
  const coverageGeometry = new BufferGeometry();
  coverageGeometry.setAttribute("position", new Float32BufferAttribute(coverageVertices, 3));
  coverageGeometry.computeVertexNormals();
  const coverageMaterial = new MeshBasicMaterial({
    color: 0x73d6ff,
    transparent: true,
    opacity: 0.035,
    side: DoubleSide,
    depthWrite: false,
  });
  scene.add(new Mesh(coverageGeometry, coverageMaterial));
  const coverageLinesGeometry = new BufferGeometry();
  coverageLinesGeometry.setAttribute(
    "position",
    new Float32BufferAttribute(
      [
        0, 0.35, 1.4, -1.9, -1.38, 4.2, 0, 0.35, 1.4, 1.9, -1.38, 4.2, -1.9, -1.38, 4.2, 1.9, -1.38,
        4.2, -1.9, -1.38, 4.2, -1.9, -1.38, 1.9, 1.9, -1.38, 4.2, 1.9, -1.38, 1.9,
      ],
      3
    )
  );
  scene.add(
    new LineSegments(
      coverageLinesGeometry,
      new LineBasicMaterial({ color: 0x73d6ff, transparent: true, opacity: 0.2 })
    )
  );
  for (const radius of [1.8, 2.6]) {
    const circle = new Mesh(
      new RingGeometry(radius, radius + 0.008, 96),
      new MeshBasicMaterial({
        color: 0x73d6ff,
        transparent: true,
        opacity: 0.12,
        side: DoubleSide,
        depthWrite: false,
      })
    );
    circle.rotation.x = -Math.PI / 2;
    circle.position.set(0, -1.375, 1.3);
    scene.add(circle);
  }
  const shadow = new Mesh(
    new CircleGeometry(1, 48),
    new MeshBasicMaterial({
      color: new Color(0x020c19),
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(1.7, 0.75, 1);
  shadow.position.set(0.1, -1.37, -0.15);
  scene.add(shadow);

  let disposed = false;
  let active = false;
  let frame = 0;
  let previousTime = 0;
  let introElapsed = 0;
  let pointerX = 0;
  let pointerY = 0;
  let currentX = 0;
  let currentY = 0;
  const introDuration = 2.2;

  const render = (time: number) => {
    frame = 0;
    if (disposed || !active) return;
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0.016;
    previousTime = time;
    introElapsed = Math.min(introDuration, introElapsed + delta);
    const progress = introElapsed / introDuration;
    const ease = 1 - Math.pow(1 - progress, 3);
    const interpolation = 1 - Math.exp(-delta * 7);
    currentX += (pointerX - currentX) * interpolation;
    currentY += (pointerY - currentY) * interpolation;
    rig.rotation.y = -0.32 + 0.2 * (1 - ease) + currentX * 0.12;
    rig.rotation.x = -0.03 + currentY * 0.055;
    rig.position.y = 0.45 + (1 - ease) * 0.18;
    renderer.render(scene, camera);
    if (
      progress < 1 ||
      Math.abs(currentX - pointerX) > 0.001 ||
      Math.abs(currentY - pointerY) > 0.001
    ) {
      frame = window.requestAnimationFrame(render);
    }
  };
  const wake = () => {
    if (!disposed && active && !frame) {
      previousTime = 0;
      frame = window.requestAnimationFrame(render);
    }
  };
  const resize = () => {
    if (disposed) return;
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    const aspect = width / height;
    const halfHeight = 3.1;
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    renderer.render(scene, camera);
  };
  const resizeObserver = new ResizeObserver(resize);
  try {
    container.appendChild(renderer.domElement);
    resize();
    resizeObserver.observe(container);
  } catch (error) {
    resizeObserver.disconnect();
    renderer.dispose();
    renderer.domElement.remove();
    throw error;
  }
  rig.rotation.y = -0.12;

  return {
    setActive(nextActive) {
      if (disposed) return;
      active = nextActive;
      if (active) wake();
      else if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
      }
    },
    setPointer(x, y) {
      if (disposed) return;
      pointerX = Math.max(-1, Math.min(1, x));
      pointerY = Math.max(-1, Math.min(1, y));
      wake();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      active = false;
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      const geometries = new Set<BufferGeometry>();
      const materials = new Set<
        MeshBasicMaterial | MeshStandardMaterial | MeshPhysicalMaterial | LineBasicMaterial
      >();
      scene.traverse((object) => {
        if (object instanceof Mesh || object instanceof LineSegments) {
          geometries.add(object.geometry);
          const entries = Array.isArray(object.material) ? object.material : [object.material];
          entries.forEach((material) => materials.add(material as MeshBasicMaterial));
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.renderLists.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      scene.clear();
    },
  };
}
