"""
Ray Cluster - Distributed Computing Example
Demonstrates parallel processing, distributed training, and actor-based systems
"""

import ray
import numpy as np
import time
from typing import List, Dict
import psutil

# Initialize Ray
# For local testing: ray.init()
# For cluster: ray.init(address='auto')

def demonstrate_ray_basics():
    """Basic Ray operations"""
    print("=" * 70)
    print("1️⃣  Ray Basics: Remote Functions (@ray.remote)")
    print("=" * 70)

    @ray.remote
    def slow_function(x: int) -> int:
        """Simulate a compute-intensive task"""
        time.sleep(1)
        return x * x

    # Sequential execution (slow)
    print("\n📊 Sequential Execution:")
    start = time.time()
    results_seq = []
    for i in range(4):
        results_seq.append(slow_function.__wrapped__(i))  # Call without Ray
    sequential_time = time.time() - start
    print(f"   Results: {results_seq}")
    print(f"   Time: {sequential_time:.2f}s")

    # Parallel execution with Ray (fast!)
    print("\n⚡ Parallel Execution with Ray:")
    start = time.time()
    futures = [slow_function.remote(i) for i in range(4)]
    results_parallel = ray.get(futures)
    parallel_time = time.time() - start
    print(f"   Results: {results_parallel}")
    print(f"   Time: {parallel_time:.2f}s")
    print(f"   🚀 Speedup: {sequential_time/parallel_time:.2f}x")


def demonstrate_ray_actors():
    """Ray Actors for stateful computation"""
    print("\n" + "=" * 70)
    print("2️⃣  Ray Actors: Stateful Distributed Objects")
    print("=" * 70)

    @ray.remote
    class ParameterServer:
        """Distributed parameter server for model training"""

        def __init__(self, dim: int):
            self.params = np.zeros(dim)
            self.num_updates = 0

        def get_params(self) -> np.ndarray:
            """Get current parameters"""
            return self.params

        def update_params(self, gradients: np.ndarray):
            """Apply gradient update"""
            self.params -= 0.1 * gradients
            self.num_updates += 1

        def get_stats(self) -> Dict:
            """Get server statistics"""
            return {
                'num_updates': self.num_updates,
                'param_norm': np.linalg.norm(self.params)
            }

    @ray.remote
    class Worker:
        """Distributed worker for training"""

        def __init__(self, worker_id: int):
            self.worker_id = worker_id
            self.iterations = 0

        def compute_gradients(self, params: np.ndarray, data_batch: np.ndarray) -> np.ndarray:
            """Compute gradients on local data"""
            # Simulate gradient computation
            gradients = np.random.randn(*params.shape) * 0.01
            self.iterations += 1
            return gradients

        def get_stats(self) -> Dict:
            return {
                'worker_id': self.worker_id,
                'iterations': self.iterations
            }

    # Create parameter server
    print("\n🖥️  Creating distributed system...")
    ps = ParameterServer.remote(dim=100)
    print("   ✅ Parameter Server initialized")

    # Create workers
    num_workers = 4
    workers = [Worker.remote(i) for i in range(num_workers)]
    print(f"   ✅ {num_workers} Workers initialized")

    # Training loop
    print("\n🔄 Running distributed training...")
    num_iterations = 10

    for iteration in range(num_iterations):
        # Get current parameters
        params = ray.get(ps.get_params.remote())

        # Workers compute gradients in parallel
        dummy_data = np.random.randn(100)
        gradient_futures = [
            worker.compute_gradients.remote(params, dummy_data)
            for worker in workers
        ]

        # Wait for all gradients
        gradients = ray.get(gradient_futures)

        # Average gradients
        avg_gradient = np.mean(gradients, axis=0)

        # Update parameter server
        ps.update_params.remote(avg_gradient)

        if iteration % 3 == 0:
            stats = ray.get(ps.get_stats.remote())
            print(f"   Iteration {iteration}: Updates={stats['num_updates']}, "
                  f"Param Norm={stats['param_norm']:.4f}")

    # Final statistics
    print("\n📊 Final Statistics:")
    ps_stats = ray.get(ps.get_stats.remote())
    print(f"   Parameter Server: {ps_stats['num_updates']} total updates")

    worker_stats = ray.get([w.get_stats.remote() for w in workers])
    for stats in worker_stats:
        print(f"   Worker {stats['worker_id']}: {stats['iterations']} iterations")


