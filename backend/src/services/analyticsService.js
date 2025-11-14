import { getSession } from '../config/neo4j.js';
import Graph from 'graphology';
import { pagerank } from 'graphology-metrics/centrality/pagerank.js';
import { betweennessCentrality } from 'graphology-metrics/centrality/betweenness.js';
import { degreeCentrality } from 'graphology-metrics/centrality/degree.js';
import louvain from 'graphology-communities-louvain';

/**
 * Calculate PageRank for all nodes
 */
export async function calculatePageRank(limit = 20) {
  const session = getSession();
  try {
    // Use Neo4j GDS library if available
    const result = await session.run(`
      CALL gds.pageRank.stream('myGraph', {
        maxIterations: 20,
        dampingFactor: 0.85
      })
      YIELD nodeId, score
      RETURN gds.util.asNode(nodeId).id AS id,
             gds.util.asNode(nodeId).label AS label,
             score
      ORDER BY score DESC
      LIMIT $limit
    `, { limit });

    return result.records.map(record => ({
      id: record.get('id'),
      label: record.get('label'),
      pagerank: record.get('score')
    }));
  } catch (error) {
    // Fallback to manual calculation
    const graphData = await getGraphData(session);
    const graph = buildGraphology(graphData);
    const ranks = pagerank(graph);

    const results = Object.entries(ranks)
      .map(([id, score]) => ({
        id,
        label: graph.getNodeAttribute(id, 'label'),
        pagerank: score
      }))
      .sort((a, b) => b.pagerank - a.pagerank)
      .slice(0, limit);

    return results;
  } finally {
    await session.close();
  }
}

/**
 * Calculate centrality metrics
 */
export async function calculateCentrality(type = 'betweenness', limit = 20) {
  const session = getSession();
  try {
    const graphData = await getGraphData(session);
    const graph = buildGraphology(graphData);

    let centrality;
    switch (type) {
      case 'betweenness':
        centrality = betweennessCentrality(graph);
        break;
      case 'degree':
        centrality = degreeCentrality(graph);
        break;
      default:
        centrality = degreeCentrality(graph);
    }

    const results = Object.entries(centrality)
      .map(([id, score]) => ({
        id,
        label: graph.getNodeAttribute(id, 'label'),
        centrality: score
      }))
      .sort((a, b) => b.centrality - a.centrality)
      .slice(0, limit);

    return results;
  } finally {
    await session.close();
  }
}

/**
 * Detect communities using Louvain algorithm
 */
export async function detectCommunities() {
  const session = getSession();
  try {
    const graphData = await getGraphData(session);
    const graph = buildGraphology(graphData);

    const communities = louvain(graph);

    // Group nodes by community
    const communityMap = {};
    Object.entries(communities).forEach(([nodeId, communityId]) => {
      if (!communityMap[communityId]) {
        communityMap[communityId] = [];
      }
      communityMap[communityId].push({
        id: nodeId,
        label: graph.getNodeAttribute(nodeId, 'label')
      });
    });

    return {
      totalCommunities: Object.keys(communityMap).length,
      communities: Object.entries(communityMap).map(([id, nodes]) => ({
        communityId: parseInt(id),
        size: nodes.length,
        nodes
      }))
    };
  } finally {
    await session.close();
  }
}

/**
 * Find shortest path between two nodes
 */
