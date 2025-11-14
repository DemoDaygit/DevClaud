"""
Multi-Agent System Implementation
Collaborative task solving with autonomous agents
"""

import numpy as np
from typing import List, Dict, Optional, Tuple
from enum import Enum
import random

class AgentRole(Enum):
    """Different agent roles in the system"""
    EXPLORER = "explorer"      # Explores environment
    ANALYZER = "analyzer"      # Analyzes data
    COORDINATOR = "coordinator"  # Coordinates agents
    EXECUTOR = "executor"      # Executes tasks

class Task:
    """Represents a task to be completed"""

    def __init__(self, task_id: int, complexity: float, requirements: List[AgentRole]):
        self.task_id = task_id
        self.complexity = complexity
        self.requirements = requirements
        self.assigned_agents: List['Agent'] = []
        self.progress = 0.0
        self.completed = False

    def can_be_completed(self) -> bool:
        """Check if all required roles are assigned"""
        assigned_roles = {agent.role for agent in self.assigned_agents}
        required_roles = set(self.requirements)
        return required_roles.issubset(assigned_roles)

    def execute_step(self) -> float:
        """Execute one step of the task"""
        if not self.can_be_completed():
            return 0.0

        # Progress depends on team size and task complexity
        team_efficiency = len(self.assigned_agents) / len(self.requirements)
        progress_step = team_efficiency / (self.complexity * 10)

        self.progress = min(1.0, self.progress + progress_step)

        if self.progress >= 1.0:
            self.completed = True

        return progress_step


class Message:
    """Communication message between agents"""

    def __init__(self, sender_id: int, receiver_id: Optional[int],
                 message_type: str, content: Dict):
        self.sender_id = sender_id
        self.receiver_id = receiver_id  # None for broadcast
        self.message_type = message_type
        self.content = content


class Agent:
    """Autonomous agent in the multi-agent system"""

    def __init__(self, agent_id: int, role: AgentRole, capabilities: List[str]):
        self.agent_id = agent_id
        self.role = role
        self.capabilities = capabilities
        self.current_task: Optional[Task] = None
        self.messages: List[Message] = []
        self.knowledge: Dict = {}
        self.performance_score = 0.0

    def receive_message(self, message: Message):
        """Receive a message from another agent"""
        self.messages.append(message)

    def process_messages(self):
        """Process pending messages"""
        for message in self.messages:
            if message.message_type == "task_assignment":
                self.current_task = message.content.get("task")
            elif message.message_type == "knowledge_share":
                self.knowledge.update(message.content.get("knowledge", {}))
            elif message.message_type == "help_request":
                self.handle_help_request(message)

        self.messages.clear()

    def handle_help_request(self, message: Message):
        """Handle help request from another agent"""
        # Implement collaborative behavior
        pass

    def decide_action(self) -> str:
        """Decide next action based on current state"""
        if self.current_task is None:
            return "idle"
        elif self.current_task.completed:
            self.current_task = None
            return "task_completed"
        else:
            return "work_on_task"

    def execute_action(self, action: str) -> Optional[Message]:
        """Execute decided action"""
        if action == "work_on_task" and self.current_task:
            progress = self.current_task.execute_step()
            self.performance_score += progress

            if self.current_task.completed:
                return Message(
                    sender_id=self.agent_id,
                    receiver_id=None,  # Broadcast
                    message_type="task_completed",
                    content={"task_id": self.current_task.task_id}
                )

        return None

    def share_knowledge(self, knowledge_key: str) -> Optional[Message]:
        """Share knowledge with other agents"""
        if knowledge_key in self.knowledge:
            return Message(
                sender_id=self.agent_id,
                receiver_id=None,  # Broadcast
                message_type="knowledge_share",
                content={"knowledge": {knowledge_key: self.knowledge[knowledge_key]}}
            )
        return None


