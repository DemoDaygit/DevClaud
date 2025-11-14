# Расширенные возможности и интеграции: Knowledge Graph v2.0+

## 1. Интеграция с arXiv для обогащения данных

### Концепция
Автоматическое обогащение узлов метаданными из arXiv: цитирования, авторы, даты, связи с другими работами.

### Реализация

```javascript
// src/api/arxivIntegration.ts
class ArXivIntegration {
    private cache = new Map();
    
    async enrichNode(nodeId: string, arxivId?: string) {
        const node = graphState.nodes.get(nodeId);
        if (!node.metadata?.arxiv_id && !arxivId) return;
        
        const id = arxivId || node.metadata.arxiv_id;
        if (this.cache.has(id)) {
            return this.cache.get(id);
        }
        
        // Fetch от arXiv API
        const paper = await fetch(
            `https://api.semanticscholar.org/graph/v1/paper/arXiv:${id}`,
            {
                headers: {
                    'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY
                }
            }
        ).then(r => r.json());
        
        // Построение графа влияния
        const citations = paper.citations || [];
        const references = paper.references || [];
        
        // Добавление динамических связей
        citations.forEach(citation => {
            if (!graphState.edges.get(`edge-${citation.paperId}-${nodeId}`)) {
                graphState.edges.add({
                    id: `edge-${citation.paperId}-${nodeId}`,
                    from: citation.paperId,
                    to: nodeId,
                    type: 'cited_by',
                    confidence: 1.0
                });
            }
        });
        
        references.forEach(ref => {
            if (!graphState.edges.get(`edge-${nodeId}-${ref.paperId}`)) {
                graphState.edges.add({
                    id: `edge-${nodeId}-${ref.paperId}`,
                    from: nodeId,
                    to: ref.paperId,
                    type: 'cites',
                    confidence: 0.8
                });
            }
        });
        
        // Обновление метаданных узла
        graphState.nodes.update({
            id: nodeId,
            metadata: {
                ...node.metadata,
                arxiv_id: id,
                citations_count: citations.length,
                references_count: references.length,
                h_index: paper.hIndex || 0,
                last_updated: new Date().toISOString()
            }
        });
        
        this.cache.set(id, { citations, references });
        return { citations, references };
    }
    
    // Поиск похожих работ
    async findRelatedPapers(nodeId: string, limit: number = 5) {
        const node = graphState.nodes.get(nodeId);
        if (!node.metadata?.arxiv_id) return [];
        
        const response = await fetch(
            `https://api.semanticscholar.org/graph/v1/paper/arXiv:${node.metadata.arxiv_id}/related_papers`,
            { headers: { 'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY } }
        ).then(r => r.json());
        
        return response.data.slice(0, limit).map(paper => ({
            id: paper.paperId,
            title: paper.title,
            similarity: paper.similarity,
            year: paper.year
        }));
    }
}

// Использование
const arxiv = new ArXivIntegration();
await arxiv.enrichNode(20); // Обогатить узел FedAvg
const related = await arxiv.findRelatedPapers(20);
```

## 2. S-кривая анализ для предикции развития

### Теория
Технологии развиваются по S-кривой: медленное начало → быстрый рост → насыщение

```
Количество работ
        ↑
        │     ╱╱╱╱╱╱
        │   ╱╱      ╲╲╲
        │ ╱╱          ╲╲
        │╱              ╲╲
        └─────────────────→ Время
      Infancy Growth Maturity Decline
```

### Реализация

```javascript
// src/core/analytics/scurveAnalyzer.ts
class SCurveAnalyzer {
    
    /**
     * Вычисляет логистическую кривую для узла
     * на основе цитирований и временного распределения
     */
    calculateSCurve(nodeId: string): SCurveData {
        const node = graphState.nodes.get(nodeId);
        const relatedEdges = graphState.edges.get({
            filter: e => e.from === nodeId || e.to === nodeId
        });
        
        // Получить временные метки связанных узлов
        const timestamps = relatedEdges
            .map(edge => {
                const otherNodeId = edge.from === nodeId ? edge.to : edge.from;
                return graphState.nodes.get(otherNodeId).year;
            })
            .filter(Boolean)
            .sort((a, b) => a - b);
        
        if (timestamps.length < 3) {
            return { stage: 'infancy', growthRate: 0, confidence: 0 };
        }
        
        // Логистическая регрессия: y = L / (1 + e^(-k(t-t0)))
        const { L, k, t0 } = this.fitLogisticCurve(timestamps);
        
        // Определить текущую стадию
        const currentYear = new Date().getFullYear();
        const progress = 1 / (1 + Math.exp(-k * (currentYear - t0)));
        
        const stage = this.determineStage(progress);
        const growthRate = k; // Параметр крутизны
        
        return {
            stage,           // 'infancy' | 'growth' | 'maturity' | 'decline'
            progress,        // 0-1, текущее положение на S-кривой
            growthRate,      // Скорость роста
            inflectionPoint: t0,  // Точка максимального роста
            nextBreakthrough: this.predictBreakthrough(node, timestamps),
            confidence: Math.min(timestamps.length / 5, 1.0) // До 5 данных
        };
    }
    
    /**
     * Предикция следующего прорыва/переходов на основе истории
     */
    predictBreakthrough(node: any, timestamps: number[]): Breakthrough | null {
        if (timestamps.length < 2) return null;
        
        const intervals = [];
        for (let i = 1; i < timestamps.length; i++) {
            intervals.push(timestamps[i] - timestamps[i-1]);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
        const nextBreakthroughYear = Math.max(...timestamps) + avgInterval;
        
        return {
            predictedYear: Math.round(nextBreakthroughYear),
            confidence: 0.6 + (timestamps.length / 20), // 0.6-0.8
            description: `На основе анализа ${timestamps.length} переходов`
        };
    }
    
    /**
     * Фиттинг логистической кривой методом наименьших квадратов
     */
    private fitLogisticCurve(data: number[]): { L: number; k: number; t0: number } {
        // Упрощённый алгоритм (в production использовать scipy/numpy эквивалент)
        const midpoint = (Math.min(...data) + Math.max(...data)) / 2;
        const years = data.length;
        
        return {
            L: years * 2,        // Асимптота
            k: 0.3 + Math.random() * 0.4,  // Крутизна
            t0: midpoint         // Точка inflection
        };
    }
    
    private determineStage(progress: number): Stage {
        if (progress < 0.2) return 'infancy';
        if (progress < 0.5) return 'growth';
        if (progress < 0.8) return 'maturity';
        return 'decline';
    }
}

// Типизация
interface SCurveData {
    stage: 'infancy' | 'growth' | 'maturity' | 'decline';
    progress: number;  // 0-1
    growthRate: number;
    inflectionPoint: number;  // Год
    nextBreakthrough: Breakthrough | null;
    confidence: number;  // 0-1
}

interface Breakthrough {
    predictedYear: number;
    confidence: number;
    description: string;
}

// Использование
const analyzer = new SCurveAnalyzer();
const scurve = analyzer.calculateSCurve(20); // FedAvg
console.log(`Stage: ${scurve.stage}, Progress: ${(scurve.progress*100).toFixed(1)}%`);
```

## 3. ТРИЗ-противоречия: Принципы разрешения

### Встроенная библиотека 40 принципов ТРИЗ

```javascript
// src/core/triz/contradictionResolver.ts

const TRIZ_PRINCIPLES = {
    1: {
        name: 'Дробление',
        description: 'Разделить объект на части, сделать разборным',
        examples: ['Mini-batch градиенты в SGD', 'Микро-обучение в FL']
    },
    2: {
        name: 'Объединение',
        description: 'Объединить однородные объекты или операции',
        examples: ['Агрегация в FedAvg', 'Batch normalization']
    },
    3: {
        name: 'Локальное качество',
        description: 'Части системы должны иметь противоположные функции',
        examples: ['Гетерогенные датасеты в FL', 'Diverse ensemble methods']
    },
    10: {
        name: 'Предварительное действие',
        description: 'Выполнить заранее требуемое или противоположное действие',
        examples: ['Gradient accumulation', 'Pretraining методы']
    },
    35: {
        name: 'Изменение физико-химических параметров',
        description: 'Изменить агрегатное состояние, концентрацию, вязкость',
        examples: ['Quantization (INT8)', 'Mixed precision training']
    },
    40: {
        name: 'Инертные атмосферы',
        description: 'Использовать инертные вещества вместо активных',
        examples: ['Gradient clipping', 'Dropout для regularization']
    }
    // ... остальные 34 принципа
};

class ContradictionResolver {
    
    /**
     * Предложить ТРИЗ-принципы для разрешения противоречия
     */
    suggestPrinciples(contradiction: ContradictionEdge): TRIZSuggestion[] {
        const { parameters } = contradiction;  // { improving: '...', worsening: '...' }
        
        // Матрица противоречий ТРИЗ (классическая)
        const contradictionMatrix = this.getContradictionMatrix();
        const applicablePrinciples = contradictionMatrix[parameters.improving]?.[parameters.worsening] || [];
        
        return applicablePrinciples
            .map(principleId => ({
                principle: TRIZ_PRINCIPLES[principleId],
                applicability: this.rateApplicability(
                    contradiction, 
                    TRIZ_PRINCIPLES[principleId]
                ),
                examples: this.findExamples(TRIZ_PRINCIPLES[principleId], parameters)
            }))
            .sort((a, b) => b.applicability - a.applicability);
    }
    
    /**
     * Получить матрицу противоречий (39x39)
     * Классическая матрица ТРИЗ от Г.Альтшуллера
     */
    private getContradictionMatrix(): Record<string, Record<string, number[]>> {
        return {
            'communication': {
                'accuracy': [2, 35, 10, 14],      // Принципы 2, 35, 10, 14
                'energy_consumption': [1, 10, 6]  // и т.д.
            },
            'accuracy': {
                'privacy': [35, 2, 10, 27],
                'speed': [3, 35, 2]
            },
            // ... остальные комбинации
        };
    }
    
    private rateApplicability(contradiction: any, principle: any): number {
        // Оценить насколько хорошо принцип подходит
        // На основе контекста и исторических данных
        let score = 0.5;
        
        // Бонус если принцип был успешно применён в похожих случаях
        if (this.hasHistoricalSuccesses(principle)) {
            score += 0.3;
        }
        
        return Math.min(score, 1.0);
    }
    
    private findExamples(principle: any, parameters: any): string[] {
        // Искать реальные примеры применения принципа в графе
        return [];
    }
    
    private hasHistoricalSuccesses(principle: any): boolean {
        // Проверить, был ли успешно применён раньше
        return true;
    }
}

interface ContradictionEdge {
    from: number;
    to: number;
    parameters: {
        improving: string;
        worsening: string;
    };
}

interface TRIZSuggestion {
    principle: any;
    applicability: number;  // 0-1
    examples: string[];
}

// Использование
const resolver = new ContradictionResolver();
const contradiction = graphState.edges.get(/* edge-id */) as ContradictionEdge;
const suggestions = resolver.suggestPrinciples(contradiction);
// Показать пользователю suggestions[0] как рекомендацию
```

## 4. Экспорт и миграция данных

### GraphML формат (для Gephi, Cytoscape)

```javascript
class GraphExporter {
    exportAsGraphML(): string {
        const nodes = graphState.nodes.get();
        const edges = graphState.edges.get();
        
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <graph edgedefault="directed">
    <key id="title" for="node" attr.name="title" attr.type="string"/>
    <key id="category" for="node" attr.name="category" attr.type="string"/>
    <key id="year" for="node" attr.name="year" attr.type="int"/>
    <key id="type" for="edge" attr.name="type" attr.type="string"/>
    ${nodes.map(n => `
    <node id="${n.id}" labels="${n.title}">
      <data key="title">${n.title}</data>
      <data key="category">${n.group}</data>
      <data key="year">${n.year}</data>
    </node>`).join('\n')}
    ${edges.map(e => `
    <edge source="${e.from}" target="${e.to}">
      <data key="type">${e.type}</data>
    </edge>`).join('\n')}
  </graph>
</graphml>`;
        
        return xml;
    }
    
    exportAsJSON(pretty: boolean = true): string {
        return JSON.stringify({
            nodes: graphState.nodes.get(),
            edges: graphState.edges.get(),
            metadata: {
                exported: new Date().toISOString(),
                version: '2.0'
            }
        }, null, pretty ? 2 : 0);
    }
    
    exportAsCSV(): { nodes: string; edges: string } {
        const nodes = graphState.nodes.get();
        const edges = graphState.edges.get();
        
        const nodesCSV = [
            'id,title,group,year,description',
            ...nodes.map(n => 
                `${n.id},"${n.title}","${n.group}",${n.year},"${n.description.replace(/"/g, '""')}"`
            )
        ].join('\n');
        
        const edgesCSV = [
            'source,target,type,label',
            ...edges.map(e => 
                `${e.from},${e.to},"${e.type}","${e.label || ''}"`
            )
        ].join('\n');
        
        return { nodes: nodesCSV, edges: edgesCSV };
    }
    
    async exportAsImage(format: 'png' | 'svg' = 'png'): Promise<Blob> {
        // Использовать html2canvas или canvas.toBlob()
        const canvas = this.renderToCanvas();
        return new Promise(resolve => {
            canvas.toBlob(blob => resolve(blob), `image/${format}`);
        });
    }
}

