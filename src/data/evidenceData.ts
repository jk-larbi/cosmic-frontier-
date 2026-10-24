import type { EvidenceTopic, CandidateCase } from '../types';

export const SCIENTIFIC_SEARCH_CARDS: {
  id: string;
  title: string;
  summary: string;
  iconName: 'Compass' | 'Eye' | 'Telescope' | 'Scale';
}[] = [
  {
    id: 'orbital-patterns',
    title: 'Orbital patterns',
    summary: 'Scientists study the paths of distant objects to investigate whether their orbits show unusual patterns.',
    iconName: 'Compass'
  },
  {
    id: 'object-movement',
    title: 'Object movement',
    summary: 'Researchers compare observations taken at different times to identify moving objects.',
    iconName: 'Eye'
  },
  {
    id: 'infrared-observations',
    title: 'Infrared observations',
    summary: 'Infrared surveys can help scientists search for faint, distant objects that may be difficult to detect in visible light.',
    iconName: 'Telescope'
  },
  {
    id: 'statistical-analysis',
    title: 'Statistical analysis',
    summary: 'Scientists use statistical methods to determine how significant observed patterns are and how selection effects might influence the evidence.',
    iconName: 'Scale'
  }
];

export const EVIDENCE_TOPICS: EvidenceTopic[] = [
  {
    id: 'orbital-clustering',
    title: 'Orbital Clustering of Extreme TNOs',
    summary: 'Distant icy bodies beyond Neptune appear to share an alignment in their orbital orientation in space.',
    fullExplanation: 'Extreme Trans-Neptunian Objects (eTNOs) with semi-major axes beyond 150 AU and perihelia beyond Neptune exhibit clustered orbital orientations. Instead of being randomly scattered by planetary perturbations over billions of years, their arguments of perihelion cluster near a similar angle. Batygin and Brown proposed that an unseen 5–8 Earth-mass planet on an eccentric, anti-aligned orbit could shepherd these bodies into their clustered trajectories.',
    researchFocus: 'Investigating whether orbital alignment is physical or an artifact of sky coverage.',
    observationsToDate: 'Distant objects including Sedna, 2012 VP113, and 2004 VN112 exhibit aligned orbital perihelia.',
    debatedAspects: 'Debate centers on whether observational selection effects in sky surveys artificially produce this grouping.',
    iconName: 'Compass'
  },
  {
    id: 'detached-sednoids',
    title: 'Detached Sednoid Perihelia',
    summary: 'Objects like Sedna and 2012 VP113 never come close enough to Neptune to have been scattered by Neptune alone.',
    fullExplanation: 'In standard solar system formation models, scattered disc objects reached high eccentricity via close encounters with Neptune (30 AU). However, Sedna’s perihelion is 76 AU, and 2012 VP113’s is 80.5 AU. These objects remain completely detached from Neptune’s direct gravitational reach. A proposed distant planet could gradually raise perihelia through secular gravitational resonances over hundreds of millions of years.',
    researchFocus: 'Explaining how orbits become detached from Neptune without close planetary scattering.',
    observationsToDate: 'Confirmed existence of several detached sednoids (Sedna, 2012 VP113, Leleākūhonua).',
    debatedAspects: 'Alternative theories propose these detached orbits were created billions of years ago by passing stars in the Sun’s birth cluster.',
    iconName: 'Orbit'
  },
  {
    id: 'infrared-limits',
    title: 'Infrared & Optical Survey Constraints',
    summary: 'NASA’s WISE survey ruled out giant planets, but a cooler, smaller Super-Earth could remain undetectable.',
    fullExplanation: 'Between 2010 and 2014, NASA’s Wide-field Infrared Survey Explorer (WISE) scanned the sky in four infrared bands. Analysis showed that no Jupiter-sized gas planet exists within 26,000 AU and no Saturn-sized planet within 10,000 AU. However, a smaller 5–8 Earth-mass planet at 400–600 AU would reflect very little optical sunlight and emit faint thermal radiation, making it difficult to detect with previous sky surveys.',
    researchFocus: 'Setting upper limits on the mass and distance of any possible undiscovered body.',
    observationsToDate: 'Giant gas planets ruled out by WISE; optical surveys continue searching along the predicted path.',
    debatedAspects: 'Deep surveys with the Vera C. Rubin Observatory (LSST) will systematically search the predicted orbital strip.',
    iconName: 'Search'
  },
  {
    id: 'alternative-hypotheses',
    title: 'Alternative Scientific Explanations',
    summary: 'Scientists also investigate whether observational bias or collective disk gravity explains the data.',
    fullExplanation: 'Science advances by rigorously testing competing hypotheses. Two major alternatives to a ninth planet exist:\n\n1. Observational Selection Bias: Ground-based telescopes in Hawaii and Chile can only observe during clear weather and look along regions of the sky with low dust and favorable solar angles. The Outer Solar System Origins Survey (OSSOS) team has suggested that when accounting for where telescopes pointed, the evidence for orbital clustering is not statistically conclusive.\n\n2. Collective Disk Gravity: Researchers have calculated that if the primordial Kuiper Belt possessed roughly 10–20 Earth masses in small icy planetesimals, the collective gravitational self-interaction of the disk itself could cause orbits to align without needing a single large planet.',
    researchFocus: 'Debiasing astronomical survey data and testing collective self-gravity models.',
    observationsToDate: 'Statistical debiasing studies of Pan-STARRS, DES, and OSSOS catalogs.',
    debatedAspects: 'Whether the primordial Kuiper Belt retained enough collective mass to gravitationally self-shepherd.',
    iconName: 'Scale'
  }
];

