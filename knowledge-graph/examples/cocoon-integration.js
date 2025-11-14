/**
 * Cocoon Platform Integration Example
 * Knowledge Graph v3.0
 * 
 * Пример интеграции Knowledge Graph с платформой Cocoon для
 * децентрализованного роевого выполнения задач на блокчейне TON
 */

class CocoonIntegration {
    constructor(config = {}) {
        this.config = {
            apiUrl: config.apiUrl || 'https://cocoon.ton/api',
            walletAddress: config.walletAddress,
            privateKey: config.privateKey,
            network: config.network || 'testnet',
            ...config
        };
        
        this.agents = new Map();
        this.tasks = new Map();
        this.consensus = new ConsensusManager();
    }
    
    /**
     * Регистрация агента в Cocoon
     */
    async registerAgent(agentConfig) {
        const agent = {
            id: `agent_${Date.now()}`,
            name: agentConfig.name,
            model: agentConfig.model || 'gpt-4',
            role: agentConfig.role || 'specialist',
            capabilities: agentConfig.capabilities || [],
            stake: agentConfig.stake || 100, // TON
            reputation: 0,
            successRate: 0,
            lastActive: Date.now(),
            status: 'active'
        };
        
        try {
            // Отправить на блокчейн
            const tx = await this.submitToBlockchain('registerAgent', agent);
            agent.txHash = tx.hash;
            
            this.agents.set(agent.id, agent);
            console.log(`✅ Агент ${agent.id} зарегистрирован`);
            
            return agent;
        } catch (error) {
            console.error('❌ Ошибка регистрации агента:', error);
            throw error;
        }
    }
    
    /**
     * Выполнение задачи с использованием роевого взаимодействия
     */
    async executeTask(taskConfig) {
        const task = {
            id: `task_${Date.now()}`,
            query: taskConfig.query,
            agentCount: taskConfig.agentCount || 3,
            selectedAgents: [],
            results: [],
            consensus: null,
            status: 'pending',
            createdAt: Date.now(),
            reward: taskConfig.reward || 10 // TON
        };
        
        try {
            // 1. Выбрать агентов на основе компетенций
            task.selectedAgents = this.selectAgents(task.agentCount, taskConfig.requiredCapabilities);
            
            // 2. Распределить задачу между агентами
            const agentPromises = task.selectedAgents.map(agent =>
                this.sendTaskToAgent(agent, task)
            );
            
            // 3. Собрать результаты
            task.results = await Promise.all(agentPromises);
            
            // 4. Достичь консенсуса
            task.consensus = await this.consensus.aggregate(task.results);
            
            // 5. Записать результат на блокчейн
            const tx = await this.submitToBlockchain('recordTask', task);
            task.txHash = tx.hash;
            task.status = 'completed';
            
            // 6. Распределить награды
            await this.distributeRewards(task);
            
            this.tasks.set(task.id, task);
            console.log(`✅ Задача ${task.id} выполнена`);
            
            return task;
        } catch (error) {
            console.error('❌ Ошибка выполнения задачи:', error);
            task.status = 'failed';
            throw error;
        }
    }
    
    /**
     * Выбор агентов на основе компетенций и репутации
     */
    selectAgents(count, requiredCapabilities = []) {
        const candidates = Array.from(this.agents.values())
            .filter(agent => {
                // Фильтр по статусу
                if (agent.status !== 'active') return false;
                
                // Фильтр по компетенциям
                if (requiredCapabilities.length > 0) {
                    return requiredCapabilities.some(cap =>
                        agent.capabilities.includes(cap)
                    );
                }
                
                return true;
            })
            // Сортировка по репутации и успешности
            .sort((a, b) => {
                const scoreA = a.reputation * a.successRate;
                const scoreB = b.reputation * b.successRate;
                return scoreB - scoreA;
            })
            .slice(0, count);
        
        return candidates;
    }
    
