// Fuentes básicas requeridas por pdfmake
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
const printer = new PdfPrinter(fonts);

const header = require('../templates/header');

async function generateReportPlayerStats(req, res) {
    try {
        const PlayerId = req.params.id;
        if (!PlayerId) {
            return res.status(400).json({ error: 'Debe proporcionar el ID del jugador.' });
        }

        // Obtener el jugador desde CouchDB
        const Player = await couch.getPlayer(PlayerId);
        const Playersfaults = await couch.getPlayersfaults(PlayerId);
        if (!Player) {
            return res.status(404).json({ error: 'Jugador no encontrado.' });
        }

       

        // Definición del documento PDF
        const docDefinition = {
            content: [
                header,
                // demas elementos del PDF
            ],
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

module.exports = { generateReportPlayerStats };