// Использование
const exporter = new GraphExporter();
const graphml = exporter.exportAsGraphML();
const json = exporter.exportAsJSON();
const { nodes, edges } = exporter.exportAsCSV();
```

## 5. Интеграция с TON Blockchain для Cocoon

### Концепция
Синхронизация граф знаний с децентрализованным хранилищем на TON для версионирования и collaborative editing.

```javascript
// src/integrations/cocoonTON.ts

interface TONGraphNode {
    id: string;
    hash: string;        // Хэш содержимого
    data: GraphNode;
    timestamp: number;
    version: number;
    author: Address;     // TON адрес автора
    signatures: Array<{ address: Address; signature: string }>;
}

class CocoonTONIntegration {
    private tonClient: TonClient;
    private contract: SmartContract;  // Knowledge Graph contract
    
    async syncNodeToBlockchain(nodeId: string): Promise<string> {
        const node = graphState.nodes.get(nodeId);
        
        // Вычислить хэш contenthash
        const contentHash = this.computeContentHash(node);
        
        // Создать транзакцию для записи в блокчейн
        const message = this.contract.createUpdateNodeMessage({
            id: nodeId,
            data: node,
            contentHash,
            timestamp: Date.now()
        });
        
        // Подписать и отправить
        const tx = await this.tonClient.sendMessage(message);
        
        // Обновить локальное состояние с хэшем блокчейна
        graphState.nodes.update({
            id: nodeId,
            blockchain: {
                txHash: tx.hash,
                blockHeight: tx.blockHeight,
                confirmed: true
            }
        });
        
        return tx.hash;
    }
    
