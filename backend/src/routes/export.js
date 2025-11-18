import express from 'express';
import * as exportService from '../services/exportService.js';

const router = express.Router();

/**
 * GET /api/export/json
 * Export graph as JSON
 */
router.get('/json', async (req, res, next) => {
  try {
    const data = await exportService.exportToJSON();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="knowledge-graph.json"');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/export/graphml
 * Export graph as GraphML
 */
router.get('/graphml', async (req, res, next) => {
  try {
    const xml = await exportService.exportToGraphML();
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="knowledge-graph.graphml"');
    res.send(xml);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/export/cypher
 * Export graph as Cypher CREATE statements
 */
router.get('/cypher', async (req, res, next) => {
  try {
    const cypher = await exportService.exportToCypher();
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="knowledge-graph.cypher"');
    res.send(cypher);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/export/csv
 * Export graph as CSV (nodes and edges separately)
 */
router.get('/csv', async (req, res, next) => {
  try {
    const { type = 'nodes' } = req.query;
    const csv = await exportService.exportToCSV(type);
    const filename = `knowledge-graph-${type}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/export/import/json
 * Import graph from JSON
 */
router.post('/import/json', async (req, res, next) => {
  try {
    const result = await exportService.importFromJSON(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/export/gexf
 * Export graph as GEXF (Gephi format)
 */
router.get('/gexf', async (req, res, next) => {
  try {
    const xml = await exportService.exportToGEXF();
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="knowledge-graph.gexf"');
    res.send(xml);
  } catch (error) {
    next(error);
  }
});

export default router;
