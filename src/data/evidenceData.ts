import type { EvidenceTopic } from '../types';

export const EVIDENCE_TOPICS: EvidenceTopic[] = [
  {
    id: 'orbital-clustering',
    title: 'Clustering of Extreme Orbits',
    summary: 'Distant icy bodies beyond Neptune share an unexpected geometric alignment that points in the same direction in space.',
    fullExplanation: 'Extreme Trans-Neptunian Objects (eTNOs) with semi-major axes greater than 150 AU and perihelia beyond 30 AU do not orbit in random directions. Instead, their perihelia (closest points to the Sun) cluster tightly together in physical space and share an aligned argument of perihelion (~300°). Without an external gravitational perturber, gravitational tugs from Jupiter, Saturn, Uranus, and Neptune would cause these orbits to scatter randomly over hundreds of millions of years. Dynamical simulations calculate the probability of this alignment occurring purely by random chance at less than 0.2% (1 in 500).',
    confidenceLevel: 'High Correlation',
    observationsToDate: 'Over a dozen extreme TNOs (including Sedna, 2012 VP113, and 2004 VN112) exhibit correlated orbital angles.',
    futureMissions: 'Vera C. Rubin Observatory’s 10-year Legacy Survey of Space and Time (LSST) will discover hundreds of new eTNOs to test if the clustering is real or an observational artifact.',
    iconName: 'Compass'
  },
  {
    id: 'detached-perihelia',
    title: 'Detached Sednoid Perihelia',
    summary: 'Objects like Sedna never approach close enough to Neptune to have been placed on their orbits by known planets.',
    fullExplanation: 'In our standard model of the solar system, objects in the scattered disc were flung into distant orbits by close gravitational encounters with Neptune. However, Sedna’s perihelion is 76 AU, and 2012 VP113’s is 80.5 AU. These objects never come anywhere near Neptune (30 AU). Therefore, Neptune cannot explain how their perihelia were lifted so far beyond its reach. A massive planet orbiting between 300 and 500 AU could gradually lift and maintain these detached perihelia through secular gravitational resonances over billions of years.',
    confidenceLevel: 'Strong Gravitational Prediction',
    observationsToDate: 'Confirmed existence of three prominent sednoids (Sedna, 2012 VP113, Leleākūhonua).',
    futureMissions: 'Subaru Telescope and Rubin LSST deep twilight and wide-field tracking.',
    iconName: 'Orbit'
  },
  {
    id: 'high-inclination-orbits',
    title: 'Perpendicular & Retrograde Kuiper Objects',
    summary: 'A population of distant objects orbits nearly perpendicular or backwards relative to the plane of the planets.',
    fullExplanation: 'The Solar System formed from a relatively flat rotating protoplanetary disk, meaning all major planets orbit within a few degrees of the same plane. Yet astronomers have discovered high-inclination Kuiper Belt objects tilted by 60° to over 90° (such as 2008 KV42 and 2011 KT19). Numerical simulations by Batygin and Morbidelli demonstrated that a distant inclined Planet X naturally produces these perpendicular orbits through a mechanism called the Kozai-Lidov resonance, periodically exchanging orbital inclination for eccentricity.',
    confidenceLevel: 'Strong Gravitational Prediction',
    observationsToDate: 'Numerous high-inclination and retrograde Centaurs and trans-Neptunian objects observed.',
    futureMissions: 'Dynamical orbital modeling with high-resolution N-body supercomputer simulations.',
    iconName: 'Sliders'
  },
  {
    id: 'infrared-limits',
    title: 'Infrared & Optical Survey Constraints',
    summary: 'NASA’s WISE telescope proved that no Saturn- or Jupiter-sized planet exists, but a smaller 5–8 Earth-mass planet could easily hide.',
    fullExplanation: 'Between 2010 and 2014, NASA’s Wide-field Infrared Survey Explorer (WISE) mapped the entire sky in four infrared bands. Thermal analysis ruled out the existence of a Jupiter-sized planet within 26,000 AU and a Saturn-sized planet within 10,000 AU. However, a smaller "Super-Earth" or "Mini-Neptune" (5 to 10 Earth masses) at 400–600 AU would be cool, faint, and nearly indistinguishable from background stars in single-epoch surveys. It would have an optical magnitude of 22 to 25, requiring deep, multi-epoch sky monitoring to detect its slow parallax motion.',
    confidenceLevel: 'Ongoing Survey Search',
    observationsToDate: 'Sky ruled out for gas giants by WISE; Pan-STARRS and ZTF have surveyed parts of the predicted orbital path.',
    futureMissions: 'NASA SPHEREx all-sky spectroscopic infrared survey and Vera C. Rubin Observatory (optical LSST).',
    iconName: 'Search'
  },
  {
    id: 'alternative-hypotheses',
    title: 'Alternative Scientific Explanations',
    summary: 'Scientists also investigate whether observational bias or collective disk gravity could explain the data without a 9th planet.',
    fullExplanation: 'Good science requires exploring alternative explanations. Two major competing hypotheses are actively debated:\n1. Observational Selection Bias: Telescopes in Hawaii and Chile only observe during specific seasons and look at particular sky patches with low dust, which might make random orbits artificially look clustered (advocated by the OSSOS survey team).\n2. Collective Gravity of an Icy Debris Disk: Researchers at Cambridge and American University of Beirut suggested that if the primordial Kuiper Belt possessed a total mass of roughly 10 to 20 Earth masses in small icy planetesimals, their combined collective self-gravity could produce the same orbital clustering without needing a single large planet.',
    confidenceLevel: 'Active Scientific Debate',
    observationsToDate: 'Ongoing statistical debiasing studies of Pan-STARRS, DES, and OSSOS detections.',
    futureMissions: 'Debiased population synthesis from complete all-sky surveys over the next 5 years.',
    iconName: 'Scale'
  }
];

