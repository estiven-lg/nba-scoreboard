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


async function generateReportGames(req, res) {
  try {
    const games = await couch.getGames(); // Método que devuelve todos los juegos

    // Encabezados de la tabla
    const body = [
      [
        { text: 'Fecha', bold: true },
        { text: 'Equipo Local', bold: true },
        { text: 'Equipo Visitante', bold: true },
        { text: 'Marcador', bold: true },
        { text: 'Estado', bold: true }
      ]
    ];

    // Función auxiliar para convertir logoUrl → base64
    async function loadLogo(url) {
      try {
        if (!url) return null;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const data = Buffer.from(response.data, 'binary');
        return 'data:image/png;base64,' + data.toString('base64');
      } catch {
        return null;
      }
    }

    // Recorrer cada juego y generar fila
    for (const g of games) {
      const homeLogo = await loadLogo(g.HomeTeam?.LogoUrl);
      const awayLogo = await loadLogo(g.AwayTeam?.LogoUrl);

      // Estado del juego
      const statusText = g.GameStatus === 0
        ? 'Pendiente'
        : g.GameStatus === 1
          ? 'En curso'
          : 'Finalizado';

      body.push([
        g.GameDate ? new Date(g.GameDate).toLocaleString() : '—',
        {
          stack: [
            homeLogo ? { image: homeLogo, width: 30, alignment: 'center' } : { text: 'No logo', alignment: 'center' },
            { text: g.HomeTeam?.Name || '—', alignment: 'center' },
            { text: g.HomeTeam?.City || '—', alignment: 'center', fontSize: 9 }
          ]
        },
        {
          stack: [
            awayLogo ? { image: awayLogo, width: 30, alignment: 'center' } : { text: 'No logo', alignment: 'center' },
            { text: g.AwayTeam?.Name || '—', alignment: 'center' },
            { text: g.AwayTeam?.City || '—', alignment: 'center', fontSize: 9 }
          ]
        },
        { text: `${g.HomeScore ?? 0} - ${g.AwayScore ?? 0}`, alignment: 'center' },
        { text: statusText, alignment: 'center' }
      ]);
    }

    // Estructura del documento PDF
    const docDefinition = {
      content: [
        header,
        {
          text: 'Reporte de Juegos Registrados',
          style: 'title',
          margin: [0, 10, 0, 10],
          alignment: 'center'
        },
        {
          table: {
            headerRows: 1,
            widths: [90, '*', '*', 60, 80],
            body
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
    res.status(500).json({ error: 'Error al generar el reporte de juegos.' });
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


    // Formatear fecha
    const formatDate = (isoDate) => {
      const date = new Date(isoDate);
      return date.toLocaleString('es-GT');
    };

    // Definición del documento PDF
    const docDefinition = {
      content: [
        header,
        {
          table: {
            widths: ['*', '*'],
            body: [
              [{ text: 'Fecha del Juego', bold: true }, formatDate(game.GameDate)],
              [{ text: 'Estado', bold: true }, game.GameStatus === 0 ? 'Pendiente' : 'En curso / Finalizado'],
              [{ text: 'Periodo Actual', bold: true }, game.CurrentPeriod.toString()],
              [{ text: 'Tiempo Restante (s)', bold: true }, game.RemainingTime.toString()],
              [
                { text: 'Marcador', bold: true },
                `${game.HomeTeam.Name} ${game.HomeScore} - ${game.AwayScore} ${game.AwayTeam.Name}`,
              ],
            ],
          },
          margin: [0, 10, 0, 20],
        },

        { text: `🏠 Equipo Local: ${game.HomeTeam.Name}`, style: 'subheader' },
        {
          table: {
            widths: ['auto', '*', '*', '*', '*', '*'],
            body: [
              [
                { text: 'No.', bold: true },
                { text: 'Nombre Completo', bold: true },
                { text: 'Posición', bold: true },
                { text: 'Edad', bold: true },
                { text: 'Estatura', bold: true },
                { text: 'Nacionalidad', bold: true },
              ],
              ...game.HomeTeam.Players.map((p) => [
                p.JerseyNumber,
                p.FullName,
                p.Position,
                p.Age,
                `${p.Height} cm`,
                p.Nationality,
              ]),
            ],
          },
          margin: [0, 5, 0, 20],
        },

        { text: `🛫 Equipo Visitante: ${game.AwayTeam.Name}`, style: 'subheader' },
        {
          table: {
            widths: ['auto', '*', '*', '*', '*', '*'],
            body: [
              [
                { text: 'No.', bold: true },
                { text: 'Nombre Completo', bold: true },
                { text: 'Posición', bold: true },
                { text: 'Edad', bold: true },
                { text: 'Estatura', bold: true },
                { text: 'Nacionalidad', bold: true },
              ],
              ...game.AwayTeam.Players.map((p) => [
                p.JerseyNumber,
                p.FullName,
                p.Position,
                p.Age,
                `${p.Height} cm`,
                p.Nationality,
              ]),
            ],
          },
        },
      ],

      styles: {
        header: {
          fontSize: 20,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 15],
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
      },
    };

    // Generar PDF y enviarlo como respuesta
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