class MultiAgentSystem:
    """Orchestrates multiple autonomous agents"""

    def __init__(self):
        self.agents: List[Agent] = []
        self.tasks: List[Task] = []
        self.completed_tasks: List[Task] = []
        self.timestep = 0
        self.message_queue: List[Message] = []

    def add_agent(self, role: AgentRole, capabilities: List[str]) -> Agent:
        """Add a new agent to the system"""
        agent_id = len(self.agents)
        agent = Agent(agent_id, role, capabilities)
        self.agents.append(agent)
        return agent

    def add_task(self, complexity: float, requirements: List[AgentRole]) -> Task:
        """Add a new task to the system"""
        task_id = len(self.tasks) + len(self.completed_tasks)
        task = Task(task_id, complexity, requirements)
        self.tasks.append(task)
        return task

    def assign_tasks(self):
        """Intelligent task assignment based on agent roles"""
        unassigned_tasks = [t for t in self.tasks if not t.assigned_agents]

        for task in unassigned_tasks:
            # Find suitable agents for each required role
            assigned_agents = []

            for required_role in task.requirements:
                # Find available agent with this role
                available_agents = [
                    agent for agent in self.agents
                    if agent.role == required_role and agent.current_task is None
                ]

                if available_agents:
                    selected_agent = random.choice(available_agents)
                    assigned_agents.append(selected_agent)

            # Assign task if all roles can be filled
            if len(assigned_agents) == len(task.requirements):
                task.assigned_agents = assigned_agents

                for agent in assigned_agents:
                    message = Message(
                        sender_id=-1,  # System message
                        receiver_id=agent.agent_id,
                        message_type="task_assignment",
                        content={"task": task}
                    )
                    self.message_queue.append(message)

    def deliver_messages(self):
        """Deliver messages to agents"""
        for message in self.message_queue:
            if message.receiver_id is None:  # Broadcast
                for agent in self.agents:
                    if agent.agent_id != message.sender_id:
                        agent.receive_message(message)
            else:  # Direct message
                self.agents[message.receiver_id].receive_message(message)

        self.message_queue.clear()

    def step(self):
        """Execute one timestep of the simulation"""
        self.timestep += 1

        # Assign new tasks
        self.assign_tasks()

        # Deliver pending messages
        self.deliver_messages()

        # Each agent processes messages
        for agent in self.agents:
            agent.process_messages()

        # Each agent decides and executes action
        for agent in self.agents:
            action = agent.decide_action()
            message = agent.execute_action(action)

            if message:
                self.message_queue.append(message)

        # Check for completed tasks
        completed_this_step = [t for t in self.tasks if t.completed]
        for task in completed_this_step:
            self.tasks.remove(task)
            self.completed_tasks.append(task)

    def get_statistics(self) -> Dict:
        """Get system statistics"""
        return {
            'timestep': self.timestep,
            'total_agents': len(self.agents),
            'active_tasks': len(self.tasks),
            'completed_tasks': len(self.completed_tasks),
            'idle_agents': sum(1 for a in self.agents if a.current_task is None),
            'busy_agents': sum(1 for a in self.agents if a.current_task is not None),
            'avg_performance': np.mean([a.performance_score for a in self.agents]) if self.agents else 0,
        }


