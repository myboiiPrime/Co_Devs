const express = require('express');
const auth = require('../middleware/auth');
const geminiService = require('../services/geminiService');

const router = express.Router();

// @route   POST /api/ai/complete
// @desc    Get code completion suggestions
// @access  Private
router.post('/complete', auth, async (req, res) => {
  try {
    const { code, language, cursor } = req.body;

    if (!code || !language || !cursor) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const suggestions = await geminiService.getCodeCompletion(code, language, cursor);
    res.json({ suggestions });
  } catch (error) {
    console.error('AI completion error:', error);
    res.status(500).json({ message: 'AI service error' });
  }
});

// @route   POST /api/ai/explain
// @desc    Explain code functionality
// @access  Private
router.post('/explain', auth, async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const explanation = await geminiService.explainCode(code, language);
    res.json({ explanation });
  } catch (error) {
    console.error('AI explanation error:', error);
    res.status(500).json({ message: 'AI service error' });
  }
});

// @route   POST /api/ai/optimize
// @desc    Get code optimization suggestions
// @access  Private
router.post('/optimize', auth, async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const optimizations = await geminiService.optimizeCode(code, language);
    res.json({ optimizations });
  } catch (error) {
    console.error('AI optimization error:', error);
    res.status(500).json({ message: 'AI service error' });
  }
});

// @route   POST /api/ai/generate
// @desc    Generate code from natural language
// @access  Private
router.post('/generate', auth, async (req, res) => {
  try {
    const { prompt, language } = req.body;

    if (!prompt || !language) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const generatedCode = await geminiService.generateCode(prompt, language);
    res.json({ code: generatedCode });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ message: 'AI service error' });
  }
});

module.exports = router;