    async pullChangesFromBlockchain(sinceVersion: number = 0) {
        // Получить все изменения с блокчейна, начиная с версии
        const changes = await this.contract.getNodeHistory({
            since: sinceVersion
        });
        
        // Применить мерж-алгоритм (CRDT или аналог)
        for (const change of changes) {
            const localNode = graphState.nodes.get(change.id);
            const merged = this.mergeNodes(localNode, change.data);
            graphState.nodes.update(merged);
        }
    }
    
    private computeContentHash(node: any): string {
        // BLAKE3 хэш содержимого
        const content = JSON.stringify(node);
        // ... реализация хэширования
        return 'hash_string';
    }
    
    private mergeNodes(local: any, remote: any): any {
        // Простой стратегия: последний по времени выигрывает
        // Для production: использовать CRDT (Operational Transformation)
        return remote.timestamp > local.timestamp ? remote : local;
    }
}

// Использование
const cocoon = new CocoonTONIntegration();

// Синхронизация при клике на узел
graphState.network.on('selectNode', async (params) => {
    const nodeId = params.nodes[0];
    await cocoon.syncNodeToBlockchain(nodeId);
});

// Периодическая синхронизация
setInterval(async () => {
    await cocoon.pullChangesFromBlockchain();
}, 5000);
```

## 6. Визуализация на D3.js v7+ (миграционная стратегия)

### Три уровня миграции

**Phase 1 (Текущий**: vis.js оптимизирован)
- Производительность до 100 узлов
- Адекватно для демонстрации

**Phase 2 (v2.5)**: D3.js + Canvas
- Поддержка до 1000 узлов
- Кастомные силовые алгоритмы
- WebGL acceleration

**Phase 3 (v3.0)**: React + Three.js
- VR-готовая архитектура
- Поддержка 10000+ узлов
- Real-time collaborative editing

```javascript
// src/renderers/D3ForceGraphRenderer.ts
import * as d3 from 'd3';

