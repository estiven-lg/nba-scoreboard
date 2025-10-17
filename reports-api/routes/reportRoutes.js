const express = require('express');
const router = express.Router();
const { generateReportPlayerStats } = require('../services/reportServicePlayers');
const { generateReportTeams, generateReportTeamPlayers } = require('../services/reportServiceTeams');
const { generateReportGames, generateReportGamesPlayers } = require('../services/reportServiceGames');
// GET /reportes/player
router.get('/players/:id', generateReportPlayerStats);

// GET /reports/games
router.get('/games', generateReportGames);
router.get('/games/:id', generateReportGamesPlayers);

// GET /reports/teams
router.get('/teams', generateReportTeams);
router.get('/teams/:id', generateReportTeamPlayers);




module.exports = router;
