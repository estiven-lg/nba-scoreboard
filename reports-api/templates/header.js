const header = {
    table: {
        widths: ['*'],
        body: [
            [
                {
                    stack: [
                        {
                            image: 'public/assets/basketball.png',
                            width: 75,
                            alignment: 'center'
                        },
                        {
                            text: 'NBA ScoreBoard',
                            fontSize: 18,
                            bold: true,
                            alignment: 'center',
                            margin: [0, 5, 0, 0],
                            color: 'white'
                        }
                    ],
                    fillColor: '#1976D2',
                    margin: [0, 10, 0, 10]
                }
            ]
        ]
    },
    layout: 'noBorders',
    margin: [0, 0, 0, 10]
}

module.exports = header;