(function() {
  if (typeof THREE === 'undefined') {
    console.error('Three.js is not loaded!');
    return;
  }

  // 1. Setup Scene, Camera, Renderer
  const canvas = document.getElementById('space');
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050b1f); // Bleu nuit (Midnight blue)

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;

  // 2. Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Low ambient
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
  sunLight.position.set(-5, 3, 5); // Sun from top-left
  scene.add(sunLight);
  
  const backLight = new THREE.DirectionalLight(0x4aaeff, 0.5);
  backLight.position.set(5, -3, -5);
  scene.add(backLight);

  // 3. Stars (The background)
  const starsGeometry = new THREE.BufferGeometry();
  const starsCount = 3000; // Plus d'étoiles
  const posArray = new Float32Array(starsCount * 3);
  for(let i = 0; i < starsCount * 3; i++) {
    // Generate stars around the camera
    posArray[i] = (Math.random() - 0.5) * 100;
  }
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const starsMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
  });
  const starsMesh = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starsMesh);

  // 4. Create the Earth
  const earthRadius = 5;
  const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
  
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    shininess: 15
  });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  earth.position.y = -4.5;
  scene.add(earth);

  // Atmosphere glow
  const atmosGeometry = new THREE.SphereGeometry(earthRadius * 1.02, 64, 64);
  const atmosMaterial = new THREE.MeshBasicMaterial({
    color: 0x4aaeff,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });
  const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial);
  earth.add(atmosphere);

  // 5. Create a HIGHLY DETAILED REALISTIC 3D SATELLITE
  const satellite = new THREE.Group();

  // Matériaux réalistes
  const goldFoil = new THREE.MeshStandardMaterial({
    color: 0xd4af37, metalness: 0.8, roughness: 0.4
  });
  const silverMetal = new THREE.MeshStandardMaterial({
    color: 0xcccccc, metalness: 0.9, roughness: 0.2
  });
  const solarPanelMat = new THREE.MeshStandardMaterial({
    color: 0x0a1b42, metalness: 1.0, roughness: 0.1
  });
  const solarGridMat = new THREE.MeshBasicMaterial({
    color: 0x4aaeff, wireframe: true, transparent: true, opacity: 0.15
  });

  // Corps central (Hexagonal cylinder)
  const bodyGeom = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 6);
  const body = new THREE.Mesh(bodyGeom, goldFoil);
  satellite.add(body);

  // Panneaux Solaires avec segments
  const createSolarWing = (xOffset) => {
    const wing = new THREE.Group();
    for(let i=0; i<3; i++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.05), solarPanelMat);
      const grid = new THREE.Mesh(new THREE.BoxGeometry(1.21, 0.81, 0.06), solarGridMat);
      panel.add(grid);
      panel.position.x = xOffset > 0 ? (i * 1.3) + 0.8 : -(i * 1.3) - 0.8;
      wing.add(panel);
    }
    // Tige de support (truss)
    const truss = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.5), silverMetal);
    truss.rotation.z = Math.PI / 2;
    truss.position.x = xOffset > 0 ? 2 : -2;
    wing.add(truss);
    return wing;
  };
  
  const rightWing = createSolarWing(1);
  const leftWing = createSolarWing(-1);
  satellite.add(rightWing);
  satellite.add(leftWing);

  // Antenne Parabole
  const dishGroup = new THREE.Group();
  const dishGeom = new THREE.SphereGeometry(0.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3);
  const dish = new THREE.Mesh(dishGeom, silverMetal);
  dish.material.side = THREE.DoubleSide;
  dish.rotation.x = Math.PI; // Face outwards
  dishGroup.add(dish);
  
  // Capteur au centre de l'antenne
  const receiver = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6), silverMetal);
  receiver.position.y = 0.3;
  dishGroup.add(receiver);

  // Rehausser l'antenne pour qu'elle ne rentre pas dans le cylindre
  dishGroup.position.set(0, 1.4, 0.5);
  dishGroup.rotation.x = Math.PI / 4;
  satellite.add(dishGroup);

  // Mât reliant l'antenne au cylindre
  const dishMast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8), silverMetal);
  dishMast.position.set(0, 1.0, 0.25);
  dishMast.rotation.x = Math.PI / 8;
  satellite.add(dishMast);

  // Instruments / Objectif Caméra
  const cameraGeom = new THREE.CylinderGeometry(0.15, 0.1, 0.4);
  const cam = new THREE.Mesh(cameraGeom, new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.1 }));
  cam.position.set(0, -0.8, 0.2);
  cam.rotation.x = -Math.PI / 6;
  satellite.add(cam);

  // Position et échelle initiale du satellite
  satellite.position.set(3.5, 2, 2);
  satellite.rotation.set(0.3, -0.4, 0.1);
  satellite.scale.set(0.7, 0.7, 0.7);
  scene.add(satellite);

  // 6. Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    if (window.innerWidth < 800) {
      satellite.position.set(0, 3, 2);
      satellite.scale.set(0.4, 0.4, 0.4);
    } else {
      satellite.position.set(3.5, 2, 2);
      satellite.scale.set(0.7, 0.7, 0.7);
    }
  });

  if (window.innerWidth < 800) {
    satellite.position.set(0, 3, 2);
    satellite.scale.set(0.4, 0.4, 0.4);
  }



  // 7. Scroll & Animation
  let scrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    // Earth vertical scroll rotation
    earth.rotation.x = scrollY * 0.002;
    earth.rotation.y += 0.0005;

    // 3D Parallax Dive (The Wow Factor)
    // Camera moves closer to Earth and tilts down as you scroll
    let targetZ = 10 - (scrollY * 0.0025);
    let targetY = -(scrollY * 0.0015);
    camera.position.z += (Math.max(6, targetZ) - camera.position.z) * 0.1;
    camera.position.y += (targetY - camera.position.y) * 0.1;
    
    // Slight look down
    camera.lookAt(0, earth.position.y * 0.2, 0);

    // Stars subtle drift
    starsMesh.rotation.y = time * 0.05;

    // Satellite bobbing & spinning slightly
    satellite.position.y = 2 + Math.sin(time) * 0.2;
    satellite.rotation.z = 0.1 + Math.sin(time * 0.5) * 0.05;
    satellite.rotation.y = -0.4 + Math.sin(time * 0.3) * 0.05;

    renderer.render(scene, camera);
  }
  animate();

  // Scroll reveal logic
  const nav = document.getElementById('nav');
  if(nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  const obs = new IntersectionObserver(e => {
    e.forEach(el => {
      if (el.isIntersecting) el.target.classList.add('vis');
    });
  }, { threshold: 0.08 });
  
  document.querySelectorAll('.rv').forEach(el => obs.observe(el));
})();
