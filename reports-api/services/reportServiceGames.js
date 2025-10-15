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

async function generateReportGames(res) {
  try {

    const docs = await couch.getGames();

    var docDefinition = {
      content: [
        header,
        // demas elementos del PDF
        
      ],
    };

    // Generar PDF y enviarlo
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    res.setHeader('Content-Type', 'application/pdf');
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

        // Obtener el juego desde CouchDB
        const game = await couch.getGame(gameId);
        if (!game) {
            return res.status(404).json({ error: 'Juego no encontrado.' });
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



module.exports = { generateReportGames, generateReportGamesPlayers };
