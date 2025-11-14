import { getSession } from '../config/neo4j.js';
import { GRAPH_DATA } from '../data/sampleData.js';

/**
 * Get all nodes and edges from the graph
 */
export async function getGraph(filters = {}) {
  const session = getSession();
  try {
    let query = `
      MATCH (n:Concept)
      ${filters.category ? 'WHERE n.group = $category' : ''}
      ${filters.year ? 'AND n.year <= $year' : ''}
      WITH n
      LIMIT $limit
      OPTIONAL MATCH (n)-[r]->(m:Concept)
      RETURN n, collect({rel: r, target: m}) as relationships
    `;

    const result = await session.run(query, {
      category: filters.category,
      year: filters.year ? parseInt(filters.year) : null,
      limit: filters.limit || 1000
    });

    const nodes = [];
    const edges = [];
    const nodeIds = new Set();

    result.records.forEach(record => {
      const node = record.get('n').properties;
      if (!nodeIds.has(node.id)) {
        nodes.push(node);
        nodeIds.add(node.id);
      }

      const relationships = record.get('relationships');
      relationships.forEach(({ rel, target }) => {
        if (rel && target) {
          edges.push({
            id: rel.identity.toNumber(),
            from: node.id,
            to: target.properties.id,
            ...rel.properties
          });
        }
      });
    });

    return { nodes, edges };
  } finally {
    await session.close();
  }
}

/**
 * Get all nodes with optional filters
 */
export async function getNodes(filters = {}) {
  const session = getSession();
  try {
    let query = `
      MATCH (n:Concept)
      ${filters.category ? 'WHERE n.group = $category' : ''}
      ${filters.year ? 'AND n.year <= $year' : ''}
      RETURN n
      ORDER BY n.year DESC, n.label ASC
    `;

    const result = await session.run(query, {
      category: filters.category,
      year: filters.year ? parseInt(filters.year) : null
    });

    return result.records.map(record => record.get('n').properties);
  } finally {
    await session.close();
  }
}

/**
 * Get a specific node by ID
 */
export async function getNodeById(id) {
  const session = getSession();
  try {
    const result = await session.run(
      'MATCH (n:Concept {id: $id}) RETURN n',
      { id }
    );

    if (result.records.length === 0) {
      return null;
    }

    return result.records[0].get('n').properties;
  } finally {
    await session.close();
  }
}

/**
 * Create a new node
 */
export async function createNode(nodeData) {
  const session = getSession();
  try {
    const result = await session.run(
      `
      CREATE (n:Concept {
        id: $id,
        label: $label,
        title: $title,
        description: $description,
        group: $group,
        year: $year,
        formula: $formula,
        triz: $triz
      })
      RETURN n
      `,
      {
        id: nodeData.id || `node_${Date.now()}`,
        label: nodeData.label,
        title: nodeData.title || nodeData.label,
        description: nodeData.description || '',
        group: nodeData.group || 'foundation',
        year: nodeData.year || new Date().getFullYear(),
        formula: nodeData.formula || null,
        triz: nodeData.triz || null
      }
    );

    return result.records[0].get('n').properties;
  } finally {
    await session.close();
  }
}

/**
 * Update a node
 */
export async function updateNode(id, updates) {
  const session = getSession();
  try {
    const setClauses = Object.keys(updates)
      .filter(key => updates[key] !== undefined)
      .map(key => `n.${key} = $${key}`)
      .join(', ');

    const result = await session.run(
      `
      MATCH (n:Concept {id: $id})
      SET ${setClauses}
      RETURN n
      `,
      { id, ...updates }
    );

    if (result.records.length === 0) {
      throw new Error('Node not found');
    }

    return result.records[0].get('n').properties;
  } finally {
    await session.close();
  }
}

/**
 * Delete a node
 */
export async function deleteNode(id) {
  const session = getSession();
  try {
    await session.run(
      'MATCH (n:Concept {id: $id}) DETACH DELETE n',
      { id }
    );
  } finally {
    await session.close();
  }
}

/**
 * Get all edges
 */