def demonstrate_distributed_map_reduce():
    """MapReduce-style computation with Ray"""
    print("\n" + "=" * 70)
    print("3️⃣  Distributed MapReduce: Word Count Example")
    print("=" * 70)

    @ray.remote
    def map_function(document: str) -> Dict[str, int]:
        """Map: document -> word counts"""
        words = document.lower().split()
        word_counts = {}
        for word in words:
            word_counts[word] = word_counts.get(word, 0) + 1
        return word_counts

    @ray.remote
    def reduce_function(word_counts_list: List[Dict[str, int]]) -> Dict[str, int]:
        """Reduce: merge word counts"""
        merged = {}
        for word_counts in word_counts_list:
            for word, count in word_counts.items():
                merged[word] = merged.get(word, 0) + count
        return merged

    # Sample documents
    documents = [
        "distributed computing with ray is powerful and scalable",
        "ray enables distributed machine learning and reinforcement learning",
        "scalable distributed systems with ray actors and tasks",
        "machine learning at scale with distributed ray clusters",
    ]

    print(f"\n📄 Processing {len(documents)} documents...")

    # Map phase (parallel)
    start = time.time()
    map_futures = [map_function.remote(doc) for doc in documents]
    word_counts_list = ray.get(map_futures)
    map_time = time.time() - start

    print(f"   ✅ Map phase completed in {map_time:.3f}s")

    # Reduce phase
    start = time.time()
    final_counts = ray.get(reduce_function.remote(word_counts_list))
    reduce_time = time.time() - start

    print(f"   ✅ Reduce phase completed in {reduce_time:.3f}s")

    # Display results
    print("\n📊 Top 10 Words:")
    sorted_words = sorted(final_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    for word, count in sorted_words:
        print(f"   {word:15s}: {count}")


def demonstrate_distributed_data_processing():
    """Distributed data processing with Ray"""
    print("\n" + "=" * 70)
    print("4️⃣  Distributed Data Processing: Large Dataset Handling")
    print("=" * 70)

    @ray.remote
    def process_batch(batch_id: int, data: np.ndarray) -> Dict:
        """Process a batch of data"""
        return {
            'batch_id': batch_id,
            'mean': np.mean(data),
            'std': np.std(data),
            'min': np.min(data),
            'max': np.max(data),
            'size': len(data)
        }

    # Generate large dataset
    print("\n📊 Generating large dataset...")
    total_size = 1_000_000
    batch_size = 100_000
    num_batches = total_size // batch_size

    # Split into batches and process in parallel
    print(f"   Processing {num_batches} batches in parallel...")
    start = time.time()

    futures = []
    for i in range(num_batches):
        batch_data = np.random.randn(batch_size)
        futures.append(process_batch.remote(i, batch_data))

    results = ray.get(futures)
    processing_time = time.time() - start

    print(f"   ✅ Processed {total_size:,} samples in {processing_time:.2f}s")
    print(f"   ⚡ Throughput: {total_size/processing_time:,.0f} samples/second")

    # Aggregate statistics
    print("\n📈 Aggregated Statistics:")
    overall_mean = np.mean([r['mean'] for r in results])
    overall_std = np.mean([r['std'] for r in results])
    print(f"   Overall Mean: {overall_mean:.4f}")
    print(f"   Overall Std:  {overall_std:.4f}")


def main():
    """Main demo function"""
    print("\n" + "🚀" * 35)
    print("Ray Cluster - Distributed Computing Demo")
    print("🚀" * 35)

    # Check if Ray is already initialized
    if not ray.is_initialized():
        print("\n🔧 Initializing Ray...")
        ray.init(ignore_reinit_error=True)

    # Get cluster info
    print("\n📊 Ray Cluster Info:")
    print(f"   Nodes: {len(ray.nodes())}")
    print(f"   CPUs Available: {ray.available_resources().get('CPU', 0)}")
    print(f"   Memory Available: {ray.available_resources().get('memory', 0) / 1e9:.2f} GB")

    # Run demonstrations
    try:
        demonstrate_ray_basics()
        demonstrate_ray_actors()
        demonstrate_distributed_map_reduce()
        demonstrate_distributed_data_processing()

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

    # Cleanup
    print("\n" + "=" * 70)
    print("🎓 Key Concepts of Ray:")
    print("=" * 70)
    print("1. Tasks (@ray.remote functions): Stateless parallel execution")
    print("2. Actors (@ray.remote classes): Stateful distributed objects")
    print("3. Object Store: Shared memory for efficient data sharing")
    print("4. Futures: Non-blocking parallel execution")
    print("5. Automatic Scheduling: Ray handles task distribution")

    print("\n" + "=" * 70)
    print("⚙️  Ray Ecosystem:")
    print("=" * 70)
    print("• Ray Train: Distributed deep learning training")
    print("• Ray Tune: Hyperparameter tuning at scale")
    print("• Ray Serve: Model serving and deployment")
    print("• Ray RLlib: Scalable reinforcement learning")
    print("• Ray Data: Distributed data processing")

    print("\n" + "=" * 70)
    print("🏗️  Architecture:")
    print("=" * 70)
    print("• Head Node: Manages cluster state and scheduling")
    print("• Worker Nodes: Execute tasks and host actors")
    print("• Object Store: Plasma shared memory (Apache Arrow)")
    print("• Raylet: Per-node scheduler and resource manager")
    print("• GCS: Global Control Store for cluster metadata")

    print("\n" + "=" * 70)
    print("💡 Best Practices:")
    print("=" * 70)
    print("• Use tasks for stateless, parallel computation")
    print("• Use actors for stateful services (e.g., parameter servers)")
    print("• Batch operations to reduce scheduling overhead")
    print("• Use ray.put() for large objects used by multiple tasks")
    print("• Monitor cluster with Ray Dashboard (ray.init(dashboard_host='0.0.0.0'))")

    print("\n✅ Demo Complete!\n")


if __name__ == "__main__":
    try:
        import ray
        main()
    except ImportError:
        print("❌ Ray not installed!")
        print("\nTo install Ray:")
        print("   pip install ray[default]")
        print("\nFor full features:")
        print("   pip install 'ray[default,train,tune,serve,rllib,data]'")
        print("\nOfficial documentation: https://docs.ray.io")