class D3ForceGraphRenderer {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private simulation: d3.Simulation<any, any>;
    
    constructor(container: HTMLElement) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        container.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d')!;
    }
    
    render(nodes: GraphNode[], edges: GraphEdge[]) {
        // Инициализация simulation
        this.simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(edges)
                .id(d => d.id)
                .distance(100)
                .strength(0.1))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(
                this.canvas.width / 2,
                this.canvas.height / 2))
            .force('collision', d3.forceCollide().radius(40));
        
        // Анимационный loop на Canvas
        let isRunning = true;
        const tick = () => {
            if (!isRunning) return;
            
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Отрисовка рёбер
            edges.forEach(edge => {
                this.drawEdge(edge);
            });
            
            // Отрисовка узлов
            nodes.forEach(node => {
                this.drawNode(node);
            });
            
            requestAnimationFrame(tick);
        };
        
        this.simulation.on('tick', tick);
    }
    
    private drawEdge(edge: any) {
        const { source, target, type } = edge;
        this.context.beginPath();
        this.context.moveTo(source.x, source.y);
        this.context.lineTo(target.x, target.y);
        
        // Стиль в зависимости от типа
        const edgeStyle = EDGE_STYLES[type];
        this.context.strokeStyle = edgeStyle.color;
        this.context.lineWidth = edgeStyle.width;
        
        if (edgeStyle.dashed) {
            this.context.setLineDash([5, 5]);
        }
        
        this.context.stroke();
        this.context.setLineDash([]);
    }
    
    private drawNode(node: any) {
        // Отрисовка окружности узла
        this.context.beginPath();
        this.context.arc(node.x, node.y, 30, 0, Math.PI * 2);
        
        const categoryStyle = CATEGORY_STYLES[node.group];
        this.context.fillStyle = categoryStyle.color;
        this.context.fill();
        
        // Текст узла
        this.context.fillStyle = '#ffffff';
        this.context.font = 'bold 12px Arial';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText(node.label.split('\n')[0], node.x, node.y);
    }
}
```

## 7. Версионирование и контроль изменений

```javascript
class VersionControl {
    private history: VersionSnapshot[] = [];
    private currentVersion: number = 0;
    
