"""
Federated Learning Implementation
Simple demonstration of federated averaging for distributed ML
"""

import numpy as np
from typing import List, Dict
import copy

class LocalClient:
    """Simulates a local client with private data"""

    def __init__(self, client_id: int, data_size: int = 100):
        self.client_id = client_id
        self.data_size = data_size

        # Generate synthetic data (linear regression: y = 3x + 2 + noise)
        self.X = np.random.randn(data_size, 1) * 2
        self.y = 3 * self.X + 2 + np.random.randn(data_size, 1) * 0.5

        # Local model parameters (weight and bias)
        self.weights = np.random.randn(1, 1)
        self.bias = np.random.randn(1)

        # Training history
        self.loss_history = []

    def train_local_epoch(self, global_weights: np.ndarray, global_bias: np.ndarray,
                         learning_rate: float = 0.01, epochs: int = 5):
        """Train local model for several epochs"""

        # Start with global model
        self.weights = copy.deepcopy(global_weights)
        self.bias = copy.deepcopy(global_bias)

        for epoch in range(epochs):
            # Forward pass
            predictions = self.X @ self.weights + self.bias

            # Compute loss (MSE)
            loss = np.mean((predictions - self.y) ** 2)
            self.loss_history.append(loss)

            # Backward pass (gradient descent)
            d_weights = 2 * self.X.T @ (predictions - self.y) / self.data_size
            d_bias = 2 * np.mean(predictions - self.y)

            # Update parameters
            self.weights -= learning_rate * d_weights
            self.bias -= learning_rate * d_bias

        return self.weights, self.bias, loss

    def evaluate(self) -> float:
        """Evaluate current model on local data"""
        predictions = self.X @ self.weights + self.bias
        loss = np.mean((predictions - self.y) ** 2)
        return loss


class FederatedServer:
    """Central server coordinating federated learning"""

    def __init__(self, n_clients: int):
        self.n_clients = n_clients

        # Initialize global model
        self.global_weights = np.random.randn(1, 1)
        self.global_bias = np.random.randn(1)

        # Create clients
        self.clients: List[LocalClient] = [
            LocalClient(client_id=i) for i in range(n_clients)
        ]

        # Training history
        self.global_loss_history = []

    def federated_averaging(self, client_weights: List[np.ndarray],
                          client_biases: List[np.ndarray]) -> None:
        """Aggregate client models using FedAvg algorithm"""

        # Simple average (assumes equal data distribution)
        self.global_weights = np.mean(client_weights, axis=0)
        self.global_bias = np.mean(client_biases, axis=0)

    def weighted_federated_averaging(self, client_weights: List[np.ndarray],
                                    client_biases: List[np.ndarray],
                                    client_sizes: List[int]) -> None:
        """Aggregate with weights proportional to dataset size"""

        total_size = sum(client_sizes)
        weights_array = np.array(client_weights)
        biases_array = np.array(client_biases)

        # Weighted average
        weight_coeffs = np.array(client_sizes).reshape(-1, 1, 1) / total_size
        bias_coeffs = np.array(client_sizes) / total_size

        self.global_weights = np.sum(weights_array * weight_coeffs, axis=0)
        self.global_bias = np.sum(biases_array * bias_coeffs)

    def train_round(self, learning_rate: float = 0.01,
                   local_epochs: int = 5,
                   client_fraction: float = 1.0) -> float:
        """Execute one round of federated training"""

        # Select clients for this round
        n_selected = max(1, int(self.n_clients * client_fraction))
        selected_clients = np.random.choice(self.clients, n_selected, replace=False)

        # Train selected clients
        client_weights = []
        client_biases = []
        client_sizes = []
        client_losses = []

        for client in selected_clients:
            weights, bias, loss = client.train_local_epoch(
                self.global_weights,
                self.global_bias,
                learning_rate,
                local_epochs
            )

            client_weights.append(weights)
            client_biases.append(bias)
            client_sizes.append(client.data_size)
            client_losses.append(loss)

        # Aggregate models
        self.weighted_federated_averaging(client_weights, client_biases, client_sizes)

        # Compute average loss
        avg_loss = np.mean(client_losses)
        self.global_loss_history.append(avg_loss)

        return avg_loss

    def evaluate_all_clients(self) -> Dict[str, float]:
        """Evaluate global model on all clients"""

        # Update all clients with global model
        for client in self.clients:
            client.weights = copy.deepcopy(self.global_weights)
            client.bias = copy.deepcopy(self.global_bias)

        # Evaluate
        client_losses = [client.evaluate() for client in self.clients]

        return {
            'mean_loss': np.mean(client_losses),
            'std_loss': np.std(client_losses),
            'min_loss': np.min(client_losses),
            'max_loss': np.max(client_losses)
        }


