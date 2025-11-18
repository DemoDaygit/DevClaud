import { getSession } from '../config/neo4j.js';
import { Builder } from 'xml2js';
import Papa from 'papaparse';

/**
 * Export graph to JSON
 */
export async function exportToJSON() {
  const session = getSession();
  try {
    const nodeResult = await session.run('MATCH (n:Concept) RETURN n');
    const edgeResult = await session.run('MATCH (n:Concept)-[r]->(m:Concept) RETURN n, r, m');

    const nodes = nodeResult.records.map(record => record.get('n').properties);
    const edges = edgeResult.records.map(record => {
      const source = record.get('n').properties;
      const target = record.get('m').properties;
      const rel = record.get('r');

      return {
        id: rel.identity.toNumber(),
        from: source.id,
        to: target.id,
        ...rel.properties
      };
    });

    return {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '4.0.0',
        nodeCount: nodes.length,
        edgeCount: edges.length
      },
      nodes,
      edges
    };
  } finally {
    await session.close();
  }
}

/**
 * Export graph to GraphML format
 */
export async function exportToGraphML() {
  const session = getSession();
  try {
    const data = await exportToJSON();

    const graphml = {
      graphml: {
        $: {
          xmlns: 'http://graphml.graphdrawing.org/xmlns',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'xsi:schemaLocation': 'http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd'
        },
        key: [
          { $: { id: 'd0', for: 'node', 'attr.name': 'label', 'attr.type': 'string' } },
          { $: { id: 'd1', for: 'node', 'attr.name': 'group', 'attr.type': 'string' } },
          { $: { id: 'd2', for: 'node', 'attr.name': 'year', 'attr.type': 'int' } },
          { $: { id: 'd3', for: 'node', 'attr.name': 'description', 'attr.type': 'string' } },
          { $: { id: 'd4', for: 'edge', 'attr.name': 'type', 'attr.type': 'string' } },
          { $: { id: 'd5', for: 'edge', 'attr.name': 'weight', 'attr.type': 'double' } }
        ],
        graph: {
          $: { id: 'G', edgedefault: 'directed' },
          node: data.nodes.map(node => ({
            $: { id: node.id },
            data: [
              { $: { key: 'd0' }, _: node.label },
              { $: { key: 'd1' }, _: node.group },
              { $: { key: 'd2' }, _: node.year.toString() },
              { $: { key: 'd3' }, _: node.description }
            ]
          })),
          edge: data.edges.map((edge, idx) => ({
            $: { id: `e${idx}`, source: edge.from, target: edge.to },
            data: [
              { $: { key: 'd4' }, _: edge.type },
              { $: { key: 'd5' }, _: (edge.weight || 1.0).toString() }
            ]
          }))
        }
      }
    };

    const builder = new Builder();
    return builder.buildObject(graphml);
  } finally {
    await session.close();
  }
}

/**
 * Export graph to Cypher CREATE statements
 */
export async function exportToCypher() {
  const session = getSession();
  try {
    const data = await exportToJSON();

    let cypher = '// Knowledge Graph - Cypher Export\n';
    cypher += `// Generated: ${new Date().toISOString()}\n\n`;

    // Clear existing data
    cypher += '// Clear existing data\n';
    cypher += 'MATCH (n) DETACH DELETE n;\n\n';

    // Create nodes
    cypher += '// Create nodes\n';
    data.nodes.forEach(node => {
      cypher += `CREATE (:Concept {
  id: "${node.id}",
  label: "${escapeString(node.label)}",
  title: "${escapeString(node.title || node.label)}",
  description: "${escapeString(node.description)}",
  group: "${node.group}",
  year: ${node.year}${node.formula ? `,\n  formula: "${escapeString(node.formula)}"` : ''}${node.triz ? `,\n  triz: "${escapeString(node.triz)}"` : ''}
});\n`;
    });

    cypher += '\n// Create relationships\n';
    data.edges.forEach(edge => {
      cypher += `MATCH (a:Concept {id: "${edge.from}"}), (b:Concept {id: "${edge.to}"})
CREATE (a)-[:RELATES {
  type: "${edge.type}",
  label: "${escapeString(edge.label || '')}",
  weight: ${edge.weight || 1.0}
}]->(b);\n`;
    });

    cypher += '\n// Create indexes\n';
    cypher += 'CREATE INDEX concept_id IF NOT EXISTS FOR (n:Concept) ON (n.id);\n';
    cypher += 'CREATE INDEX concept_group IF NOT EXISTS FOR (n:Concept) ON (n.group);\n';
    cypher += 'CREATE INDEX concept_year IF NOT EXISTS FOR (n:Concept) ON (n.year);\n';

    return cypher;
  } finally {
    await session.close();
  }
}

