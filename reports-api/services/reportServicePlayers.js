const PdfPrinter = require('pdfmake');
const couch = require('../config/couchdb');
const printer = new PdfPrinter({
  Roboto: {
    normal: 'public/fonts/Roboto-Regular.ttf',
    bold: 'public/fonts/Roboto-Medium.ttf',
    italics: 'public/fonts/Roboto-Italic.ttf',
    bolditalics: 'public/fonts/Roboto-MediumItalic.ttf'
  }
});
const axios = require('axios');
const header = require('../templates/header');

async function generateReportPlayerStats(req, res) {
  try {
    const playerId = req.params.id; // Ej: /report/playerstats/2
    if (!playerId) {
      return res.status(400).json({ error: 'Debe proporcionar el ID del jugador.' });
    }

    // Obtener datos del jugador y sus estadísticas
    const Player = await couch.getPlayer(playerId);
    const Playersfaults = await couch.getPlayersfaults(playerId);

    if (!Player) {
      return res.status(404).json({ error: 'Jugador no encontrado.' });
    }

    // Logo del equipo si existe
    let imageData = null;
    if (Player.Team?.LogoUrl) {
      try {
        const response = await axios.get(Player.Team.LogoUrl, { responseType: 'arraybuffer' });
        const data = Buffer.from(response.data, 'binary');
        imageData = 'data:image/png;base64,' + data.toString('base64');
      } catch (err) {
        console.warn(`No se pudo cargar el logo del equipo ${Player.Team?.Name}: ${err.message}`);
      }
    }

    // Encabezado de jugador
    const playerInfo = [
      { text: `Nombre: ${Player.FullName}`, margin: [0, 5, 0, 2] },
      { text: `Equipo: ${Player.Team?.Name || '—'} (${Player.Team?.City || '—'})`, margin: [0, 0, 0, 2] },
      { text: `Posición: ${Player.Position || '—'}`, margin: [0, 0, 0, 2] },
      { text: `Edad: ${Player.Age || '—'} años`, margin: [0, 0, 0, 2] },
      { text: `Estatura: ${Player.Height ? Player.Height + ' cm' : '—'}`, margin: [0, 0, 0, 2] },
      { text: `Nacionalidad: ${Player.Nationality || '—'}` }
    ];

    // Tabla de estadísticas (faltas)
    const body = [
      [
        { text: 'Juego', bold: true },
        { text: 'Fecha', bold: true },
        { text: 'Período', bold: true },
        { text: 'Faltas', bold: true }
      ]
    ];

    if (Playersfaults && Playersfaults.length > 0) {
      for (const f of Playersfaults) {
        body.push([
          `#${f.GameId}`,
          f.Game?.GameDate ? new Date(f.Game.GameDate).toLocaleDateString() : '—',
          f.Period || '—',
          f.FoulCount ?? '—'
        ]);
      }
    } else {
      body.push([{ text: 'No hay estadísticas registradas', colSpan: 4, alignment: 'center' }, {}, {}, {}]);
    }

    // Estructura del PDF
    const docDefinition = {
      content: [
        header,
        {
          columns: [
            imageData ? { image: imageData, width: 60 } : { text: 'No logo', alignment: 'center' },
            {
              text: `Reporte de Estadísticas del Jugador`,
              style: 'title',
              alignment: 'center',
              margin: [0, 10, 0, 10]
            }
          ]
        },
        {
          table: {
            widths: ['*'],
            body: [[{ stack: playerInfo }]]
          },
          layout: 'noBorders',
          margin: [0, 10, 0, 20]
        },
        {
          text: 'Resumen de Faltas',
          style: 'subtitle',
          margin: [0, 0, 0, 5]
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto'],
            body: body
          }
        }
      ],
      styles: {
        title: { fontSize: 16, bold: true },
        subtitle: { fontSize: 14, bold: true }
      }
    };

    // Generar y enviar PDF
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    res.setHeader('Content-Type', 'application/pdf');
    pdfDoc.pipe(res);
    pdfDoc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar el reporte de estadísticas del jugador.' });
  }
}

module.exports = { generateReportPlayerStats };
