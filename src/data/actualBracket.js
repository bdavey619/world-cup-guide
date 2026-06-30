// Actual bracket results for 2026 World Cup.
// homeId / awayId / homeGoals / awayGoals / winnerId are auto-updated by
// scripts/update-bracket.js — do not edit those fields by hand.

import bracketResults from './bracketResults.json'

const MATCH_INFO = {
  49: { time: '3PM ET',    venue: 'SoFi Stadium',            city: 'Los Angeles'  },
  50: { time: '1PM ET',    venue: 'NRG Stadium',             city: 'Houston'      },
  51: { time: '4:30PM ET', venue: 'Gillette Stadium',        city: 'Boston'       },
  52: { time: '9PM ET',    venue: 'Estadio BBVA',            city: 'Monterrey'    },
  53: { time: '1PM ET',    venue: 'AT&T Stadium',            city: 'Dallas'       },
  54: { time: '5PM ET',    venue: 'MetLife Stadium',         city: 'New York'     },
  55: { time: '9PM ET',    venue: 'Estadio Azteca',          city: 'Mexico City'  },
  56: { time: '12PM ET',   venue: 'Mercedes-Benz Stadium',   city: 'Atlanta'      },
  57: { time: '4PM ET',    venue: 'Lumen Field',             city: 'Seattle'      },
  58: { time: '5PM ET',    venue: "Levi's Stadium",          city: 'San Francisco'},
  59: { time: '3PM ET',    venue: 'SoFi Stadium',            city: 'Los Angeles'  },
  60: { time: '7PM ET',    venue: 'BMO Field',               city: 'Toronto'      },
  61: { time: '11PM ET',   venue: 'BC Place',                city: 'Vancouver'    },
  62: { time: '2PM ET',    venue: 'AT&T Stadium',            city: 'Dallas'       },
  63: { time: '6PM ET',    venue: 'Hard Rock Stadium',       city: 'Miami'        },
  64: { time: '9:30PM ET', venue: 'Arrowhead Stadium',       city: 'Kansas City'  },
  65: { time: '1PM ET',    venue: 'NRG Stadium',             city: 'Houston'      },
  66: { time: '5PM ET',    venue: 'Lincoln Financial Field', city: 'Philadelphia' },
  67: { time: '4PM ET',    venue: 'MetLife Stadium',         city: 'New York'     },
  68: { time: '8PM ET',    venue: 'Estadio Azteca',          city: 'Mexico City'  },
  69: { time: '3PM ET',    venue: 'AT&T Stadium',            city: 'Dallas'       },
  70: { time: '8PM ET',    venue: 'Lumen Field',             city: 'Seattle'      },
  71: { time: '12PM ET',   venue: 'Mercedes-Benz Stadium',   city: 'Atlanta'      },
  72: { time: '4PM ET',    venue: 'BC Place',                city: 'Vancouver'    },
  73: { time: '5PM ET',    venue: 'AT&T Stadium',            city: 'Dallas'       },
  74: { time: '5PM ET',    venue: 'MetLife Stadium',         city: 'New York'     },
  75: { time: '1PM ET',    venue: 'SoFi Stadium',            city: 'Los Angeles'  },
  76: { time: '5PM ET',    venue: 'Arrowhead Stadium',       city: 'Kansas City'  },
  77: { time: '8PM ET',    venue: 'AT&T Stadium',            city: 'Dallas'       },
  78: { time: '8PM ET',    venue: 'Mercedes-Benz Stadium',   city: 'Atlanta'      },
  79: { time: '5PM ET',    venue: 'Hard Rock Stadium',       city: 'Miami'        },
  80: { time: '3PM ET',    venue: 'MetLife Stadium',         city: 'New York'     },
}

const m = (matchNum, slotA, slotB, date) => {
  const r = bracketResults[matchNum] ?? {}
  return {
    matchNum, slotA, slotB, date,
    homeId:    r.homeId    ?? null,
    awayId:    r.awayId    ?? null,
    homeGoals: r.homeGoals ?? null,
    awayGoals: r.awayGoals ?? null,
    winnerId:  r.winnerId  ?? null,
    ...(MATCH_INFO[matchNum] ?? { time: null, venue: null, city: null }),
  }
}

// Round of 32 — Jun 28 – Jul 3
// Each adjacent pair feeds the same R16 match (0-1 → R16#65, 2-3 → R16#66, etc.)
export const actualR32 = [
  m(49,  'South Africa',       'Canada',              'Jun 28'),  // → R16 #65
  m(52,  'Netherlands',        'Morocco',             'Jun 29'),  // → R16 #65
  m(51,  'Germany',            'Paraguay',            'Jun 29'),  // → R16 #66
  m(54,  'France',             'Sweden',              'Jun 30'),  // → R16 #66
  m(50,  'Brazil',             'Japan',               'Jun 29'),  // → R16 #67
  m(53,  'Ivory Coast',        'Norway',              'Jun 30'),  // → R16 #67
  m(55,  'Mexico',             'Ecuador',             'Jun 30'),  // → R16 #68
  m(56,  'England',            'DR Congo',            'Jul 1' ),  // → R16 #68
  m(60,  'Portugal',           'Croatia',             'Jul 2' ),  // → R16 #69
  m(59,  'Spain',              'Austria',             'Jul 2' ),  // → R16 #69
  m(58,  'United States',      'Bosnia-Herzegovina',  'Jul 1' ),  // → R16 #70
  m(57,  'Belgium',            'Senegal',             'Jul 1' ),  // → R16 #70
  m(63,  'Argentina',          'Cape Verde',          'Jul 3' ),  // → R16 #71
  m(62,  'Australia',          'Egypt',               'Jul 3' ),  // → R16 #71
  m(61,  'Switzerland',        'Algeria',             'Jul 2' ),  // → R16 #72
  m(64,  'Colombia',           'Ghana',               'Jul 3' ),  // → R16 #72
]

// Round of 16 — Jul 4–7
export const actualR16 = [
  m(65, 'W49', 'W52', 'Jul 4'),
  m(66, 'W51', 'W54', 'Jul 4'),
  m(67, 'W50', 'W53', 'Jul 5'),
  m(68, 'W55', 'W56', 'Jul 5'),
  m(69, 'W60', 'W59', 'Jul 6'),
  m(70, 'W58', 'W57', 'Jul 6'),
  m(71, 'W63', 'W62', 'Jul 7'),
  m(72, 'W61', 'W64', 'Jul 7'),
]

// Quarter-finals — Jul 9–11
export const actualQF = [
  m(73, 'W65', 'W66', 'Jul 9'),
  m(74, 'W67', 'W68', 'Jul 10'),
  m(75, 'W69', 'W70', 'Jul 11'),
  m(76, 'W71', 'W72', 'Jul 11'),
]

// Semi-finals — Jul 14–15
export const actualSF = [
  m(77, 'W73', 'W74', 'Jul 14'),
  m(78, 'W75', 'W76', 'Jul 15'),
]

// Final — Jul 19
export const actualFinal = [m(80, 'W77', 'W78', 'Jul 19')]

// 3rd Place — Jul 18
export const actual3rdPlace = m(79, 'L77', 'L78', 'Jul 18')
