// Actual bracket results for 2026 World Cup.
// Populate homeGoals / awayGoals / winnerId as matches are played.

const m = (matchNum, slotA, slotB, date, homeId, awayId, homeGoals, awayGoals, winnerId) => ({
  matchNum, slotA, slotB, date,
  homeId: homeId ?? null, awayId: awayId ?? null,
  homeGoals: homeGoals ?? null, awayGoals: awayGoals ?? null,
  winnerId: winnerId ?? null,
})

// Round of 32 — Jun 28 – Jul 3
export const actualR32 = [
  m(49,  'South Africa',       'Canada',              'Jun 28', 'south-africa',      'canada',             0, 1, 'canada'),
  m(50,  'Brazil',             'Japan',               'Jun 29', 'brazil',             'japan',              2, 1, 'brazil'),
  m(51,  'Germany',            'Paraguay',            'Jun 29', 'germany',            'paraguay',           1, 1, 'paraguay'),
  m(52,  'Netherlands',        'Morocco',             'Jun 29', 'netherlands',        'morocco'),
  m(53,  'Ivory Coast',        'Norway',              'Jun 30', 'ivory-coast',        'norway'),
  m(54,  'France',             'Sweden',              'Jun 30', 'france',             'sweden'),
  m(55,  'Mexico',             'Ecuador',             'Jun 30', 'mexico',             'ecuador'),
  m(56,  'England',            'DR Congo',            'Jul 1',  'england',            'dr-congo'),
  m(57,  'Belgium',            'Senegal',             'Jul 1',  'belgium',            'senegal'),
  m(58,  'United States',      'Bosnia-Herzegovina',  'Jul 1',  'united-states',      'bosnia-herzegovina'),
  m(59,  'Spain',              'Austria',             'Jul 2',  'spain',              'austria'),
  m(60,  'Portugal',           'Croatia',             'Jul 2',  'portugal',           'croatia'),
  m(61,  'Switzerland',        'Algeria',             'Jul 2',  'switzerland',        'algeria'),
  m(62,  'Australia',          'Egypt',               'Jul 3',  'australia',          'egypt'),
  m(63,  'Argentina',          'Cape Verde',          'Jul 3',  'argentina',          'cape-verde'),
  m(64,  'Colombia',           'Ghana',               'Jul 3',  'colombia',           'ghana'),
]

// Round of 16 — Jul 4–7
export const actualR16 = [
  m(65, 'W49', 'W52', 'Jul 4', 'canada',   null),   // Canada vs W(NED/MAR)
  m(66, 'W51', 'W54', 'Jul 4', 'paraguay', null),   // Paraguay vs W(FRA/SWE)
  m(67, 'W50', 'W53', 'Jul 5', 'brazil',   null),   // Brazil vs W(IVC/NOR)
  m(68, 'W55', 'W56', 'Jul 5'),                      // W(MEX/ECU) vs W(ENG/DRC)
  m(69, 'W60', 'W59', 'Jul 6'),                      // W(POR/CRO) vs W(SPA/AUS)
  m(70, 'W58', 'W57', 'Jul 6'),                      // W(USA/BIH) vs W(BEL/SEN)
  m(71, 'W63', 'W62', 'Jul 7'),                      // W(ARG/CPV) vs W(AUS/EGY)
  m(72, 'W61', 'W64', 'Jul 7'),                      // W(SUI/ALG) vs W(COL/GHA)
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
