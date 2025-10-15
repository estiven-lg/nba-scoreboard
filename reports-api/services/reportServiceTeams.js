const PdfPrinter = require('pdfmake');
const couch = require('../config/couchdb');
const axios = require('axios');
const printer = new PdfPrinter({
    Roboto: {
        normal: 'public/fonts/Roboto-Regular.ttf',
        bold: 'public/fonts/Roboto-Medium.ttf',
        italics: 'public/fonts/Roboto-Italic.ttf',
        bolditalics: 'public/fonts/Roboto-MediumItalic.ttf'
    }
});

const header = require('../templates/header');
const fs = require('fs');
const path = require('path');

async function generateReportTeams(res) {
    try {
        const docs = await couch.getTeams();

        // Generar tabla con los equipos
        const body = [
            [{ text: 'Nombre', bold: true }, { text: 'Ciudad', bold: true }, { text: 'Logo', bold: true }]
        ];

        for (const team of docs) {
            let imageData = null;

            // Si hay logo, convertirlo a base64
            if (team.LogoUrl) {
                try {
                    // Descargar imagen desde la web
                    const response = await axios.get(team.LogoUrl, { responseType: 'arraybuffer' });
                    const data = Buffer.from(response.data, 'binary');
                    imageData = 'data:image/png;base64,' + data.toString('base64');
                } catch (err) {
                    console.warn(`No se pudo cargar la imagen del equipo ${team.Name}: ${err.message}`);
                }
            }

            body.push([
                team.Name,
                team.City,
                imageData ? { image: imageData, width: 50 } : 'No logo'
            ]);
        }

        const docDefinition = {
            content: [
                header,
                { text: 'Reporte de Equipos Registrados', style: 'title', margin: [0, 10, 0, 10] },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', 60],
                        body: body
                    }
                }
            ],
            styles: {
                title: { fontSize: 16, bold: true }
            }
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        res.setHeader('Content-Type', 'application/pdf');
        pdfDoc.pipe(res);
        pdfDoc.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al generar el reporte' });
    }
}


async function generateReportTeamPlayers(req, res) {
    try {
        const teamId = req.params.id;3
        if (!teamId) {
            return res.status(400).json({ error: 'Debe proporcionar el ID del equipo.' });
        }

        // Obtener el equipo desde CouchDB
        const team = await couch.getTeam(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Equipo no encontrado.' });
        }

        // Preparar logo (si existe)
        let imageData = null;
        if (team.LogoUrl) {
            try {
                const response = await axios.get(team.LogoUrl, { responseType: 'arraybuffer' });
                const data = Buffer.from(response.data, 'binary');
                imageData = 'data:image/png;base64,' + data.toString('base64');
            } catch (err) {
                console.warn(`No se pudo cargar el logo del equipo ${team.Name}: ${err.message}`);
            }
        }

        // Encabezado de tabla
        const body = [
            [
                { text: 'Nombre completo', bold: true },
                { text: 'Número', bold: true },
                { text: 'Posición', bold: true },
                { text: 'Edad', bold: true },
                { text: 'Estatura', bold: true },
                { text: 'Nacionalidad', bold: true }
            ]
        ];

        // Llenar filas con los jugadores
        for (const player of team.Players) {
            body.push([
                player.FullName || '—',
                player.JerseyNumber || '—',
                player.Position || '—',
                player.Age || '—',
                player.Height ? `${player.Height} cm` : '—',
                player.Nationality || '—'
            ]);
        }

        // Definición del documento PDF
        const docDefinition = {
            content: [
                header,
                {
                    stack: [
                        {
                            columns: [
                                imageData ? { image: imageData, width: 60 } : { text: 'No logo', alignment: 'center' },
                                {
                                    text: `Reporte de Jugadores del Equipo: ${team.Name}`,
                                    style: 'title',
                                    alignment: 'center',
                                    margin: [0, 10, 0, 10]
                                }
                            ]
                        },
                        { text: `Ciudad: ${team.City}`, margin: [0, 0, 0, 10], alignment: 'center' }
                    ],
                    margin: [0, 10, 0, 20],
                    fillColor: '#f0f0f0',
                    padding: 5
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 50, '*', 50, 60, '*'],
                        body: body
                    }
                }
            ],
            styles: {
                title: { fontSize: 16, bold: true }
            }
        };

        // Generar PDF
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        res.setHeader('Content-Type', 'application/pdf');
        pdfDoc.pipe(res);
        pdfDoc.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al generar el reporte de jugadores.' });
    }
}


module.exports = { generateReportTeams, generateReportTeamPlayers };