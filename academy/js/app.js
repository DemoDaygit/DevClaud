// ===== DECENTRALIZED AI ACADEMY - MAIN APPLICATION =====

import { Visualization3D } from './visualization.js';
import { TutorialSystem } from './tutorials.js';
import { TelegramIntegration } from './telegram.js';

export class AcademyApp {
    constructor() {
        this.currentView = 'explore';
        this.curriculum = null;
        this.visualization = null;
        this.tutorialSystem = null;
        this.telegram = null;
        this.userProgress = this.loadProgress();
    }

    async init() {
        console.log('🚀 Initializing Decentralized AI Academy...');

        try {
            // Load curriculum data
            await this.loadCurriculum();

            // Initialize visualization
            this.initVisualization();

            // Initialize tutorial system
            this.tutorialSystem = new TutorialSystem(this.curriculum);

            // Initialize Telegram integration
            this.telegram = new TelegramIntegration();

            // Setup event listeners
            this.setupEventListeners();

            // Render initial view
            this.renderView(this.currentView);

            // Hide loading screen
            this.hideLoading();

            console.log('✅ Academy initialized successfully!');
        } catch (error) {
            console.error('❌ Failed to initialize academy:', error);
            this.showError(error);
        }
    }

    async loadCurriculum() {
        this.updateLoading('Loading curriculum data...');

        // In production, this would load from curriculum.json
        // For now, using inline data
        this.curriculum = {
            paths: [
                {
                    id: 'swarm-basics',
                    title: '🐝 Swarm Intelligence Basics',
                    description: 'Learn the fundamentals of collective AI behavior',
                    difficulty: 'beginner',
                    duration: '2 hours',
                    topics: ['swarm-intelligence', 'multi-agent-systems', 'emergence']
                },
                {
                    id: 'federated-learning',
                    title: '🔐 Federated Learning Path',
                    description: 'Master decentralized machine learning',
                    difficulty: 'intermediate',
                    duration: '4 hours',
                    topics: ['federated-learning', 'fedavg', 'gradient-compression', 'privacy']
                },
                {
                    id: 'production-deployment',
                    title: '🚀 Production Deployment',
                    description: 'Deploy and scale distributed AI systems',
                    difficulty: 'advanced',
                    duration: '6 hours',
                    topics: ['ray-cluster', 'deepspeed', 'vllm', 'optimization']
                }
            ],
            topics: [
                {
                    id: 'swarm-intelligence',
                    title: 'Swarm Intelligence',
                    category: 'foundation',
                    description: 'Collective behavior of decentralized, self-organized systems',
                    position: { x: -5, y: 2, z: 0 },
                    color: '#667eea',
                    formula: 'SI = ∑(Agent_i × LocalRules) → GlobalBehavior',
                    code: `# Swarm Intelligence Example
class SwarmAgent:
    def __init__(self, position):
        self.position = np.array(position)
        self.velocity = np.random.randn(2) * 0.1

    def update(self, neighbors, target):
        # Cohesion: move toward center
        if len(neighbors) > 0:
            center = np.mean([n.position for n in neighbors], axis=0)
            cohesion = (center - self.position) * 0.01
        else:
            cohesion = np.zeros(2)

        # Alignment: match velocity
        if len(neighbors) > 0:
            avg_velocity = np.mean([n.velocity for n in neighbors], axis=0)
            alignment = (avg_velocity - self.velocity) * 0.05
        else:
            alignment = np.zeros(2)

        # Separation: avoid crowding
        separation = np.zeros(2)
        for n in neighbors:
            diff = self.position - n.position
            dist = np.linalg.norm(diff)
            if dist < 1.0 and dist > 0:
                separation += diff / (dist ** 2)

        # Attraction to target
        attraction = (target - self.position) * 0.005

        # Update velocity and position
        self.velocity += cohesion + alignment + separation + attraction
        self.velocity = np.clip(self.velocity, -0.5, 0.5)
        self.position += self.velocity

# Create swarm
swarm = [SwarmAgent([np.random.rand()*10, np.random.rand()*10]) for _ in range(50)]

# Simulate
for step in range(1000):
    target = np.array([5.0, 5.0])
    for agent in swarm:
        neighbors = [n for n in swarm if np.linalg.norm(n.position - agent.position) < 2.0]
        agent.update(neighbors, target)`,
                    resources: [
                        { title: 'Particle Swarm Optimization', url: 'https://en.wikipedia.org/wiki/Particle_swarm_optimization' },
                        { title: 'Swarm Intelligence Book', url: 'https://mitpress.mit.edu/books/swarm-intelligence' }
                    ]
                },
                {
                    id: 'federated-learning',
                    title: 'Federated Learning',
                    category: 'method',
                    description: 'Distributed ML training without centralizing data',
                    position: { x: 0, y: 0, z: 0 },
                    color: '#10b981',
                    formula: 'w_{t+1} = w_t - η × (1/K) × ∑_{k=1}^K ∇F_k(w_t)',
                    code: `# Federated Learning Implementation
import torch
import torch.nn as nn
import copy

class FederatedLearning:
    def __init__(self, model, clients, learning_rate=0.01):
        self.global_model = model
        self.clients = clients
        self.lr = learning_rate

    def train_round(self, num_local_epochs=5):
        """Execute one round of federated training"""
        client_weights = []
        client_sizes = []

        print(f"Starting federated round with {len(self.clients)} clients...")

        # Each client trains locally
        for i, client in enumerate(self.clients):
            print(f"  Client {i+1}/{len(self.clients)} training...")

            # Clone global model
            local_model = copy.deepcopy(self.global_model)
            optimizer = torch.optim.SGD(local_model.parameters(), lr=self.lr)
            criterion = nn.CrossEntropyLoss()

            # Local training
            local_model.train()
            for epoch in range(num_local_epochs):
                for batch_x, batch_y in client.data_loader:
                    optimizer.zero_grad()
                    outputs = local_model(batch_x)
                    loss = criterion(outputs, batch_y)
                    loss.backward()
                    optimizer.step()

            # Store weights
            client_weights.append(copy.deepcopy(local_model.state_dict()))
            client_sizes.append(len(client.data_loader.dataset))

        # Federated Averaging
        print("Aggregating models...")
        total_size = sum(client_sizes)
        global_dict = self.global_model.state_dict()

        for key in global_dict.keys():
            global_dict[key] = torch.stack([
                client_weights[i][key].float() * (client_sizes[i] / total_size)
                for i in range(len(self.clients))
            ]).sum(0)

        self.global_model.load_state_dict(global_dict)
        print("Round completed!")

    def evaluate(self, test_loader):
        """Evaluate global model"""
        self.global_model.eval()
        correct = 0
        total = 0

        with torch.no_grad():
            for batch_x, batch_y in test_loader:
                outputs = self.global_model(batch_x)
                _, predicted = torch.max(outputs.data, 1)
                total += batch_y.size(0)
                correct += (predicted == batch_y).sum().item()

        accuracy = 100 * correct / total
        print(f"Global model accuracy: {accuracy:.2f}%")
        return accuracy

# Usage
model = nn.Sequential(
    nn.Linear(784, 128),
    nn.ReLU(),
    nn.Linear(128, 10)
)

fl_system = FederatedLearning(model, clients=[client1, client2, client3])

for round in range(10):
    print(f"\\n=== Round {round+1}/10 ===")
    fl_system.train_round()
    fl_system.evaluate(test_loader)`,
                    resources: [
                        { title: 'Federated Learning Paper', url: 'https://arxiv.org/abs/1602.05629' },
                        { title: 'Flower Framework', url: 'https://flower.dev/' }
                    ]
                },
                {
                    id: 'ray-cluster',
                    title: 'Ray Cluster',
                    category: 'tool',
                    description: 'Distributed computing framework for Python',
                    position: { x: 5, y: 0, z: 2 },
                    color: '#f59e0b',
                    formula: 'ray.remote(func).remote(args) → Future[Result]',
                    code: `# Ray Cluster Distributed Training
import ray
from ray import tune
from ray.air import session
import torch

# Initialize Ray cluster
ray.init(address='auto')  # Connect to existing cluster
# ray.init(num_cpus=8, num_gpus=2)  # Local mode

@ray.remote(num_gpus=1)
class DistributedTrainer:
    def __init__(self, model_config):
        self.model = self.create_model(model_config)
        self.device = torch.device("cuda")
        self.model.to(self.device)

    def create_model(self, config):
        return torch.nn.Sequential(
            torch.nn.Linear(config['input_size'], config['hidden_size']),
            torch.nn.ReLU(),
            torch.nn.Linear(config['hidden_size'], config['output_size'])
        )

    def train_epoch(self, data, labels):
        self.model.train()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)
        criterion = torch.nn.CrossEntropyLoss()

        data = data.to(self.device)
        labels = labels.to(self.device)

        optimizer.zero_grad()
        outputs = self.model(data)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        return loss.item()

    def get_weights(self):
        return {k: v.cpu() for k, v in self.model.state_dict().items()}

# Create multiple trainers
config = {'input_size': 784, 'hidden_size': 128, 'output_size': 10}
trainers = [DistributedTrainer.remote(config) for _ in range(4)]

# Distribute training
futures = []
for trainer, (data, labels) in zip(trainers, data_batches):
    future = trainer.train_epoch.remote(data, labels)
    futures.append(future)

# Wait for completion
losses = ray.get(futures)
print(f"Average loss: {sum(losses)/len(losses):.4f}")

# Hyperparameter tuning with Ray Tune
def train_function(config):
    model = create_model(config)
    for epoch in range(10):
        loss, accuracy = train_epoch(model, config)
        session.report({"loss": loss, "accuracy": accuracy})

analysis = tune.run(
    train_function,
    config={
        "lr": tune.loguniform(1e-4, 1e-1),
        "batch_size": tune.choice([32, 64, 128]),
        "hidden_size": tune.choice([64, 128, 256])
    },
    num_samples=20,
    resources_per_trial={"gpu": 1}
)

best_config = analysis.get_best_config(metric="accuracy", mode="max")
print(f"Best config: {best_config}")`,
                    resources: [
                        { title: 'Ray Documentation', url: 'https://docs.ray.io/' },
                        { title: 'Ray Tune', url: 'https://docs.ray.io/en/latest/tune/index.html' }
                    ]
                }
            ],
            exercises: [
                {
                    id: 'ex1',
                    title: 'Build Your First Swarm',
                    difficulty: 'beginner',
                    description: 'Implement a basic particle swarm optimizer',
                    starterCode: `import numpy as np

class Particle:
    def __init__(self, bounds):
        # TODO: Initialize particle position and velocity
        pass

    def update(self, global_best):
        # TODO: Update particle based on PSO equations
        pass

# TODO: Create swarm and run optimization
`,
                    solution: `import numpy as np

class Particle:
    def __init__(self, bounds):
        self.position = np.random.uniform(bounds[0], bounds[1], size=2)
        self.velocity = np.random.randn(2) * 0.1
        self.best_position = self.position.copy()
        self.best_score = float('inf')

    def update(self, global_best, w=0.7, c1=1.5, c2=1.5):
        r1, r2 = np.random.rand(), np.random.rand()

        cognitive = c1 * r1 * (self.best_position - self.position)
        social = c2 * r2 * (global_best - self.position)

        self.velocity = w * self.velocity + cognitive + social
        self.position += self.velocity

def sphere_function(x):
    return np.sum(x**2)

swarm = [Particle((-10, 10)) for _ in range(30)]
global_best = swarm[0].position.copy()
global_best_score = float('inf')

for iteration in range(100):
    for particle in swarm:
        score = sphere_function(particle.position)

        if score < particle.best_score:
            particle.best_score = score
            particle.best_position = particle.position.copy()

        if score < global_best_score:
            global_best_score = score
            global_best = particle.position.copy()

    for particle in swarm:
        particle.update(global_best)

    if iteration % 10 == 0:
        print(f"Iteration {iteration}: Best score = {global_best_score:.6f}")

print(f"\\nOptimum found at: {global_best}")
print(f"Function value: {global_best_score:.6f}")`
                }
            ]
        };

        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
    }

