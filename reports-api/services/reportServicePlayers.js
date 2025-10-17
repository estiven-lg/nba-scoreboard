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

async function generateReportPlayerStats(req, res) {
    try {
        const PlayerId = req.params.id;
        if (!PlayerId) {
            return res.status(400).json({ error: 'Debe proporcionar el ID del jugador.' });
        }

        const Player = await couch.getPlayer(PlayerId);
        const PlayersFaults = await couch.getPlayersfaults(PlayerId);
        
        if (!Player) {
            return res.status(404).json({ error: 'Jugador no encontrado.' });
        }

        const allGames = await couch.getGames();
        
        const playerGames = allGames.filter(game => {
            const homeTeamId = game.HomeTeam?.TeamID || game.HomeTeam;
            const awayTeamId = game.AwayTeam?.TeamID || game.AwayTeam;
            return (homeTeamId === Player.TeamID || awayTeamId === Player.TeamID) && game.GameStatus === 3;
        });

        const totalGames = playerGames.length;
        const totalFouls = PlayersFaults.length;
        
        const foulsByPeriod = {};
        PlayersFaults.forEach(fault => {
            const period = fault.Period || 1;
            foulsByPeriod[period] = (foulsByPeriod[period] || 0) + 1;
        });

        const foulsPeriodBody = [
            [
                { text: 'Periodo', bold: true, fillColor: '#1976D2', color: 'white', alignment: 'center' },
                { text: 'Faltas', bold: true, fillColor: '#1976D2', color: 'white', alignment: 'center' }
            ]
        ];

        Object.keys(foulsByPeriod).sort().forEach(period => {
            foulsPeriodBody.push([
                { text: `Periodo ${period}`, alignment: 'center', fontSize: 10 },
                { text: foulsByPeriod[period].toString(), alignment: 'center', fontSize: 10, bold: true }
            ]);
        });

        if (Object.keys(foulsByPeriod).length === 0) {
            foulsPeriodBody.push([
                { text: 'Sin faltas registradas', colSpan: 2, alignment: 'center', color: '#757575', italics: true }
            ]);
        }

        const docDefinition = {
            content: [
                header,
                { 
                    text: 'Reporte de Estadísticas del Jugador', 
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
                                        { text: 'Información del Jugador', fontSize: 14, bold: true, color: '#1976D2', margin: [0, 0, 0, 10] },
                                        { text: `Nombre Completo: ${Player.FullName || '—'}`, fontSize: 11, margin: [0, 3] },
                                        { text: `Número de Jersey: ${Player.JerseyNumber || '—'}`, fontSize: 11, margin: [0, 3] },
                                        { text: `Posición: ${Player.Position || '—'}`, fontSize: 11, margin: [0, 3] },
                                        { text: `Edad: ${Player.Age || '—'}`, fontSize: 11, margin: [0, 3] },
                                        { text: `Estatura: ${Player.Height ? `${Player.Height} m` : '—'}`, fontSize: 11, margin: [0, 3] },
                                        { text: `Nacionalidad: ${Player.Nationality || '—'}`, fontSize: 11, margin: [0, 3] }
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
                    text: 'Estadísticas Generales',
                    style: 'sectionTitle',
                    margin: [0, 10, 0, 10]
                },
                {
                    columns: [
                        {
                            width: '*',
                            stack: [
                                {
                                    table: {
                                        widths: ['*', '*'],
                                        body: [
                                            [
                                                { text: 'Partidos Jugados', bold: true, fillColor: '#1976D2', color: 'white' },
                                                { text: totalGames.toString(), bold: true, fillColor: '#1976D2', color: 'white', alignment: 'center' }
                                            ],
                                            [
                                                { text: 'Total de Faltas', bold: true },
                                                { text: totalFouls.toString(), bold: true, alignment: 'center', color: '#D32F2F' }
                                            ],
                                            [
                                                { text: 'Promedio Faltas/Juego', bold: true },
                                                { text: totalGames > 0 ? (totalFouls / totalGames).toFixed(2) : '0', bold: true, alignment: 'center' }
                                            ]
                                        ]
                                    },
                                    layout: {
                                        fillColor: function (rowIndex) {
                                            return rowIndex === 0 ? '#1976D2' : (rowIndex % 2 === 0 ? '#f5f5f5' : null);
                                        },
                                        hLineWidth: () => 0.5,
                                        vLineWidth: () => 0.5,
                                        hLineColor: () => '#e0e0e0',
                                        vLineColor: () => '#e0e0e0'
                                    }
                                }
                            ]
                        }
                    ],
                    margin: [0, 0, 0, 20]
                },
                {
                    text: 'Detalle de Faltas por Periodo',
                    style: 'sectionTitle',
                    margin: [0, 10, 0, 10]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*'],
                        body: foulsPeriodBody
                    },
                    layout: {
                        fillColor: function (rowIndex) {
                            return rowIndex === 0 ? '#1976D2' : (rowIndex % 2 === 0 ? '#f5f5f5' : null);
                        },
                        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
                        vLineWidth: () => 0.5,
                        hLineColor: () => '#e0e0e0',
                        vLineColor: () => '#e0e0e0'
                    },
                    margin: [0, 0, 0, 20]
                },
                {
                    text: 'Historial de Partidos',
                    style: 'sectionTitle',
                    margin: [0, 10, 0, 10]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', 80, 60],
                        body: [
                            [
                                { text: 'Equipo Local', bold: true, fillColor: '#1976D2', color: 'white' },
                                { text: 'Equipo Visitante', bold: true, fillColor: '#1976D2', color: 'white' },
                                { text: 'Fecha', bold: true, fillColor: '#1976D2', color: 'white', alignment: 'center' },
                                { text: 'Marcador', bold: true, fillColor: '#1976D2', color: 'white', alignment: 'center' }
                            ],
                            ...playerGames.map(game => {
                                const formatDate = (dateString) => {
                                    if (!dateString) return '—';
                                    const date = new Date(dateString);
                                    return date.toLocaleDateString('es-GT', { year: 'numeric', month: '2-digit', day: '2-digit' });
                                };

                                return [
                                    { text: game.HomeTeam?.Name || 'Local', fontSize: 9 },
                                    { text: game.AwayTeam?.Name || 'Visitante', fontSize: 9 },
                                    { text: formatDate(game.GameDate), fontSize: 9, alignment: 'center' },
                                    { text: `${game.HomeScore || 0} - ${game.AwayScore || 0}`, fontSize: 9, bold: true, alignment: 'center' }
                                ];
                            })
                        ]
                    },
                    layout: {
                        fillColor: function (rowIndex) {
                            return rowIndex === 0 ? '#1976D2' : (rowIndex % 2 === 0 ? '#f5f5f5' : null);
                        },
                        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
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
                },
                sectionTitle: {
                    fontSize: 14,
                    bold: true,
                    color: '#1976D2'
                }
            },
            pageMargins: [40, 60, 40, 40]
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=estadisticas-jugador-${PlayerId}.pdf`);
        res.setHeader('Cache-Control', 'no-cache');
        pdfDoc.pipe(res);
        pdfDoc.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al generar el reporte de jugadores.' });
    }
}

module.exports = { generateReportPlayerStats };