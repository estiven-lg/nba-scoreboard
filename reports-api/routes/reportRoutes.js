const express = require('express');
const router = express.Router();
const { generateReportPlayerStats } = require('../services/reportServicePlayers');
const { generateReportTeams, generateReportTeamPlayers } = require('../services/reportServiceTeams');
const { generateReportGames, generateReportGamesPlayers, generateReportGameRoster } = require('../services/reportServiceGames');

router.get('/players/:id', generateReportPlayerStats);

router.get('/games', generateReportGames);
router.get('/games/:id', generateReportGamesPlayers);
router.get('/games/:id/roster', generateReportGameRoster);

router.get('/teams', generateReportTeams);
router.get('/teams/:id', generateReportTeamPlayers);

module.exports = router;