    initVisualization() {
        this.updateLoading('Initializing 3D visualization...');
        const container = document.getElementById('scene-container');
        this.visualization = new Visualization3D(container, this.curriculum.topics);
        this.visualization.onTopicClick = (topic) => this.showTopicDetails(topic);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });

        // Visualization controls
        document.getElementById('reset-camera')?.addEventListener('click', () => {
            this.visualization?.resetCamera();
        });

        document.getElementById('auto-rotate')?.addEventListener('click', () => {
            this.visualization?.toggleAutoRotate();
        });

        document.getElementById('fullscreen')?.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Theme toggle
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Telegram connect
        document.getElementById('telegram-connect')?.addEventListener('click', () => {
            this.telegram?.connect();
        });
    }

    switchView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === `view-${viewName}`);
        });

        this.currentView = viewName;
        this.renderView(viewName);
    }

    renderView(viewName) {
        switch (viewName) {
            case 'explore':
                this.renderExploreView();
                break;
            case 'learn':
                this.renderLearnView();
                break;
            case 'practice':
                this.renderPracticeView();
                break;
            case 'community':
                this.renderCommunityView();
                break;
        }
    }

    renderExploreView() {
        // Render learning paths
        const pathsContainer = document.getElementById('learning-paths');
        pathsContainer.innerHTML = this.curriculum.paths.map(path => `
            <div class="path-item" data-path="${path.id}">
                <div style="font-weight: 600; margin-bottom: 4px;">${path.title}</div>
                <div style="font-size: 0.85rem; color: var(--text-tertiary);">${path.duration}</div>
            </div>
        `).join('');

        // Render filters
        const filtersContainer = document.getElementById('topic-filters');
        const categories = [...new Set(this.curriculum.topics.map(t => t.category))];
        filtersContainer.innerHTML = categories.map(cat => `
            <div class="filter-item" data-category="${cat}">
                <input type="checkbox" id="filter-${cat}" checked>
                <label for="filter-${cat}">${cat}</label>
            </div>
        `).join('');

        // Update progress
        this.updateProgressStats();
    }

    renderLearnView() {
        const grid = document.getElementById('course-grid');
        grid.innerHTML = this.curriculum.paths.map(path => {
            const progress = this.userProgress[path.id] || 0;
            return `
                <div class="course-card" data-course="${path.id}">
                    <div class="course-icon">📚</div>
                    <h3>${path.title}</h3>
                    <p>${path.description}</p>
                    <div class="course-meta">
                        <span>⏱️ ${path.duration}</span>
                        <span>📊 ${path.difficulty}</span>
                    </div>
                    <div class="course-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div style="margin-top: 8px; font-size: 0.85rem; color: var(--text-tertiary);">
                            ${progress}% Complete
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderPracticeView() {
        const exerciseList = document.getElementById('exercise-list');
        exerciseList.innerHTML = this.curriculum.exercises.map((ex, i) => `
            <div class="exercise-item ${this.userProgress.completedExercises?.includes(ex.id) ? 'completed' : ''}"
                 data-exercise="${ex.id}">
                <div style="font-weight: 600;">${i + 1}. ${ex.title}</div>
                <div style="font-size: 0.85rem; color: var(--text-tertiary); margin-top: 4px;">
                    ${ex.difficulty}
                </div>
            </div>
        `).join('');
    }

    renderCommunityView() {
        // Activity feed would come from backend in production
        const activityFeed = document.getElementById('activity-feed');
        if (activityFeed) {
            activityFeed.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <p>Connect your Telegram to see community activity</p>
                </div>
            `;
        }
    }

    showTopicDetails(topic) {
        const detailsContainer = document.getElementById('topic-details');
        detailsContainer.innerHTML = `
            <div style="padding: 24px;">
                <h2 style="font-size: 1.8rem; margin-bottom: 12px; color: ${topic.color};">
                    ${topic.title}
                </h2>
                <div style="color: var(--text-secondary); margin-bottom: 24px;">
                    ${topic.description}
                </div>

                <div style="margin-bottom: 24px;">
                    <h3 style="font-size: 1rem; margin-bottom: 12px;">📐 Formula</h3>
                    <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 8px; font-family: var(--font-mono);">
                        ${topic.formula}
                    </div>
                </div>

                <div style="margin-bottom: 24px;">
                    <h3 style="font-size: 1rem; margin-bottom: 12px;">💻 Code Example</h3>
                    <div style="background: var(--bg-primary); padding: 16px; border-radius: 8px; max-height: 400px; overflow-y: auto;">
                        <pre style="font-family: var(--font-mono); font-size: 0.85rem; line-height: 1.5; color: var(--text-secondary);">${this.escapeHtml(topic.code)}</pre>
                    </div>
                </div>

                <div>
                    <h3 style="font-size: 1rem; margin-bottom: 12px;">📚 Resources</h3>
                    ${topic.resources.map(r => `
                        <a href="${r.url}" target="_blank" style="display: block; padding: 12px; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 8px; color: var(--primary); text-decoration: none;">
                            🔗 ${r.title}
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    updateProgressStats() {
        const completed = this.userProgress.completedTopics?.length || 0;
        const total = this.curriculum.topics.length;
        const inProgress = this.userProgress.inProgress?.length || 0;

        document.getElementById('completed-count').textContent = `${completed}/${total}`;
        document.getElementById('progress-count').textContent = inProgress;
    }

    loadProgress() {
        const saved = localStorage.getItem('academy-progress');
        return saved ? JSON.parse(saved) : {
            completedTopics: [],
            completedExercises: [],
            inProgress: []
        };
    }

    saveProgress() {
        localStorage.setItem('academy-progress', JSON.stringify(this.userProgress));
    }

    toggleTheme() {
        // Theme toggle would be implemented here
        console.log('Theme toggle clicked');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    updateLoading(message) {
        const messageEl = document.getElementById('loading-message');
        if (messageEl) messageEl.textContent = message;
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }
    }

    showError(error) {
        console.error(error);
        alert('Failed to initialize academy. Please refresh the page.');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