# Demo usage
if __name__ == "__main__":
    print("🌐 Federated Learning Demo\n")
    print("=" * 60)
    print("Scenario: 10 clients collaboratively learning y = 3x + 2")
    print("Without sharing their private datasets")
    print("=" * 60)

    # Initialize federated learning system
    server = FederatedServer(n_clients=10)

    print(f"\n📊 Initial Global Model:")
    print(f"   Weights: {server.global_weights.flatten()}")
    print(f"   Bias: {server.global_bias.flatten()}")

    # Initial evaluation
    initial_metrics = server.evaluate_all_clients()
    print(f"\n📉 Initial Performance:")
    print(f"   Mean Loss: {initial_metrics['mean_loss']:.4f}")
    print(f"   Std Loss: {initial_metrics['std_loss']:.4f}")

    # Training
    print("\n🔄 Starting Federated Training...\n")

    n_rounds = 20
    for round_num in range(n_rounds):
        avg_loss = server.train_round(
            learning_rate=0.05,
            local_epochs=5,
            client_fraction=0.7  # 70% clients participate each round
        )

        if round_num % 5 == 0:
            metrics = server.evaluate_all_clients()
            print(f"Round {round_num:2d} | "
                  f"Avg Loss: {avg_loss:.4f} | "
                  f"Global Eval: {metrics['mean_loss']:.4f} ± {metrics['std_loss']:.4f}")

    # Final evaluation
    print("\n" + "=" * 60)
    print("✅ Training Complete!")
    print("=" * 60)

    final_metrics = server.evaluate_all_clients()

    print(f"\n🎯 Final Global Model:")
    print(f"   Weights: {server.global_weights.flatten()[0]:.4f} (expected: 3.0)")
    print(f"   Bias: {server.global_bias[0]:.4f} (expected: 2.0)")

    print(f"\n📊 Final Performance:")
    print(f"   Mean Loss: {final_metrics['mean_loss']:.4f}")
    print(f"   Std Loss: {final_metrics['std_loss']:.4f}")
    print(f"   Loss Range: [{final_metrics['min_loss']:.4f}, {final_metrics['max_loss']:.4f}]")

    improvement = ((initial_metrics['mean_loss'] - final_metrics['mean_loss']) /
                   initial_metrics['mean_loss'] * 100)
    print(f"\n📈 Improvement: {improvement:.1f}% reduction in loss")

    print("\n" + "=" * 60)
    print("🎓 Key Concepts of Federated Learning:")
    print("=" * 60)
    print("1. Privacy Preservation: Raw data never leaves client devices")
    print("2. Federated Averaging: Aggregate model updates, not data")
    print("3. Decentralized Training: Each client trains independently")
    print("4. Communication Efficiency: Only model parameters are shared")
    print("5. Heterogeneity: Handles non-IID data distributions across clients")

    print("\n" + "=" * 60)
    print("🔒 Privacy Guarantees:")
    print("=" * 60)
    print("✅ Data stays on client devices")
    print("✅ Only model updates are transmitted")
    print("✅ Can be enhanced with Differential Privacy")
    print("✅ Can be enhanced with Secure Aggregation")

    print("\n" + "=" * 60)
    print("⚙️  Applications:")
    print("=" * 60)
    print("• Mobile keyboard prediction (Google Gboard)")
    print("• Healthcare: Disease prediction without sharing patient data")
    print("• Finance: Fraud detection across banks")
    print("• IoT: Smart home devices learning user preferences")

    # Visualization
    try:
        import matplotlib.pyplot as plt

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

        # Plot 1: Training convergence
        ax1.plot(server.global_loss_history, 'b-', linewidth=2, label='Federated Training')
        ax1.set_xlabel('Communication Round')
        ax1.set_ylabel('Average Loss')
        ax1.set_title('Federated Learning Convergence')
        ax1.grid(True, alpha=0.3)
        ax1.legend()

        # Plot 2: Individual client losses
        for i, client in enumerate(server.clients[:5]):  # Show first 5 clients
            ax2.plot(client.loss_history, alpha=0.7, label=f'Client {i+1}')

        ax2.set_xlabel('Local Training Step')
        ax2.set_ylabel('Loss')
        ax2.set_title('Individual Client Training Curves')
        ax2.grid(True, alpha=0.3)
        ax2.legend()

        plt.tight_layout()
        plt.savefig('federated_learning_results.png', dpi=150, bbox_inches='tight')
        print("\n📊 Visualization saved to 'federated_learning_results.png'")

    except ImportError:
        print("\n⚠️  Install matplotlib for visualization")