export async function getEdges(filters = {}) {
  const session = getSession();
  try {
    let query = `
      MATCH (n:Concept)-[r]->(m:Concept)
      ${filters.type ? 'WHERE r.type = $type' : ''}
      RETURN r, n, m
    `;

    const result = await session.run(query, { type: filters.type });

    return result.records.map(record => {
      const rel = record.get('r');
      const source = record.get('n').properties;
      const target = record.get('m').properties;

      return {
        id: rel.identity.toNumber(),
        from: source.id,
        to: target.id,
        ...rel.properties
      };
    });
  } finally {
    await session.close();
  }
}

/**
 * Create a new edge
 */
export async function createEdge(edgeData) {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (from:Concept {id: $from})
      MATCH (to:Concept {id: $to})
      CREATE (from)-[r:RELATES {
        type: $type,
        label: $label,
        weight: $weight
      }]->(to)
      RETURN r, from, to
      `,
      {
        from: edgeData.from,
        to: edgeData.to,
        type: edgeData.type || 'relates',
        label: edgeData.label || '',
        weight: edgeData.weight || 1.0
      }
    );

    const rel = result.records[0].get('r');
    const source = result.records[0].get('from').properties;
    const target = result.records[0].get('to').properties;

    return {
      id: rel.identity.toNumber(),
      from: source.id,
      to: target.id,
      ...rel.properties
    };
  } finally {
    await session.close();
  }
}

/**
 * Delete an edge
 */
export async function deleteEdge(id) {
  const session = getSession();
  try {
    await session.run(
      'MATCH ()-[r]->() WHERE ID(r) = $id DELETE r',
      { id: parseInt(id) }
    );
  } finally {
    await session.close();
  }
}

/**
 * Search nodes by text query
 */
export async function searchNodes(query, limit = 20) {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (n:Concept)
      WHERE n.label CONTAINS $query
         OR n.title CONTAINS $query
         OR n.description CONTAINS $query
      RETURN n
      LIMIT $limit
      `,
      { query, limit }
    );

    return result.records.map(record => record.get('n').properties);
  } finally {
    await session.close();
  }
}

/**
 * Get neighbors of a node
 */
export async function getNeighbors(id, depth = 1) {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH path = (n:Concept {id: $id})-[*1..${depth}]-(neighbor:Concept)
      RETURN neighbor, relationships(path) as rels
      `,
      { id }
    );

    const neighbors = [];
    const edges = [];

    result.records.forEach(record => {
      neighbors.push(record.get('neighbor').properties);

      const rels = record.get('rels');
      rels.forEach(rel => {
        edges.push({
          id: rel.identity.toNumber(),
          ...rel.properties
        });
      });
    });

    return { neighbors, edges };
  } finally {
    await session.close();
  }
}

/**
 * Seed the database with initial data
 */
export async function seedDatabase() {
  const session = getSession();
  try {
    // Clear existing data
    await session.run('MATCH (n) DETACH DELETE n');

    // Create nodes
    for (const node of GRAPH_DATA.nodes) {
      await session.run(
        `
        CREATE (n:Concept {
          id: $id,
          label: $label,
          title: $title,
          description: $description,
          group: $group,
          year: $year,
          formula: $formula,
          triz: $triz
        })
        `,
        node
      );
    }

    // Create edges
    for (const edge of GRAPH_DATA.edges) {
      await session.run(
        `
        MATCH (from:Concept {id: $from})
        MATCH (to:Concept {id: $to})
        CREATE (from)-[r:RELATES {
          type: $type,
          label: $label,
          weight: $weight
        }]->(to)
        `,
        {
          from: edge.from.toString(),
          to: edge.to.toString(),
          type: edge.type,
          label: edge.label,
          weight: edge.weight || 1.0
        }
      );
    }

    // Create indexes
    await session.run('CREATE INDEX concept_id IF NOT EXISTS FOR (n:Concept) ON (n.id)');
    await session.run('CREATE INDEX concept_group IF NOT EXISTS FOR (n:Concept) ON (n.group)');
    await session.run('CREATE INDEX concept_year IF NOT EXISTS FOR (n:Concept) ON (n.year)');

    return { message: 'Database seeded successfully' };
  } finally {
    await session.close();
  }
}