export async function findShortestPath(fromId, toId) {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH path = shortestPath(
        (from:Concept {id: $fromId})-[*]-(to:Concept {id: $toId})
      )
      RETURN [node in nodes(path) | node.id] AS path,
             length(path) AS distance
    `, { fromId, toId });

    if (result.records.length === 0) {
      return { found: false, message: 'No path found' };
    }

    return {
      found: true,
      path: result.records[0].get('path'),
      distance: result.records[0].get('distance')
    };
  } finally {
    await session.close();
  }
}

/**
 * Get graph statistics
 */
export async function getGraphStatistics() {
  const session = getSession();
  try {
    // Node count
    const nodeResult = await session.run('MATCH (n:Concept) RETURN count(n) AS count');
    const nodeCount = nodeResult.records[0].get('count').toNumber();

    // Edge count
    const edgeResult = await session.run('MATCH ()-[r]->() RETURN count(r) AS count');
    const edgeCount = edgeResult.records[0].get('count').toNumber();

    // Degree statistics
    const degreeResult = await session.run(`
      MATCH (n:Concept)
      OPTIONAL MATCH (n)-[r]-()
      WITH n, count(r) AS degree
      RETURN avg(degree) AS avgDegree,
             max(degree) AS maxDegree,
             min(degree) AS minDegree
    `);

    const degreeStats = degreeResult.records[0];

    // Categories
    const categoryResult = await session.run(`
      MATCH (n:Concept)
      RETURN n.group AS category, count(n) AS count
      ORDER BY count DESC
    `);

    const categories = categoryResult.records.map(record => ({
      category: record.get('category'),
      count: record.get('count').toNumber()
    }));

    // Year distribution
    const yearResult = await session.run(`
      MATCH (n:Concept)
      RETURN n.year AS year, count(n) AS count
      ORDER BY year ASC
    `);

    const yearDistribution = yearResult.records.map(record => ({
      year: record.get('year'),
      count: record.get('count').toNumber()
    }));

    return {
      nodes: nodeCount,
      edges: edgeCount,
      density: (2 * edgeCount) / (nodeCount * (nodeCount - 1)),
      avgDegree: degreeStats.get('avgDegree'),
      maxDegree: degreeStats.get('maxDegree').toNumber(),
      minDegree: degreeStats.get('minDegree').toNumber(),
      categories,
      yearDistribution
    };
  } finally {
    await session.close();
  }
}

/**
 * Get degree distribution
 */
export async function getDegreeDistribution() {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (n:Concept)
      OPTIONAL MATCH (n)-[r]-()
      WITH n, count(r) AS degree
      RETURN degree, count(n) AS count
      ORDER BY degree ASC
    `);

    return result.records.map(record => ({
      degree: record.get('degree').toNumber(),
      count: record.get('count').toNumber()
    }));
  } finally {
    await session.close();
  }
}

/**
 * Calculate influence score for a node
 */
export async function calculateInfluence(nodeId) {
  const session = getSession();
  try {
    // Get node's immediate influence
    const result = await session.run(`
      MATCH (n:Concept {id: $nodeId})
      OPTIONAL MATCH (n)-[:RELATES]->(out:Concept)
      OPTIONAL MATCH (in:Concept)-[:RELATES]->(n)
      WITH n, count(DISTINCT out) AS outDegree, count(DISTINCT in) AS inDegree
      RETURN n.id AS id,
             n.label AS label,
             outDegree,
             inDegree,
             (outDegree + inDegree) AS totalDegree,
             (outDegree * 1.5 + inDegree) AS influenceScore
    `, { nodeId });

    if (result.records.length === 0) {
      return null;
    }

    const record = result.records[0];
    return {
      id: record.get('id'),
      label: record.get('label'),
      outDegree: record.get('outDegree').toNumber(),
      inDegree: record.get('inDegree').toNumber(),
      totalDegree: record.get('totalDegree').toNumber(),
      influenceScore: record.get('influenceScore')
    };
  } finally {
    await session.close();
  }
}

/**
 * Helper: Get graph data for graphology
 */
async function getGraphData(session) {
  const nodeResult = await session.run('MATCH (n:Concept) RETURN n');
  const edgeResult = await session.run('MATCH (n:Concept)-[r]->(m:Concept) RETURN n, r, m');

  const nodes = nodeResult.records.map(record => record.get('n').properties);
  const edges = edgeResult.records.map(record => {
    const source = record.get('n').properties;
    const target = record.get('m').properties;
    const rel = record.get('r');

    return {
      from: source.id,
      to: target.id,
      ...rel.properties
    };
  });

  return { nodes, edges };
}

/**
 * Helper: Build graphology graph from data
 */
function buildGraphology(data) {
  const graph = new Graph({ type: 'directed' });

  // Add nodes
  data.nodes.forEach(node => {
    graph.addNode(node.id, node);
  });

  // Add edges
  data.edges.forEach(edge => {
    try {
      graph.addEdge(edge.from, edge.to, edge);
    } catch (error) {
      // Edge might already exist or nodes don't exist
      console.warn(`Failed to add edge ${edge.from} -> ${edge.to}:`, error.message);
    }
  });

  return graph;
}
