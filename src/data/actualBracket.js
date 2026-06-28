// Actual bracket results for 2026 World Cup.
// Populate homeGoals / awayGoals with integers, and winnerId with the winning team id
// as matches are played. Leave as null until known.

const m = (matchNum, slotA, slotB, date, homeId, awayId) => ({
  matchNum, slotA, slotB, date,
  homeId: homeId ?? null, awayId: awayId ?? null,
  homeGoals: null, awayGoals: null,
  winnerId: null,
})

// Round of 32 — Jul 1–4
// Slot key: 1A = 1st Group A, 2B = 2nd Group B, 3rd-N = Nth best third-place
// Best 8 third-place (by pts→gd→gf): Bosnia-Herzegovina, Czechia, Uzbekistan, Argentina, France, Türkiye, Ivory Coast, Japan
export const actualR32 = [
  m(49, '1A', '2B', 'Jul 1', 'mexico', 'canada'),
  m(50, '1C', '2D', 'Jul 1', 'haiti', 'australia'),
  m(51, '1E', '2F', 'Jul 2', 'germany', 'tunisia'),
  m(52, '1G', '2H', 'Jul 2', 'iran', 'spain'),
  m(53, '2A', '1B', 'Jul 2', 'south-korea', 'qatar'),
  m(54, '2C', '1D', 'Jul 2', 'morocco', 'united-states'),
  m(55, '2E', '1F', 'Jul 3', 'ecuador', 'sweden'),
  m(56, '2G', '1H', 'Jul 3', 'egypt', 'saudi-arabia'),
  m(57, '1I', '2J', 'Jul 3', 'iraq', 'austria'),
  m(58, '1K', '2L', 'Jul 3', 'dr-congo', 'england'),
  m(59, '3rd-0', '3rd-1', 'Jul 4', 'bosnia-herzegovina', 'czechia'),
  m(60, '3rd-2', '3rd-3', 'Jul 4', 'uzbekistan', 'argentina'),
  m(61, '2I', '1J', 'Jul 4', 'senegal', 'algeria'),
  m(62, '2K', '1L', 'Jul 4', 'colombia', 'croatia'),
  m(63, '3rd-4', '3rd-5', 'Jul 4', 'france', 'turkiye'),
  m(64, '3rd-6', '3rd-7', 'Jul 4', 'ivory-coast', 'japan'),
]

// Round of 16 — Jul 7–10
export const actualR16 = [
  m(65, 'W49', 'W50', 'Jul 7'),
  m(66, 'W51', 'W52', 'Jul 7'),
  m(67, 'W53', 'W54', 'Jul 8'),
  m(68, 'W55', 'W56', 'Jul 8'),
  m(69, 'W57', 'W58', 'Jul 9'),
  m(70, 'W59', 'W60', 'Jul 9'),
  m(71, 'W61', 'W62', 'Jul 10'),
  m(72, 'W63', 'W64', 'Jul 10'),
]

// Quarter-finals — Jul 14–15
export const actualQF = [
  m(73, 'W65', 'W66', 'Jul 14'),
  m(74, 'W67', 'W68', 'Jul 14'),
  m(75, 'W69', 'W70', 'Jul 15'),
  m(76, 'W71', 'W72', 'Jul 15'),
]

// Semi-finals — Jul 18–19
export const actualSF = [
  m(77, 'W73', 'W74', 'Jul 18'),
  m(78, 'W75', 'W76', 'Jul 19'),
]

// Final — Jul 23
export const actualFinal = [m(80, 'W77', 'W78', 'Jul 23')]

// 3rd Place — Jul 22
export const actual3rdPlace = m(79, 'L77', 'L78', 'Jul 22')
