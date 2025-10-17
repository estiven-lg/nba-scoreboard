var fonts = {
  Roboto: {
    normal: 'public/fonts/Roboto-Regular.ttf',
    bold: 'public/fonts/Roboto-Medium.ttf',
    italics: 'public/fonts/Roboto-Italic.ttf',
    bolditalics: 'public/fonts/Roboto-MediumItalic.ttf'
  }
};

const PdfPrinter = require('pdfmake');
const couch = require('../config/couchdb');
const axios = require('axios');
const printer = new PdfPrinter(fonts);

const header = require('../templates/header');

async function generateReportGames(req, res) {
  try {
    const docs = await couch.getGames();

    const formatDate = (dateString) => {
      if (!dateString) return '—';
      const date = new Date(dateString);
      return date.toLocaleString('es-GT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getGameStatus = (status) => {
      const statuses = {
        0: 'No Iniciado',
        1: 'En Curso',
        2: 'Pausado',
        3: 'Finalizado',
        4: 'Suspendido'
      };
      return statuses[status] || 'Desconocido';
    };

    const body = [
      [
        { text: 'Fecha/Hora', bold: true, fillColor: '#1976D2', color: 'white' },
        { text: 'Equipo Local', bold: true, fillColor: '#1976D2', color: 'white' },
        { text: 'Equipo Visitante', bold: true, fillColor: '#1976D2', color: 'white' },
        { text: 'Marcador', bold: true, fillColor: '#1976D2', color: 'white', alignment: 'center' },
        { text: 'Estado', bold: true, fillColor: '#1976D2', color: 'white', alignment: 'center' }
      ]
    ];

    for (const game of docs) {
      const homeTeamName = game.HomeTeam?.Name || game.HomeTeam || '—';
      const awayTeamName = game.AwayTeam?.Name || game.AwayTeam || '—';
      const homeCity = game.HomeTeam?.City ? `(${game.HomeTeam.City})` : '';
      const awayCity = game.AwayTeam?.City ? `(${game.AwayTeam.City})` : '';

      body.push([
        { text: formatDate(game.GameDate), fontSize: 10 },
        { text: `${homeTeamName}\n${homeCity}`, fontSize: 10, color: '#424242' },
        { text: `${awayTeamName}\n${awayCity}`, fontSize: 10, color: '#424242' },
        { 
          text: `${game.HomeScore || 0} - ${game.AwayScore || 0}`, 
          fontSize: 12, 
          bold: true, 
          alignment: 'center',
          color: game.GameStatus === 3 ? '#1976D2' : '#757575'
        },
        { 
          text: getGameStatus(game.GameStatus), 
          fontSize: 9, 
          alignment: 'center',
          color: game.GameStatus === 3 ? '#4CAF50' : '#FF9800'
        }
      ]);
    }

    const docDefinition = {
      content: [
        header,
        { 
          text: 'Historial de Partidos', 
          style: 'title', 
          margin: [0, 10, 0, 20] 
        },
        {
          text: `Total de partidos registrados: ${docs.length}`,
          style: 'subtitle',
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            headerRows: 1,
            widths: [80, '*', '*', 70, 70],
            body: body
          },
          layout: {
            fillColor: function (rowIndex) {
              return (rowIndex === 0) ? '#1976D2' : (rowIndex % 2 === 0 ? '#f5f5f5' : null);
            },
            hLineWidth: function (i, node) {
              return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
            },
            vLineWidth: function () {
              return 0.5;
            },
            hLineColor: function () {
              return '#e0e0e0';
            },
            vLineColor: function () {
              return '#e0e0e0';
            }
          }
        }
      ],
      styles: {
        title: { 
          fontSize: 18, 
          bold: true, 
          alignment: 'center',
          color: '#1976D2'
        },
        subtitle: {
          fontSize: 12,
          color: '#666666',
          alignment: 'center'
        }
      },
      pageMargins: [40, 60, 40, 40],
      pageOrientation: 'landscape'
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=historial-partidos.pdf');
    res.setHeader('Cache-Control', 'no-cache');
    pdfDoc.pipe(res);
    pdfDoc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
}

async function generateReportGamesPlayers(req, res) {
    try {
        const gameId = req.params.id;
        if (!gameId) {
            return res.status(400).json({ error: 'Debe proporcionar el ID del juego.' });
        }

        const game = await couch.getGame(gameId);
        if (!game) {
            return res.status(404).json({ error: 'Juego no encontrado.' });
        }

        const docDefinition = {
            content: [
                header,
                // demas elementos del PDF
            ],
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        res.setHeader('Content-Type', 'application/pdf');
        pdfDoc.pipe(res);
        pdfDoc.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al generar el reporte de jugadores.' });
    }
}

async function generateReportGameRoster(req, res) {
    try {
        const gameId = req.params.id;
        if (!gameId) {
            return res.status(400).json({ error: 'Debe proporcionar el ID del juego.' });
        }

        const game = await couch.getGame(gameId);
        if (!game) {
            return res.status(404).json({ error: 'Juego no encontrado.' });
        }

        const formatDate = (dateString) => {
            if (!dateString) return '—';
            const date = new Date(dateString);
            return date.toLocaleString('es-GT', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const getGameStatus = (status) => {
            const statuses = {
                0: 'No Iniciado',
                1: 'En Curso',
                2: 'Pausado',
                3: 'Finalizado',
                4: 'Suspendido'
            };
            return statuses[status] || 'Desconocido';
        };

        // Cargar logos de equipos
        let homeTeamLogo = null;
        let awayTeamLogo = null;

        if (game.HomeTeam?.LogoUrl) {
            try {
                const response = await axios.get(game.HomeTeam.LogoUrl, { responseType: 'arraybuffer' });
                const data = Buffer.from(response.data, 'binary');
                homeTeamLogo = 'data:image/png;base64,' + data.toString('base64');
            } catch (err) {
                console.warn(`No se pudo cargar el logo del equipo local: ${err.message}`);
            }
        }

        if (game.AwayTeam?.LogoUrl) {
            try {
                const response = await axios.get(game.AwayTeam.LogoUrl, { responseType: 'arraybuffer' });
                const data = Buffer.from(response.data, 'binary');
                awayTeamLogo = 'data:image/png;base64,' + data.toString('base64');
            } catch (err) {
                console.warn(`No se pudo cargar el logo del equipo visitante: ${err.message}`);
            }
        }

        const homePlayersBody = [
            [
                { text: '#', bold: true, fillColor: '#1976D2', color: 'white', alignment: 'center' },
                { text: 'Nombre', bold: true, fillColor: '#1976D2', color: 'white' },
                { text: 'Posición', bold: true, fillColor: '#1976D2', color: 'white', alignment: 'center' },
                { text: 'Edad', bold: true, fillColor: '#1976D2', color: 'white', alignment: 'center' },
                { text: 'Estatura', bold: true, fillColor: '#1976D2', color: 'white', alignment: 'center' },
                { text: 'Nacionalidad', bold: true, fillColor: '#1976D2', color: 'white' }
            ]
        ];

        const homePlayers = game.HomeTeam?.Players || [];
        if (homePlayers.length > 0) {
            for (const player of homePlayers) {
                homePlayersBody.push([
                    { text: player.JerseyNumber || '—', alignment: 'center', fontSize: 10, bold: true },
                    { text: player.FullName || '—', fontSize: 10 },
                    { text: player.Position || '—', alignment: 'center', fontSize: 10 },
                    { text: player.Age || '—', alignment: 'center', fontSize: 10 },
                    { text: player.Height ? `${player.Height} m` : '—', alignment: 'center', fontSize: 10 },
                    { text: player.Nationality || '—', fontSize: 10 }
                ]);
            }
        } else {
            homePlayersBody.push([
                { text: 'Sin jugadores registrados', colSpan: 6, alignment: 'center', color: '#757575', italics: true }
            ]);
        }

        const awayPlayersBody = [
            [
                { text: '#', bold: true, fillColor: '#D32F2F', color: 'white', alignment: 'center' },
                { text: 'Nombre', bold: true, fillColor: '#D32F2F', color: 'white' },
                { text: 'Posición', bold: true, fillColor: '#D32F2F', color: 'white', alignment: 'center' },
                { text: 'Edad', bold: true, fillColor: '#D32F2F', color: 'white', alignment: 'center' },
                { text: 'Estatura', bold: true, fillColor: '#D32F2F', color: 'white', alignment: 'center' },
                { text: 'Nacionalidad', bold: true, fillColor: '#D32F2F', color: 'white' }
            ]
        ];

        const awayPlayers = game.AwayTeam?.Players || [];
        if (awayPlayers.length > 0) {
            for (const player of awayPlayers) {
                awayPlayersBody.push([
                    { text: player.JerseyNumber || '—', alignment: 'center', fontSize: 10, bold: true },
                    { text: player.FullName || '—', fontSize: 10 },
                    { text: player.Position || '—', alignment: 'center', fontSize: 10 },
                    { text: player.Age || '—', alignment: 'center', fontSize: 10 },
                    { text: player.Height ? `${player.Height} m` : '—', alignment: 'center', fontSize: 10 },
                    { text: player.Nationality || '—', fontSize: 10 }
                ]);
            }
        } else {
            awayPlayersBody.push([
                { text: 'Sin jugadores registrados', colSpan: 6, alignment: 'center', color: '#757575', italics: true }
            ]);
        }

        const docDefinition = {
            content: [
                header,
                { 
                    text: 'Reporte de Roster por Partido', 
                    style: 'title', 
                    margin: [0, 10, 0, 20] 
                },
                {
                    table: {
                        widths: ['*'],
                        body: [
                            [
                                {
                                    stack: [
                                        { text: 'Información del Partido', fontSize: 14, bold: true, color: '#1976D2', margin: [0, 0, 0, 10] },
                                        { text: `Fecha y Hora: ${formatDate(game.GameDate)}`, fontSize: 11, margin: [0, 3] },
                                        { text: `Estado: ${getGameStatus(game.GameStatus)}`, fontSize: 11, margin: [0, 3] },
                                        { text: `Marcador Final: ${game.HomeScore || 0} - ${game.AwayScore || 0}`, fontSize: 11, bold: true, margin: [0, 3] },
                                        { text: `Periodo: ${game.CurrentPeriod || 1}`, fontSize: 11, margin: [0, 3] }
                                    ],
                                    margin: 10
                                }
                            ]
                        ]
                    },
                    layout: {
                        fillColor: '#f5f5f5',
                        hLineWidth: () => 1,
                        vLineWidth: () => 1,
                        hLineColor: () => '#e0e0e0',
                        vLineColor: () => '#e0e0e0'
                    },
                    margin: [0, 0, 0, 20]
                },
                {
                    columns: [
                        homeTeamLogo ? { image: homeTeamLogo, width: 60, alignment: 'center' } : { text: '', width: 60 },
                        {
                            stack: [
                                { text: game.HomeTeam?.Name || 'Equipo Local', fontSize: 16, bold: true, color: '#1976D2' },
                                { text: game.HomeTeam?.City ? `(${game.HomeTeam.City})` : '', fontSize: 11, color: '#666666' }
                            ],
                            margin: [10, 5, 0, 0]
                        }
                    ],
                    margin: [0, 0, 0, 10]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: [40, '*', 60, 40, 60, 80],
                        body: homePlayersBody
                    },
                    layout: {
                        fillColor: function (rowIndex) {
                            return (rowIndex === 0) ? '#1976D2' : (rowIndex % 2 === 0 ? '#f5f5f5' : null);
                        },
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
                        },
                        vLineWidth: () => 0.5,
                        hLineColor: () => '#e0e0e0',
                        vLineColor: () => '#e0e0e0'
                    },
                    margin: [0, 0, 0, 30]
                },
                {
                    columns: [
                        awayTeamLogo ? { image: awayTeamLogo, width: 60, alignment: 'center' } : { text: '', width: 60 },
                        {
                            stack: [
                                { text: game.AwayTeam?.Name || 'Equipo Visitante', fontSize: 16, bold: true, color: '#D32F2F' },
                                { text: game.AwayTeam?.City ? `(${game.AwayTeam.City})` : '', fontSize: 11, color: '#666666' }
                            ],
                            margin: [10, 5, 0, 0]
                        }
                    ],
                    margin: [0, 0, 0, 10]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: [40, '*', 60, 40, 60, 80],
                        body: awayPlayersBody
                    },
                    layout: {
                        fillColor: function (rowIndex) {
                            return (rowIndex === 0) ? '#D32F2F' : (rowIndex % 2 === 0 ? '#f5f5f5' : null);
                        },
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
                        },
                        vLineWidth: () => 0.5,
                        hLineColor: () => '#e0e0e0',
                        vLineColor: () => '#e0e0e0'
                    }
                }
            ],
            styles: {
                title: { 
                    fontSize: 18, 
                    bold: true, 
                    alignment: 'center',
                    color: '#1976D2'
                }
            },
            pageMargins: [40, 60, 40, 40]
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=roster-partido-${gameId}.pdf`);
        res.setHeader('Cache-Control', 'no-cache');
        pdfDoc.pipe(res);
        pdfDoc.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al generar el reporte de roster.' });
    }
}

module.exports = { generateReportGames, generateReportGamesPlayers, generateReportGameRoster };