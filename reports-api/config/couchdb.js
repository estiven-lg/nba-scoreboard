// reports-api/config/couchdb.js
const axios = require('axios');
require('dotenv').config();

const couchApi = axios.create({
    baseURL: process.env.COUCHDB_URL+'/nba_reports/',
    timeout: 5000,
});

const couch = {

    getPlayers: async () => {
        const response = await couchApi.post('_find/', {
            selector: { doc_type: "player" },
            limit: 1000
        });

        return response.data.docs;
    },

    getPlayer: async (id) => {
        const response = await couchApi.get('player:' + id);
        return response.data;
    },
     
    getTeams: async () => {
        const response = await couchApi.post('_find/', {
            selector: { doc_type: "team" },
            limit: 1000
        });
        return response.data.docs;
    },

    getTeam: async (id) => {
        const response = await couchApi.get('team:' + id);
        return response.data;
    },

    getGames: async () =>{
        const response = await couchApi.post('_find/', {
            selector: { doc_type: "game" },
            limit: 1000
        });
        return response.data.docs;
    },
     
    getGame: async (id) => {
        const response = await couchApi.get('game:' + id);
        return response.data;
    },

    getPlayersfaults: async (id) => {
        const response = await couchApi.post('_find/', {
            selector: { doc_type: "fault", PlayerID: id },
            limit: 1000
        });
        return response.data.docs;
    }
};

module.exports = couch;
