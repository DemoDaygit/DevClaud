# 🎓 Decentralized AI Academy - Code Examples

Comprehensive, working examples demonstrating key concepts in Decentralized AI.

## 📚 Available Examples

### 1. Swarm Intelligence (`swarm-intelligence.py`)

**Particle Swarm Optimization (PSO)** - A nature-inspired optimization algorithm.

```bash
python swarm-intelligence.py
```

**What you'll learn:**
- How swarm intelligence emerges from simple rules
- PSO algorithm implementation from scratch
- Optimization of complex functions
- Balance between exploration and exploitation

**Key Concepts:**
- Collective behavior
- Social learning
- No gradient required
- Parallelizable computation

---

### 2. Federated Learning (`federated-learning.py`)

**Privacy-Preserving Distributed Machine Learning** - Train models without sharing data.

```bash
python federated-learning.py
```

**What you'll learn:**
- Federated Averaging (FedAvg) algorithm
- Training on distributed, private datasets
- Client-server architecture
- Model aggregation techniques

**Key Concepts:**
- Data privacy preservation
- Decentralized training
- Communication efficiency
- Handling non-IID data

---

### 3. Multi-Agent Systems (`multi-agent-system.py`)

**Collaborative Task Solving** - Autonomous agents working together.

```bash
python multi-agent-system.py
```

**What you'll learn:**
- Agent-based architecture
- Inter-agent communication
- Task assignment and coordination
- Role-based specialization

**Key Concepts:**
- Autonomy and independence
- Collaboration patterns
- Message passing
- Emergent behavior

---

### 4. Ray Cluster (`ray-cluster-distributed.py`)

**Distributed Computing with Ray** - Scale your AI workloads.

```bash
# Install Ray first
pip install ray[default]

# Run the example
python ray-cluster-distributed.py
```

**What you'll learn:**
- Distributed task execution
- Actor-based programming
- MapReduce with Ray
- Distributed data processing

**Key Concepts:**
- Parallel execution
- Stateful actors
- Object store
- Automatic scheduling

---

## 🚀 Getting Started

### Prerequisites

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install numpy matplotlib
```

### Optional Dependencies

For specific examples:

```bash
# For Ray examples
pip install ray[default]

# For visualization
pip install matplotlib seaborn

# For federated learning with PyTorch
pip install torch torchvision

# For advanced examples
pip install scikit-learn pandas
```

---

## 📊 Output

Each example produces:

1. **Console Output**: Detailed logs showing algorithm progress
2. **Visualizations**: Charts and graphs (saved as PNG files)
3. **Performance Metrics**: Timing, accuracy, convergence statistics

---

## 🏗️ Project Structure

```
examples/
├── README.md                          # This file
├── swarm-intelligence.py              # PSO implementation
├── federated-learning.py              # FedAvg implementation
├── multi-agent-system.py              # MAS implementation
└── ray-cluster-distributed.py         # Ray distributed computing
```

---

## 💡 Usage Tips

### Modifying Parameters

Each example has configurable parameters at the top of the `__main__` block:

```python
# Example: Swarm Intelligence
optimizer = SwarmOptimizer(
    objective_function=sphere_function,
    dimensions=5,          # Change this
    n_particles=30,        # Change this
    bounds=(-10, 10)      # Change this
)
```

### Running on Your Data

Replace the synthetic data generation with your own datasets:

```python
# Federated Learning example
# Instead of:
self.X = np.random.randn(data_size, 1) * 2
self.y = 3 * self.X + 2 + noise

# Use:
self.X = your_features
self.y = your_labels
```

### Visualization

All examples support visualization. If `matplotlib` is not installed, examples will still run and display text output.

---

## 🔬 Extending the Examples

### Adding New Objective Functions

**swarm-intelligence.py:**

```python
def your_custom_function(x: np.ndarray) -> float:
    """Your custom optimization target"""
    return your_calculation(x)

optimizer = SwarmOptimizer(
    objective_function=your_custom_function,
    # ... other params
)
```

### Adding New Agent Roles

**multi-agent-system.py:**

```python
class AgentRole(Enum):
    EXPLORER = "explorer"
    ANALYZER = "analyzer"
    YOUR_ROLE = "your_role"  # Add here
```

### Custom Federated Aggregation

**federated-learning.py:**

```python
def custom_aggregation(self, weights, biases, sizes):
    """Your custom aggregation strategy"""
    # Implement your logic
    return aggregated_weights, aggregated_biases
```

---

## 🎯 Learning Path

**Recommended Order:**

1. **Start with Swarm Intelligence** - Simplest concept, visualizes well
2. **Move to Multi-Agent Systems** - Builds on swarm concepts
3. **Then Federated Learning** - Combines ML with decentralization
4. **Finish with Ray Cluster** - Production-ready distributed systems

---

## 🐛 Troubleshooting

### Common Issues

**Import Errors:**
```bash
# Install missing packages
pip install numpy matplotlib
```

**Ray Connection Issues:**
```python
# Use local mode
ray.init(local_mode=True)
```

**Out of Memory:**
```python
# Reduce dataset size or batch size
data_size = 50  # Instead of 100
n_particles = 15  # Instead of 30
```

---

## 📖 Additional Resources

### Documentation

- **Ray**: https://docs.ray.io
- **Federated Learning**: https://federated.withgoogle.com
- **Swarm Intelligence**: https://en.wikipedia.org/wiki/Swarm_intelligence

### Research Papers

- **PSO**: Kennedy & Eberhart (1995) - "Particle Swarm Optimization"
- **FedAvg**: McMahan et al. (2017) - "Communication-Efficient Learning of Deep Networks from Decentralized Data"
- **Multi-Agent**: Wooldridge (2009) - "An Introduction to MultiAgent Systems"

### Tutorials

- Ray Tutorial: https://github.com/ray-project/tutorial
- Federated Learning Tutorial: https://flower.dev/docs/
- PSO Tutorial: https://nathanrooy.github.io/posts/2016-08-17/simple-particle-swarm-optimization-with-python/

---

## 🤝 Contributing

Found a bug or want to add an example?

1. Fork the repository
2. Create a feature branch
3. Add your example with proper documentation
4. Submit a pull request

---

## 📝 License

These examples are provided for educational purposes. Feel free to use and modify them for your projects.

---

## 💬 Community

- **GitHub**: [DemoDaygit/DevClaud](https://github.com/DemoDaygit/DevClaud)
- **Telegram Channel**: Join for discussions and updates
- **Issues**: Report bugs or request features on GitHub

---

**Built with ❤️ for the Decentralized AI Community**