/**
 * Export nodes or edges to CSV
 */
export async function exportToCSV(type = 'nodes') {
  const session = getSession();
  try {
    const data = await exportToJSON();

    if (type === 'nodes') {
      return Papa.unparse(data.nodes, {
        quotes: true,
        header: true
      });
    } else if (type === 'edges') {
      return Papa.unparse(data.edges, {
        quotes: true,
        header: true
      });
    } else {
      throw new Error('Invalid export type. Use "nodes" or "edges"');
    }
  } finally {
    await session.close();
  }
}

/**
 * Export graph to GEXF format (Gephi)
 */
export async function exportToGEXF() {
  const session = getSession();
  try {
    const data = await exportToJSON();

    const gexf = {
      gexf: {
        $: {
          xmlns: 'http://www.gexf.net/1.2draft',
          version: '1.2'
        },
        meta: {
          creator: 'Swarm AI Knowledge Graph',
          description: 'Knowledge Graph Export',
          lastmodifieddate: new Date().toISOString().split('T')[0]
        },
        graph: {
          $: { mode: 'static', defaultedgetype: 'directed' },
          attributes: [{
            $: { class: 'node' },
            attribute: [
              { $: { id: '0', title: 'group', type: 'string' } },
              { $: { id: '1', title: 'year', type: 'integer' } },
              { $: { id: '2', title: 'description', type: 'string' } }
            ]
          }],
          nodes: {
            node: data.nodes.map(node => ({
              $: { id: node.id, label: node.label },
              attvalues: {
                attvalue: [
                  { $: { for: '0', value: node.group } },
                  { $: { for: '1', value: node.year.toString() } },
                  { $: { for: '2', value: node.description } }
                ]
              }
            }))
          },
          edges: {
            edge: data.edges.map((edge, idx) => ({
              $: {
                id: idx.toString(),
                source: edge.from,
                target: edge.to,
                label: edge.label || '',
                weight: edge.weight || 1.0
              }
            }))
          }
        }
      }
    };

    const builder = new Builder();
    return builder.buildObject(gexf);
  } finally {
    await session.close();
  }
}

/**
 * Import graph from JSON
 */
export async function importFromJSON(data) {
  const session = getSession();
  try {
    // Validate data
    if (!data.nodes || !data.edges) {
      throw new Error('Invalid JSON format. Expected {nodes: [], edges: []}');
    }

    // Clear existing data
    await session.run('MATCH (n) DETACH DELETE n');

    // Import nodes
    let nodesCreated = 0;
    for (const node of data.nodes) {
      await session.run(
        `CREATE (n:Concept {
          id: $id,
          label: $label,
          title: $title,
          description: $description,
          group: $group,
          year: $year,
          formula: $formula,
          triz: $triz
        })`,
        {
          id: node.id,
          label: node.label,
          title: node.title || node.label,
          description: node.description || '',
          group: node.group || 'foundation',
          year: node.year || new Date().getFullYear(),
          formula: node.formula || null,
          triz: node.triz || null
        }
      );
      nodesCreated++;
    }

    // Import edges
    let edgesCreated = 0;
    for (const edge of data.edges) {
      await session.run(
        `MATCH (from:Concept {id: $from})
         MATCH (to:Concept {id: $to})
         CREATE (from)-[r:RELATES {
           type: $type,
           label: $label,
           weight: $weight
         }]->(to)`,
        {
          from: edge.from,
          to: edge.to,
          type: edge.type || 'relates',
          label: edge.label || '',
          weight: edge.weight || 1.0
        }
      );
      edgesCreated++;
    }

    return {
      success: true,
      nodesCreated,
      edgesCreated
    };
  } finally {
    await session.close();
  }
}

/**
 * Helper: Escape strings for Cypher
 */
function escapeString(str) {
  if (!str) return '';
  return str.replace(/"/g, '\\"').replace(/\n/g, '\\n');
}