    /**
     * Отправка задачи агенту
     */
    async sendTaskToAgent(agent, task) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Агент ${agent.id} не ответил`));
            }, 30000); // 30 секунд таймаут
            
            // Имитация обработки агентом
            setTimeout(() => {
                clearTimeout(timeout);
                
                const result = {
                    agentId: agent.id,
                    taskId: task.id,
                    response: `Результат от ${agent.name}: ${task.query}`,
                    confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
                    processingTime: Math.random() * 5000 + 1000, // 1-6 сек
                    timestamp: Date.now()
                };
                
                resolve(result);
            }, Math.random() * 3000 + 1000);
        });
    }
    
    /**
     * Распределение наград между агентами
     */
    async distributeRewards(task) {
        const totalReward = task.reward;
        const agentCount = task.selectedAgents.length;
        
        for (const agent of task.selectedAgents) {
            // Награда зависит от качества результата
            const agentResult = task.results.find(r => r.agentId === agent.id);
            const rewardMultiplier = agentResult.confidence;
            const agentReward = (totalReward / agentCount) * rewardMultiplier;
            
            // Обновить репутацию агента
            agent.successRate = (agent.successRate * 0.9) + (agentResult.confidence * 0.1);
            agent.reputation += agentReward;
            agent.lastActive = Date.now();
            
            // Записать на блокчейн
            await this.submitToBlockchain('distributeReward', {
                agentId: agent.id,
                amount: agentReward,
                taskId: task.id
            });
        }
    }
    
    /**
     * Интеграция с Knowledge Graph для выбора архитектуры
     */
    async selectArchitecture(graphState, taskType) {
        // Найти рекомендуемую архитектуру в Knowledge Graph
        const relevantNodes = graphState.nodes.get({
            filter: node => {
                const keywords = taskType.toLowerCase().split(' ');
                return keywords.some(kw =>
                    node.label.toLowerCase().includes(kw) ||
                    node.description.toLowerCase().includes(kw)
                );
            }
        });
        
        if (relevantNodes.length === 0) {
            return 'default';
        }
        
        // Выбрать наиболее релевантный узел
        const bestMatch = relevantNodes[0];
        return bestMatch.label;
    }
    
    /**
     * Отправка транзакции на блокчейн TON
     */
    async submitToBlockchain(method, data) {
        // Имитация отправки на блокчейн
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    hash: `0x${Math.random().toString(16).slice(2)}`,
                    method,
                    data,
                    timestamp: Date.now()
                });
            }, 1000);
        });
    }
    
    /**
     * Получение статистики агентов
     */
    getAgentStats() {
        const agents = Array.from(this.agents.values());
        
        return {
            totalAgents: agents.length,
            activeAgents: agents.filter(a => a.status === 'active').length,
            averageReputation: agents.reduce((sum, a) => sum + a.reputation, 0) / agents.length,
            averageSuccessRate: agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length,
            totalStake: agents.reduce((sum, a) => sum + a.stake, 0),
            agents: agents.map(a => ({
                id: a.id,
                name: a.name,
                reputation: a.reputation.toFixed(2),
                successRate: (a.successRate * 100).toFixed(1) + '%'
            }))
        };
    }
}

/**
 * Менеджер консенсуса для объединения результатов агентов
 */
class ConsensusManager {
    /**
     * Агрегирование результатов от нескольких агентов
     */
    async aggregate(results) {
        if (results.length === 0) {
            throw new Error('Нет результатов для агрегирования');
        }
        
        // Взвешенное усреднение на основе уверенности
        const totalConfidence = results.reduce((sum, r) => sum + r.confidence, 0);
        
        const consensus = {
            method: 'weighted_average',
            responses: results.map(r => r.response),
            averageConfidence: totalConfidence / results.length,
            finalResponse: this.mergeResponses(results),
            timestamp: Date.now()
        };
        
        return consensus;
    }
    
    /**
     * Объединение текстовых ответов
     */
    mergeResponses(results) {
        // Простое объединение (в реальности используется более сложная логика)
        const sortedByConfidence = results.sort((a, b) => b.confidence - a.confidence);
        return sortedByConfidence[0].response;
    }
}

// ============ ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ ============

// Инициализация
const cocoon = new CocoonIntegration({
    walletAddress: 'UQBx...', // TON кошелёк
    network: 'testnet'
});

// Регистрация агентов
async function setupAgents() {
    await cocoon.registerAgent({
        name: 'GPT-4 Specialist',
        model: 'gpt-4',
        role: 'reasoning',
        capabilities: ['text-generation', 'reasoning', 'analysis'],
        stake: 100
    });
    
    await cocoon.registerAgent({
        name: 'Claude Analyst',
        model: 'claude-3',
        role: 'analysis',
        capabilities: ['analysis', 'summarization', 'classification'],
        stake: 80
    });
    
    await cocoon.registerAgent({
        name: 'Llama Processor',
        model: 'llama-2',
        role: 'processing',
        capabilities: ['text-processing', 'summarization'],
        stake: 50
    });
}

// Выполнение задачи
async function executeSwarmTask() {
    const task = await cocoon.executeTask({
        query: 'Analyze swarm intelligence patterns in federated learning',
        agentCount: 3,
        requiredCapabilities: ['analysis', 'reasoning'],
        reward: 10
    });
    
    console.log('Результат:', task.consensus.finalResponse);
    console.log('Уверенность:', (task.consensus.averageConfidence * 100).toFixed(1) + '%');
}

// Получение статистики
function printStats() {
    const stats = cocoon.getAgentStats();
    console.table(stats.agents);
}

// Запуск примера
async function main() {
    console.log('🚀 Cocoon Integration Example\n');
    
    await setupAgents();
    console.log('\n📊 Агенты зарегистрированы\n');
    
    await executeSwarmTask();
    console.log('\n📈 Статистика:\n');
    
    printStats();
}

// Раскомментируйте для запуска:
// main().catch(console.error);
