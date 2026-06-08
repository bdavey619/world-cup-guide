// Pre-tournament bracket structure for 2026 WC (6 groups, R16 format)
// All slots are TBD until group stage completes.
// To record a result: set winner: 'home'|'away' and home.score / away.score.

const slot = (label, name = null, flag = null) => ({ label, name, flag, score: null })

export const bracketRounds = [
  {
    id: 'r16',
    label: 'ROUND OF 16',
    dates: 'Jun 29 – Jul 2',
    matches: [
      {
        id: 'r16_1', matchNum: 49,
        home: slot('1st Group A'), away: slot('2nd Group C'),
        venue: 'AT&T Stadium', date: 'Jun 29', winner: null,
      },
      {
        id: 'r16_2', matchNum: 50,
        home: slot('1st Group C'), away: slot('2nd Group A'),
        venue: 'MetLife Stadium', date: 'Jun 29', winner: null,
      },
      {
        id: 'r16_3', matchNum: 51,
        home: slot('1st Group B'), away: slot('2nd Group D'),
        venue: 'SoFi Stadium', date: 'Jun 30', winner: null,
      },
      {
        id: 'r16_4', matchNum: 52,
        home: slot('1st Group D'), away: slot('2nd Group B'),
        venue: 'Rose Bowl', date: 'Jun 30', winner: null,
      },
      {
        id: 'r16_5', matchNum: 53,
        home: slot('1st Group E'), away: slot('2nd Group F'),
        venue: 'Allegiant Stadium', date: 'Jul 1', winner: null,
      },
      {
        id: 'r16_6', matchNum: 54,
        home: slot('1st Group F'), away: slot('2nd Group E'),
        venue: "Levi's Stadium", date: 'Jul 1', winner: null,
      },
      {
        id: 'r16_7', matchNum: 55,
        home: slot('Best 3rd Place'), away: slot('2nd Best 3rd'),
        venue: 'NRG Stadium', date: 'Jul 2', winner: null,
      },
      {
        id: 'r16_8', matchNum: 56,
        home: slot('3rd Best 3rd'), away: slot('4th Best 3rd'),
        venue: 'Gillette Stadium', date: 'Jul 2', winner: null,
      },
    ],
  },
  {
    id: 'qf',
    label: 'QUARTER-FINALS',
    dates: 'Jul 5 – Jul 6',
    matches: [
      { id: 'qf_1', matchNum: 57, home: slot('Winner M49'), away: slot('Winner M50'), venue: 'MetLife Stadium', date: 'Jul 5', winner: null },
      { id: 'qf_2', matchNum: 58, home: slot('Winner M51'), away: slot('Winner M52'), venue: 'Rose Bowl', date: 'Jul 5', winner: null },
      { id: 'qf_3', matchNum: 59, home: slot('Winner M53'), away: slot('Winner M54'), venue: 'AT&T Stadium', date: 'Jul 6', winner: null },
      { id: 'qf_4', matchNum: 60, home: slot('Winner M55'), away: slot('Winner M56'), venue: 'SoFi Stadium', date: 'Jul 6', winner: null },
    ],
  },
  {
    id: 'sf',
    label: 'SEMI-FINALS',
    dates: 'Jul 9 – Jul 10',
    matches: [
      { id: 'sf_1', matchNum: 61, home: slot('Winner QF1'), away: slot('Winner QF2'), venue: 'MetLife Stadium', date: 'Jul 9', winner: null },
      { id: 'sf_2', matchNum: 62, home: slot('Winner QF3'), away: slot('Winner QF4'), venue: 'Rose Bowl', date: 'Jul 10', winner: null },
    ],
  },
  {
    id: 'final',
    label: 'FINAL',
    dates: 'Jul 19',
    matches: [
      { id: 'final_1', matchNum: 64, home: slot('Winner SF1'), away: slot('Winner SF2'), venue: 'MetLife Stadium, New Jersey', date: 'Jul 19', winner: null },
    ],
  },
]

// Third-place play-off
export const thirdPlace = {
  id: 'third',
  label: '3RD PLACE',
  matchNum: 63,
  home: slot('Loser SF1'),
  away: slot('Loser SF2'),
  venue: 'Rose Bowl', date: 'Jul 17',
  winner: null,
}
