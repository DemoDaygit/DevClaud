"""
Swarm Intelligence Implementation
Particle Swarm Optimization (PSO) for function optimization
"""

import numpy as np
import matplotlib.pyplot as plt
from typing import Callable, Tuple

class Particle:
    """Individual particle in the swarm"""

    def __init__(self, dimensions: int, bounds: Tuple[float, float]):
        self.position = np.random.uniform(bounds[0], bounds[1], dimensions)
        self.velocity = np.random.uniform(-1, 1, dimensions)
        self.best_position = self.position.copy()
        self.best_score = float('inf')

    def update_velocity(self, global_best_position: np.ndarray,
                       w: float = 0.7, c1: float = 1.5, c2: float = 1.5):
        """Update particle velocity using PSO formula"""
        r1, r2 = np.random.random(2)

        cognitive = c1 * r1 * (self.best_position - self.position)
        social = c2 * r2 * (global_best_position - self.position)

        self.velocity = w * self.velocity + cognitive + social

    def update_position(self, bounds: Tuple[float, float]):
        """Update particle position with boundary checking"""
        self.position += self.velocity
        self.position = np.clip(self.position, bounds[0], bounds[1])


class SwarmOptimizer:
    """Particle Swarm Optimization algorithm"""

    def __init__(self, objective_function: Callable,
                 dimensions: int = 2,
                 n_particles: int = 30,
                 bounds: Tuple[float, float] = (-10, 10)):
        self.objective_function = objective_function
        self.dimensions = dimensions
        self.n_particles = n_particles
        self.bounds = bounds

        # Initialize swarm
        self.particles = [Particle(dimensions, bounds) for _ in range(n_particles)]

        # Global best
        self.global_best_position = None
        self.global_best_score = float('inf')

        # History for visualization
        self.history = []

    def optimize(self, max_iterations: int = 100) -> Tuple[np.ndarray, float]:
        """Run PSO optimization"""

        for iteration in range(max_iterations):
            # Evaluate all particles
            for particle in self.particles:
                score = self.objective_function(particle.position)

                # Update personal best
                if score < particle.best_score:
                    particle.best_score = score
                    particle.best_position = particle.position.copy()

                # Update global best
                if score < self.global_best_score:
                    self.global_best_score = score
                    self.global_best_position = particle.position.copy()

            # Update all particles
            for particle in self.particles:
                particle.update_velocity(self.global_best_position)
                particle.update_position(self.bounds)

            # Store history
            self.history.append({
                'iteration': iteration,
                'best_score': self.global_best_score,
                'positions': [p.position.copy() for p in self.particles]
            })

            # Print progress
            if iteration % 10 == 0:
                print(f"Iteration {iteration}: Best score = {self.global_best_score:.6f}")

        return self.global_best_position, self.global_best_score


# Example objective functions
def sphere_function(x: np.ndarray) -> float:
    """Simple sphere function: f(x) = sum(x^2)"""
    return np.sum(x**2)

def rastrigin_function(x: np.ndarray) -> float:
    """Rastrigin function: complex multimodal function"""
    n = len(x)
    return 10 * n + np.sum(x**2 - 10 * np.cos(2 * np.pi * x))

def rosenbrock_function(x: np.ndarray) -> float:
    """Rosenbrock function: valley-shaped function"""
    return np.sum(100 * (x[1:] - x[:-1]**2)**2 + (1 - x[:-1])**2)


# Demo usage
if __name__ == "__main__":
    print("🐝 Particle Swarm Optimization Demo\n")

    # Problem 1: Sphere function
    print("=" * 50)
    print("Problem 1: Sphere Function (Global minimum at origin)")
    print("=" * 50)

    optimizer = SwarmOptimizer(
        objective_function=sphere_function,
        dimensions=5,
        n_particles=30,
        bounds=(-10, 10)
    )

    best_position, best_score = optimizer.optimize(max_iterations=50)

    print(f"\n✅ Optimization Complete!")
    print(f"Best position: {best_position}")
    print(f"Best score: {best_score:.10f}")
    print(f"Expected: [0, 0, 0, 0, 0] with score 0.0")

    # Problem 2: Rastrigin function
    print("\n" + "=" * 50)
    print("Problem 2: Rastrigin Function (Multimodal)")
    print("=" * 50)

    optimizer2 = SwarmOptimizer(
        objective_function=rastrigin_function,
        dimensions=3,
        n_particles=50,
        bounds=(-5.12, 5.12)
    )

    best_position2, best_score2 = optimizer2.optimize(max_iterations=100)

    print(f"\n✅ Optimization Complete!")
    print(f"Best position: {best_position2}")
    print(f"Best score: {best_score2:.10f}")
    print(f"Expected: [0, 0, 0] with score 0.0")

    # Visualization (if matplotlib available)
    try:
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

        # Plot 1: Convergence curve
        iterations = [h['iteration'] for h in optimizer.history]
        scores = [h['best_score'] for h in optimizer.history]
        ax1.plot(iterations, scores, 'b-', linewidth=2)
        ax1.set_xlabel('Iteration')
        ax1.set_ylabel('Best Score')
        ax1.set_title('PSO Convergence (Sphere Function)')
        ax1.grid(True, alpha=0.3)
        ax1.set_yscale('log')

        # Plot 2: Particle positions over time (2D projection)
        colors = plt.cm.viridis(np.linspace(0, 1, len(optimizer.history)))
        for i, history in enumerate(optimizer.history[::10]):  # Every 10th iteration
            positions = np.array(history['positions'])
            ax2.scatter(positions[:, 0], positions[:, 1],
                       c=[colors[i]], alpha=0.6, s=30)

        ax2.set_xlabel('Dimension 1')
        ax2.set_ylabel('Dimension 2')
        ax2.set_title('Particle Movement (2D Projection)')
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.savefig('pso_results.png', dpi=150, bbox_inches='tight')
        print("\n📊 Visualization saved to 'pso_results.png'")

    except Exception as e:
        print(f"\n⚠️  Could not create visualization: {e}")

    print("\n" + "=" * 50)
    print("🎓 Key Concepts:")
    print("=" * 50)
    print("1. Swarm Intelligence: Collective behavior emerges from simple rules")
    print("2. Exploration vs Exploitation: Balance between searching new areas and refining known solutions")
    print("3. Social Learning: Particles learn from personal and global best positions")
    print("4. No Gradient Required: Works for non-differentiable functions")
    print("5. Parallelizable: Each particle can be evaluated independently")