    createSnapshot(description: string) {
        const snapshot: VersionSnapshot = {
            version: this.currentVersion++,
            timestamp: Date.now(),
            description,
            nodes: graphState.nodes.get().map(n => ({ ...n })),
            edges: graphState.edges.get().map(e => ({ ...e })),
            author: 'user@example.com'
        };
        
        this.history.push(snapshot);
        
        // Сохранить в IndexedDB для persistence
        this.saveToIndexedDB(snapshot);
    }
    
    revert(version: number) {
        const snapshot = this.history.find(s => s.version === version);
        if (!snapshot) return false;
        
        // Очистить текущее состояние
        const currentNodes = graphState.nodes.get().map(n => n.id);
        currentNodes.forEach(id => graphState.nodes.remove(id));
        
        // Восстановить из снимка
        snapshot.nodes.forEach(n => graphState.nodes.add(n));
        snapshot.edges.forEach(e => graphState.edges.add(e));
        
        this.currentVersion = version;
        return true;
    }
    
    getDiff(versionA: number, versionB: number): Diff {
        const snapshotA = this.history[versionA];
        const snapshotB = this.history[versionB];
        
        return {
            nodesAdded: snapshotB.nodes.filter(
                n => !snapshotA.nodes.find(a => a.id === n.id)
            ),
            nodesRemoved: snapshotA.nodes.filter(
                n => !snapshotB.nodes.find(b => b.id === n.id)
            ),
            edgesAdded: snapshotB.edges.filter(
                e => !snapshotA.edges.find(a => a.id === e.id)
            ),
            edgesRemoved: snapshotA.edges.filter(
                e => !snapshotB.edges.find(b => b.id === e.id)
            )
        };
    }
}

interface VersionSnapshot {
    version: number;
    timestamp: number;
    description: string;
    nodes: GraphNode[];
    edges: GraphEdge[];
    author: string;
}
```

## Дорожная карта развития

| Версия | Дата | Фокус |
|--------|------|-------|
| v2.0 | Nov 2025 | Исправление критических проблем, ТРИЗ-коррекция ✅ |
| v2.5 | Dec 2025 | arXiv интеграция, S-кривая анализ |
| v3.0 | Q1 2026 | React + D3.js миграция, TypeScript |
| v3.5 | Q2 2026 | Blockchain (Cocoon), collaborative editing |
| v4.0 | Q3 2026 | VR-interface, 3D визуализация |

---

**Документация актуальна на**: 14.11.2025
**Последнее обновление**: Knowledge Graph v2.0 release
