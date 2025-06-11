/**
 * @file lookupRoutes.js
 * @description Defines API routes for fetching general lookup data like categories and locations.
 */
const express = require('express');
const router = express.Router();
const { JobCategory, Location } = require('../models');

// @route   GET /api/lookups/categories
// @desc    Get a list of all available job categories
// @access  Public
router.get('/categories', async (req, res) => {
    try {
        const categories = await JobCategory.findAll({
            order: [['CategoryName', 'ASC']]
        });
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching job categories:', error);
        res.status(500).json({ message: 'Server error while fetching job categories.' });
    }
});

// @route   GET /api/lookups/locations
// @desc    Get a list of all available locations
// @access  Public
router.get('/locations', async (req, res) => {
    try {
        const locations = await Location.findAll({
            order: [['LocationName', 'ASC']]
        });
        res.status(200).json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ message: 'Server error while fetching locations.' });
    }
});

module.exports = router;