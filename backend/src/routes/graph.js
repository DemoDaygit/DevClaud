import express from 'express';
import * as graphService from '../services/graphService.js';

const router = express.Router();

/**
 * GET /api/graph
 * Get all nodes and edges
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, year, limit = 1000 } = req.query;
    const data = await graphService.getGraph({ category, year, limit: parseInt(limit) });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/graph/nodes
 * Get all nodes
 */
router.get('/nodes', async (req, res, next) => {
  try {
    const { category, year } = req.query;
    const nodes = await graphService.getNodes({ category, year });
    res.json({ nodes, count: nodes.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/graph/nodes/:id
 * Get specific node by ID
 */
router.get('/nodes/:id', async (req, res, next) => {
  try {
    const node = await graphService.getNodeById(req.params.id);
    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }
    res.json(node);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/graph/nodes
 * Create a new node
 */
router.post('/nodes', async (req, res, next) => {
  try {
    const nodeData = req.body;
    const node = await graphService.createNode(nodeData);
    res.status(201).json(node);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/graph/nodes/:id
 * Update a node
 */
router.put('/nodes/:id', async (req, res, next) => {
  try {
    const node = await graphService.updateNode(req.params.id, req.body);
    res.json(node);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/graph/nodes/:id
 * Delete a node
 */
router.delete('/nodes/:id', async (req, res, next) => {
  try {
    await graphService.deleteNode(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/graph/edges
 * Get all edges
 */
router.get('/edges', async (req, res, next) => {
  try {
    const { type } = req.query;
    const edges = await graphService.getEdges({ type });
    res.json({ edges, count: edges.length });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/graph/edges
 * Create a new edge
 */
router.post('/edges', async (req, res, next) => {
  try {
    const edge = await graphService.createEdge(req.body);
    res.status(201).json(edge);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/graph/edges/:id
 * Delete an edge
 */
router.delete('/edges/:id', async (req, res, next) => {
  try {
    await graphService.deleteEdge(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/graph/search
 * Search nodes by query
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q, limit = 20 } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    const results = await graphService.searchNodes(q, parseInt(limit));
    res.json({ results, count: results.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/graph/neighbors/:id
 * Get neighbors of a node
 */
router.get('/neighbors/:id', async (req, res, next) => {
  try {
    const { depth = 1 } = req.query;
    const neighbors = await graphService.getNeighbors(req.params.id, parseInt(depth));
    res.json(neighbors);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/graph/seed
 * Seed the database with initial data
 */
router.post('/seed', async (req, res, next) => {
  try {
    await graphService.seedDatabase();
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