export const CANDIDATE_CASES: CandidateCase[] = [
  {
    id: 'candidate-alpha',
    name: 'Field Alpha: Icy Object Search (Simulation)',
    fieldId: 'SIMULATED-FIELD-092A',
    epoch1Label: 'Observation Epoch 1 (October 12, 2024) [Simulated]',
    epoch2Label: 'Observation Epoch 2 (November 15, 2024) [Simulated]',
    epoch1Image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23050B1A"/><g fill="%23FFFFFF"><circle cx="70" cy="50" r="2.5"/><circle cx="180" cy="80" r="3"/><circle cx="320" cy="40" r="2"/><circle cx="290" cy="180" r="3.5"/><circle cx="90" cy="220" r="2.8"/><circle cx="210" cy="250" r="2.2"/><circle cx="340" cy="260" r="2"/></g><circle cx="160" cy="140" r="3.2" fill="%238B5CF6"/><text x="15" y="25" fill="%23A7B4CC" font-family="monospace" font-size="11">SIMULATED EPOCH 1: 2024-10-12</text></svg>',
    epoch2Image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23050B1A"/><g fill="%23FFFFFF"><circle cx="70" cy="50" r="2.5"/><circle cx="180" cy="80" r="3"/><circle cx="320" cy="40" r="2"/><circle cx="290" cy="180" r="3.5"/><circle cx="90" cy="220" r="2.8"/><circle cx="210" cy="250" r="2.2"/><circle cx="340" cy="260" r="2"/></g><circle cx="225" cy="140" r="3.2" fill="%238B5CF6"/><text x="15" y="25" fill="%23A7B4CC" font-family="monospace" font-size="11">SIMULATED EPOCH 2: 2024-11-15 (+34 DAYS)</text></svg>',
    expectedClassification: 'Possible movement',
    explanation: 'Correct! The faint purple candidate shifted horizontal position between the two epochs while all background stars remained completely stationary. This shift matches the apparent parallax and orbital motion of an outer Solar System body.',
    hints: 'Look at the faint purple point near the centre: notice how it shifted rightward while the white stars stayed in place.'
  },
  {
    id: 'candidate-beta',
    name: 'Field Beta: Fixed Stellar Background (Simulation)',
    fieldId: 'SIMULATED-FIELD-144B',
    epoch1Label: 'Observation Epoch 1 (August 05, 2024) [Simulated]',
    epoch2Label: 'Observation Epoch 2 (September 10, 2024) [Simulated]',
    epoch1Image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23050B1A"/><g fill="%23FFFFFF"><circle cx="100" cy="70" r="3"/><circle cx="220" cy="60" r="2.5"/><circle cx="310" cy="110" r="3.5"/><circle cx="150" cy="180" r="2.8"/><circle cx="270" cy="220" r="3"/><circle cx="90" cy="240" r="2"/></g><circle cx="200" cy="150" r="2.5" fill="%23FFFFFF"/><text x="15" y="25" fill="%23A7B4CC" font-family="monospace" font-size="11">SIMULATED EPOCH 1: 2024-08-05</text></svg>',
    epoch2Image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23050B1A"/><g fill="%23FFFFFF"><circle cx="100" cy="70" r="3"/><circle cx="220" cy="60" r="2.5"/><circle cx="310" cy="110" r="3.5"/><circle cx="150" cy="180" r="2.8"/><circle cx="270" cy="220" r="3"/><circle cx="90" cy="240" r="2"/></g><circle cx="200" cy="150" r="2.5" fill="%23FFFFFF"/><text x="15" y="25" fill="%23A7B4CC" font-family="monospace" font-size="11">SIMULATED EPOCH 2: 2024-09-10 (+36 DAYS)</text></svg>',
    expectedClassification: 'No clear movement',
    explanation: 'Correct! Every single source in this field remains in identical coordinates across both epochs. These are distant background stars with zero detectable apparent motion over a month-long timescale.',
    hints: 'Compare the coordinates of every point of light: none have changed positions.'
  },
  {
    id: 'candidate-gamma',
    name: 'Field Gamma: Artifact Inspection (Simulation)',
    fieldId: 'SIMULATED-FIELD-308G',
    epoch1Label: 'Observation Epoch 1 (May 18, 2024) [Simulated]',
    epoch2Label: 'Observation Epoch 2 (June 22, 2024) [Simulated]',
    epoch1Image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23050B1A"/><g fill="%23FFFFFF"><circle cx="80" cy="60" r="3"/><circle cx="260" cy="90" r="2.5"/><circle cx="140" cy="200" r="3"/><circle cx="320" cy="230" r="2.8"/></g><text x="15" y="25" fill="%23A7B4CC" font-family="monospace" font-size="11">SIMULATED EPOCH 1: 2024-05-18</text></svg>',
    epoch2Image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23050B1A"/><g fill="%23FFFFFF"><circle cx="80" cy="60" r="3"/><circle cx="260" cy="90" r="2.5"/><circle cx="140" cy="200" r="3"/><circle cx="320" cy="230" r="2.8"/></g><polygon points="200,145 204,152 201,154 196,148" fill="%23F5C451"/><text x="15" y="25" fill="%23A7B4CC" font-family="monospace" font-size="11">SIMULATED EPOCH 2: 2024-06-22 (+35 DAYS)</text></svg>',
    expectedClassification: 'Uncertain',
    explanation: 'Correct! An apparent light mark appears in Epoch 2 that was completely absent in Epoch 1, but its jagged shape lacks the round Point Spread Function (PSF) of a real celestial body. This is an instrumental artifact or cosmic ray strike on the detector.',
    hints: 'Notice the irregular, sharp angular shape in Epoch 2—astronomical bodies appear round and symmetrical due to telescope optics.'
  }
];
