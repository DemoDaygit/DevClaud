import express from 'express';
import * as analyticsService from '../services/analyticsService.js';

const router = express.Router();

/**
 * GET /api/analytics/pagerank
 * Calculate PageRank for all nodes
 */
router.get('/pagerank', async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    const results = await analyticsService.calculatePageRank(parseInt(limit));
    res.json({ results, count: results.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/centrality
 * Calculate different centrality metrics
 */
router.get('/centrality', async (req, res, next) => {
  try {
    const { type = 'betweenness', limit = 20 } = req.query;
    const results = await analyticsService.calculateCentrality(type, parseInt(limit));
    res.json({ type, results, count: results.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/communities
 * Detect communities using Louvain algorithm
 */
router.get('/communities', async (req, res, next) => {
  try {
    const communities = await analyticsService.detectCommunities();
    res.json(communities);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/shortest-path
 * Find shortest path between two nodes
 */
router.get('/shortest-path', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'Both "from" and "to" parameters are required' });
    }
    const path = await analyticsService.findShortestPath(from, to);
    res.json(path);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/statistics
 * Get graph statistics
 */
router.get('/statistics', async (req, res, next) => {
  try {
    const stats = await analyticsService.getGraphStatistics();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/degree-distribution
 * Get degree distribution
 */
router.get('/degree-distribution', async (req, res, next) => {
  try {
    const distribution = await analyticsService.getDegreeDistribution();
    res.json(distribution);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/influence/:id
 * Calculate influence score for a node
 */
router.get('/influence/:id', async (req, res, next) => {
  try {
    const influence = await analyticsService.calculateInfluence(req.params.id);
    res.json(influence);
  } catch (error) {
    next(error);
  }
});

export default router;
