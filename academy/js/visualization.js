/**
 * Visualization3D - Three.js based 3D Knowledge Graph
 * Interactive 3D visualization of Decentralized AI topics and their relationships
 */

export class Visualization3D {
    constructor(container, curriculum) {
        this.container = container;
        this.curriculum = curriculum;

        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Graph elements
        this.nodes = [];
        this.edges = [];
        this.nodeObjects = new Map(); // Map<topicId, mesh>

        // Interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedNode = null;
        this.hoveredNode = null;

        // Animation
        this.autoRotate = false;
        this.animationId = null;

        // Callbacks
        this.onNodeClick = null;
        this.onNodeHover = null;
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupLights();
        this.createGraph();
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f172a);

        // Add fog for depth perception
        this.scene.fog = new THREE.Fog(0x0f172a, 30, 100);

        // Add starfield background
        this.createStarfield();
    }

    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });

        const starsVertices = [];
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 200;
            const y = (Math.random() - 0.5) * 200;
            const z = (Math.random() - 0.5) * 200;
            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const starField = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(starField);
    }

    setupCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(15, 10, 15);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 50;
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = 0.5;
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Directional lights
        const directionalLight1 = new THREE.DirectionalLight(0x667eea, 0.8);
        directionalLight1.position.set(5, 10, 5);
        this.scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0x764ba2, 0.6);
        directionalLight2.position.set(-5, -10, -5);
        this.scene.add(directionalLight2);

        // Point lights for dramatic effect
        const pointLight = new THREE.PointLight(0x667eea, 1, 50);
        pointLight.position.set(0, 5, 0);
        this.scene.add(pointLight);
    }

    createGraph() {
        // Create nodes from curriculum
        if (this.curriculum.nodes) {
            this.curriculum.nodes.forEach(node => {
                this.createNode(node);
            });
        }

        // Create edges from curriculum
        if (this.curriculum.edges) {
            this.curriculum.edges.forEach(edge => {
                this.createEdge(edge.from, edge.to, '#667eea');
            });
        }
    }

    createNode(node) {
        // Node geometry - sphere with glow effect
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);

        // Material with node color
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(node.color),
            emissive: new THREE.Color(node.color),
            emissiveIntensity: 0.3,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(node.position.x, node.position.y, node.position.z);
        mesh.userData = { node };

        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(0.7, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(node.color),
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        mesh.add(glow);

        // Add label
        this.createLabel(node, mesh);

        this.scene.add(mesh);
        this.nodeObjects.set(node.id, mesh);
        this.nodes.push(mesh);
    }

    createLabel(node, nodeMesh) {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;

        // Get label text (support both string and object)
        const labelText = typeof node.label === 'object' ? node.label.ru || node.label.en : node.label;

        // Draw text
        context.fillStyle = '#ffffff';
        context.font = 'Bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(labelText, 256, 64);

        // Create texture and sprite
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(4, 1, 1);
        sprite.position.y = 1.5;
        nodeMesh.add(sprite);
    }

    createEdges() {
        this.curriculum.paths.forEach(path => {
            for (let i = 0; i < path.topics.length - 1; i++) {
                const fromId = path.topics[i];
                const toId = path.topics[i + 1];
                this.createEdge(fromId, toId, path.color);
            }
        });
    }

    createEdge(fromId, toId, color) {
        const fromNode = this.nodeObjects.get(fromId);
        const toNode = this.nodeObjects.get(toId);

        if (!fromNode || !toNode) return;

        // Create curved line
        const start = fromNode.position;
        const end = toNode.position;

        // Calculate control point for curve
        const mid = new THREE.Vector3(
            (start.x + end.x) / 2,
            (start.y + end.y) / 2 + 2,
            (start.z + end.z) / 2
        );

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const material = new THREE.LineBasicMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0.4,
            linewidth: 2
        });

        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.edges.push(line);
    }

    setupEventListeners() {
        // Mouse move for hover
        this.renderer.domElement.addEventListener('mousemove', (e) => {
            this.onMouseMove(e);
        });

        // Click for selection
        this.renderer.domElement.addEventListener('click', (e) => {
            this.onMouseClick(e);
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }

    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Raycast for hover detection
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.nodes);

        if (intersects.length > 0) {
            const hoveredNode = intersects[0].object;

            if (this.hoveredNode !== hoveredNode) {
                // Reset previous hover
                if (this.hoveredNode && this.hoveredNode !== this.selectedNode) {
                    this.resetNodeAppearance(this.hoveredNode);
                }

                // Apply hover effect
                this.hoveredNode = hoveredNode;
                this.highlightNode(hoveredNode, 1.2);
                this.renderer.domElement.style.cursor = 'pointer';

                // Callback
                if (this.onNodeHover) {
                    this.onNodeHover(hoveredNode.userData.node);
                }
            }
        } else {
            if (this.hoveredNode && this.hoveredNode !== this.selectedNode) {
                this.resetNodeAppearance(this.hoveredNode);
            }
            this.hoveredNode = null;
            this.renderer.domElement.style.cursor = 'default';
        }
    }

    onMouseClick(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.nodes);

        if (intersects.length > 0) {
            const clickedNode = intersects[0].object;

            // Reset previous selection
            if (this.selectedNode) {
                this.resetNodeAppearance(this.selectedNode);
            }

            // Select new node
            this.selectedNode = clickedNode;
            this.highlightNode(clickedNode, 1.5);

            // Callback
            if (this.onNodeClick) {
                this.onNodeClick(clickedNode.userData.node);
            }
        }
    }

    highlightNode(node, scale) {
        node.scale.setScalar(scale);
        node.material.emissiveIntensity = 0.6;
    }

    resetNodeAppearance(node) {
        node.scale.setScalar(1);
        node.material.emissiveIntensity = 0.3;
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Update controls
        this.controls.update();

        // Auto-rotate if enabled
        if (this.autoRotate) {
            this.controls.autoRotate = true;
        } else {
            this.controls.autoRotate = false;
        }

        // Animate nodes (gentle pulse)
        const time = Date.now() * 0.001;
        this.nodes.forEach((node, index) => {
            const offset = index * 0.5;
            const scale = 1 + Math.sin(time + offset) * 0.05;
            if (node !== this.selectedNode && node !== this.hoveredNode) {
                node.children[0].scale.setScalar(scale); // Glow effect
            }
        });

        this.renderer.render(this.scene, this.camera);
    }

    // Public methods
    resetCamera() {
        this.camera.position.set(15, 10, 15);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
    }

    toggleAutoRotate() {
        this.autoRotate = !this.autoRotate;
        return this.autoRotate;
    }

    focusOnTopic(topicId) {
        const node = this.nodeObjects.get(topicId);
        if (!node) return;

        // Animate camera to node
        const targetPos = node.position.clone();
        targetPos.z += 5;

        this.animateCameraTo(targetPos);

        // Select node
        if (this.selectedNode) {
            this.resetNodeAppearance(this.selectedNode);
        }
        this.selectedNode = node;
        this.highlightNode(node, 1.5);

        if (this.onNodeClick) {
            this.onNodeClick(node.userData.node);
        }
    }

    animateCameraTo(targetPosition, duration = 1000) {
        const startPosition = this.camera.position.clone();
        const startTime = Date.now();

        const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease in-out
            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            this.camera.position.lerpVectors(startPosition, targetPosition, eased);
            this.camera.lookAt(0, 0, 0);

            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        };

        animateCamera();
    }

    filterByCategory(category, enabled = true) {
        this.nodes.forEach(nodeObject => {
            const node = nodeObject.userData.node;
            if (node.category === category) {
                nodeObject.visible = enabled;
            }
        });
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Clean up Three.js resources
        this.nodes.forEach(node => {
            node.geometry.dispose();
            node.material.dispose();
        });

        this.edges.forEach(edge => {
            edge.geometry.dispose();
            edge.material.dispose();
        });

        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
    }
}
