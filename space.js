(function() {
  // Ensure Three.js is loaded
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
  // Deep space background color
  scene.background = new THREE.Color(0x020205);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;

  // 2. Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Low ambient light
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
  sunLight.position.set(-5, 3, 5); // Sun from top-left
  scene.add(sunLight);

  // 3. Create the Earth (3D Sphere)
  const earthRadius = 5;
  const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
  
  // Load textures
  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
  
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    shininess: 10
  });
  
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  // Position Earth so we only see the top horizon
  earth.position.y = -4.5;
  scene.add(earth);

  // Add a slight atmospheric glow using a larger sphere with additive blending
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



  // 5. Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    

  });



  // 6. Scroll Interaction
  let scrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  // 7. Animation Loop
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);

    time += 0.01;

    // "la planete terre tourne a la vertical sur elle meme"
    // Vertical rotation based on scroll
    earth.rotation.x = scrollY * 0.002;
    // Plus a very slow continuous horizontal rotation for life
    earth.rotation.y += 0.0005;



    renderer.render(scene, camera);
  }

  animate();

  // Scroll reveal logic from previous version
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