# Demo usage
if __name__ == "__main__":
    print("🤖 Multi-Agent System Demo\n")
    print("=" * 70)
    print("Scenario: Collaborative task solving with specialized agents")
    print("=" * 70)

    # Initialize system
    mas = MultiAgentSystem()

    # Create diverse agent team
    print("\n👥 Creating Agent Team...")

    # 3 Explorers
    for i in range(3):
        agent = mas.add_agent(AgentRole.EXPLORER, ["search", "discover"])
        print(f"   Agent {agent.agent_id}: {agent.role.value} - {agent.capabilities}")

    # 2 Analyzers
    for i in range(2):
        agent = mas.add_agent(AgentRole.ANALYZER, ["analyze", "evaluate"])
        print(f"   Agent {agent.agent_id}: {agent.role.value} - {agent.capabilities}")

    # 2 Executors
    for i in range(2):
        agent = mas.add_agent(AgentRole.EXECUTOR, ["execute", "implement"])
        print(f"   Agent {agent.agent_id}: {agent.role.value} - {agent.capabilities}")

    # 1 Coordinator
    agent = mas.add_agent(AgentRole.COORDINATOR, ["coordinate", "manage"])
    print(f"   Agent {agent.agent_id}: {agent.role.value} - {agent.capabilities}")

    # Create tasks with different requirements
    print("\n📋 Creating Tasks...")

    tasks_config = [
        (3.0, [AgentRole.EXPLORER, AgentRole.ANALYZER]),
        (5.0, [AgentRole.EXPLORER, AgentRole.ANALYZER, AgentRole.EXECUTOR]),
        (2.0, [AgentRole.ANALYZER, AgentRole.EXECUTOR]),
        (4.0, [AgentRole.EXPLORER, AgentRole.COORDINATOR]),
        (6.0, [AgentRole.EXPLORER, AgentRole.ANALYZER, AgentRole.EXECUTOR, AgentRole.COORDINATOR]),
    ]

    for complexity, requirements in tasks_config:
        task = mas.add_task(complexity, requirements)
        req_str = ", ".join([r.value for r in requirements])
        print(f"   Task {task.task_id}: Complexity={complexity}, Requires=[{req_str}]")

    # Run simulation
    print("\n🔄 Running Multi-Agent Simulation...\n")

    max_steps = 100
    for step in range(max_steps):
        mas.step()

        stats = mas.get_statistics()

        # Print progress every 10 steps
        if step % 10 == 0:
            print(f"Step {stats['timestep']:3d} | "
                  f"Active: {stats['active_tasks']} | "
                  f"Completed: {stats['completed_tasks']} | "
                  f"Busy: {stats['busy_agents']}/{stats['total_agents']} agents | "
                  f"Avg Performance: {stats['avg_performance']:.3f}")

        # Stop if all tasks completed
        if stats['active_tasks'] == 0 and stats['completed_tasks'] == len(tasks_config):
            print(f"\n✅ All tasks completed in {step + 1} steps!")
            break

    # Final statistics
    print("\n" + "=" * 70)
    print("📊 Final Statistics")
    print("=" * 70)

    stats = mas.get_statistics()
    print(f"Total Steps: {stats['timestep']}")
    print(f"Tasks Completed: {stats['completed_tasks']}/{len(tasks_config)}")
    print(f"Average Agent Performance: {stats['avg_performance']:.3f}")

    print("\n👥 Agent Performance:")
    for agent in sorted(mas.agents, key=lambda a: a.performance_score, reverse=True):
        status = "🔴 Idle" if agent.current_task is None else "🟢 Busy"
        print(f"   Agent {agent.agent_id} ({agent.role.value:12s}): "
              f"Score={agent.performance_score:.3f} {status}")

    print("\n" + "=" * 70)
    print("🎓 Key Concepts of Multi-Agent Systems:")
    print("=" * 70)
    print("1. Autonomy: Each agent makes independent decisions")
    print("2. Collaboration: Agents work together to achieve complex goals")
    print("3. Communication: Message passing enables coordination")
    print("4. Specialization: Different roles handle different task types")
    print("5. Emergence: Complex system behavior emerges from simple agent rules")

    print("\n" + "=" * 70)
    print("⚙️  Applications:")
    print("=" * 70)
    print("• Distributed AI: Training and inference across multiple nodes")
    print("• Robotics: Multi-robot coordination for warehouse automation")
    print("• Smart Grids: Distributed energy management")
    print("• Traffic Control: Autonomous vehicle coordination")
    print("• Game AI: Complex NPC behaviors in video games")

    print("\n" + "=" * 70)
    print("🏗️  Architecture Patterns:")
    print("=" * 70)
    print("• Hierarchical: Coordinator agents manage worker agents")
    print("• Peer-to-Peer: All agents have equal status")
    print("• Market-Based: Agents bid for tasks and resources")
    print("• Blackboard: Shared knowledge space for coordination")
