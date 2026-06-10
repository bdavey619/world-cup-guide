// Polymarket-based projected bracket for 2026 WC
// Winners determined by implied probability from tournament odds.
// Group projections: A→USA/Mexico, B→Argentina/France, C→Brazil/Portugal,
//   D→Spain/Germany, E→Belgium/Croatia, F→Denmark/Switzerland
// Best 3rd-place qualifiers (by odds): England, Netherlands, Uruguay, Japan

const slot = (label, name, flag) => ({ label, name, flag, score: null })

export const projectedRounds = [
  {
    id: 'r16',
    label: 'ROUND OF 16',
    dates: 'Jun 29 – Jul 2',
    matches: [
      {
        id: 'r16_1', matchNum: 49,
        home: slot('1st Group A', 'United States', '🇺🇸'),
        away: slot('2nd Group C', 'Portugal', '🇵🇹'),
        venue: 'AT&T Stadium', date: 'Jun 29',
        winner: 'away',
      },
      {
        id: 'r16_2', matchNum: 50,
        home: slot('1st Group C', 'Brazil', '🇧🇷'),
        away: slot('2nd Group A', 'Mexico', '🇲🇽'),
        venue: 'MetLife Stadium', date: 'Jun 29',
        winner: 'home',
      },
      {
        id: 'r16_3', matchNum: 51,
        home: slot('1st Group B', 'Argentina', '🇦🇷'),
        away: slot('2nd Group D', 'Germany', '🇩🇪'),
        venue: 'SoFi Stadium', date: 'Jun 30',
        winner: 'home',
      },
      {
        id: 'r16_4', matchNum: 52,
        home: slot('1st Group D', 'Spain', '🇪🇸'),
        away: slot('2nd Group B', 'France', '🇫🇷'),
        venue: 'Rose Bowl', date: 'Jun 30',
        winner: 'away',
      },
      {
        id: 'r16_5', matchNum: 53,
        home: slot('1st Group E', 'Belgium', '🇧🇪'),
        away: slot('2nd Group F', 'Switzerland', '🇨🇭'),
        venue: 'Allegiant Stadium', date: 'Jul 1',
        winner: 'home',
      },
      {
        id: 'r16_6', matchNum: 54,
        home: slot('1st Group F', 'Denmark', '🇩🇰'),
        away: slot('2nd Group E', 'Croatia', '🇭🇷'),
        venue: "Levi's Stadium", date: 'Jul 1',
        winner: 'home',
      },
      {
        id: 'r16_7', matchNum: 55,
        home: slot('Best 3rd Place', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'),
        away: slot('2nd Best 3rd', 'Netherlands', '🇳🇱'),
        venue: 'NRG Stadium', date: 'Jul 2',
        winner: 'home',
      },
      {
        id: 'r16_8', matchNum: 56,
        home: slot('3rd Best 3rd', 'Uruguay', '🇺🇾'),
        away: slot('4th Best 3rd', 'Japan', '🇯🇵'),
        venue: 'Gillette Stadium', date: 'Jul 2',
        winner: 'home',
      },
    ],
  },
  {
    id: 'qf',
    label: 'QUARTER-FINALS',
    dates: 'Jul 5 – Jul 6',
    matches: [
      {
        id: 'qf_1', matchNum: 57,
        home: slot('Winner M49', 'Portugal', '🇵🇹'),
        away: slot('Winner M50', 'Brazil', '🇧🇷'),
        venue: 'MetLife Stadium', date: 'Jul 5',
        winner: 'away',
      },
      {
        id: 'qf_2', matchNum: 58,
        home: slot('Winner M51', 'Argentina', '🇦🇷'),
        away: slot('Winner M52', 'France', '🇫🇷'),
        venue: 'Rose Bowl', date: 'Jul 5',
        winner: 'home',
      },
      {
        id: 'qf_3', matchNum: 59,
        home: slot('Winner M53', 'Belgium', '🇧🇪'),
        away: slot('Winner M54', 'Denmark', '🇩🇰'),
        venue: 'AT&T Stadium', date: 'Jul 6',
        winner: 'home',
      },
      {
        id: 'qf_4', matchNum: 60,
        home: slot('Winner M55', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'),
        away: slot('Winner M56', 'Uruguay', '🇺🇾'),
        venue: 'SoFi Stadium', date: 'Jul 6',
        winner: 'home',
      },
    ],
  },
  {
    id: 'sf',
    label: 'SEMI-FINALS',
    dates: 'Jul 9 – Jul 10',
    matches: [
      {
        id: 'sf_1', matchNum: 61,
        home: slot('Winner QF1', 'Brazil', '🇧🇷'),
        away: slot('Winner QF2', 'Argentina', '🇦🇷'),
        venue: 'MetLife Stadium', date: 'Jul 9',
        winner: 'away',
      },
      {
        id: 'sf_2', matchNum: 62,
        home: slot('Winner QF3', 'Belgium', '🇧🇪'),
        away: slot('Winner QF4', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'),
        venue: 'Rose Bowl', date: 'Jul 10',
        winner: 'away',
      },
    ],
  },
  {
    id: 'final',
    label: 'FINAL',
    dates: 'Jul 19',
    matches: [
      {
        id: 'final_1', matchNum: 64,
        home: slot('Winner SF1', 'Argentina', '🇦🇷'),
        away: slot('Winner SF2', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'),
        venue: 'MetLife Stadium, New Jersey', date: 'Jul 19',
        winner: 'home',
      },
    ],
  },
]

export const projectedThirdPlace = {
  id: 'third',
  label: '3RD PLACE',
  matchNum: 63,
  home: slot('Loser SF1', 'Brazil', '🇧🇷'),
  away: slot('Loser SF2', 'Belgium', '🇧🇪'),
  venue: 'Rose Bowl', date: 'Jul 17',
  winner: 'home',
}
