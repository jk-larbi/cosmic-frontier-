# COSMIC FRONTIER — NASA Astronomical Data Centre Architecture

This directory houses curated, verified, and bounded astronomical datasets derived from official NASA, JPL, IPAC, and international astrophysical data repositories.

---

## Data Provenance & Repository Standards

All scientific datasets stored locally or queried live through COSMIC FRONTIER adhere to strict data integrity standards:
1. **Verifiable Primary Sources**: Data are sourced from official archives (NASA Exoplanet Archive, NASA/JPL Solar System Dynamics Horizons & Small-Body Database, CDS SIMBAD, and NASA/IPAC IRSA).
2. **Explicit Data Status**: Every record is strictly categorized as:
   - `Real Archival Data`: Experimentally observed and verified by astronomical surveys.
   - `Reference Standard`: Officially adopted IAU / NASA reference constants.
   - `Theoretical Model`: Peer-reviewed mathematical hypothesis (e.g. Batygin & Brown Planet X modeling).
   - `Simulated Demonstration`: Pre-flight calibration or synthetic demonstration cubes.
3. **Transparent Units**: Standard astrophysical units (AU, km, Earth radii $R_\oplus$, Earth masses $M_\oplus$, Kelvin, light-years, $\mu\text{m}$, days) are documented for all fields.
4. **No Artificial Data Generation**: Unavailable measurements are preserved as `null`. No telescope coordinates, orbital values, or discovery claims are invented.

---

## Directory Modules

| Module Directory | Primary Source | Content & Coverage | Retrieval Method |
| :--- | :--- | :--- | :--- |
| `solar-system/` | NASA/JPL Horizons & Solar System Exploration | Sun + 8 recognized major planets with verified physical and orbital constants. | JPL Horizons REST API & IAU Best Estimates |
| `exoplanets/` | NASA Exoplanet Archive (Caltech/IPAC) | Confirmed exoplanets with discovery methods, host star properties, periods, and radii. | TAP (Table Access Protocol) ADQL query over `ps` table |
| `small-bodies/` | NASA/JPL Small-Body Database (SBDB) & Radar API | Near-Earth asteroids, main-belt asteroids, comets, and distant trans-Neptunian objects. | JPL SSD REST APIs (`sbdb.api` & `sb_radar.api`) |
| `galaxies/` | NED (NASA/IPAC Extragalactic Database) & CDS SIMBAD | Prominent deep-sky galaxies (M31, M33, M51, M104, LMC). | Astronomical database queries with documented adapter |
| `stars/` | CDS SIMBAD Astronomical Database | Primary navigational and benchmark stars (Sirius, Betelgeuse, Vega, Rigel). | SIMBAD TAP ADQL interface |
| `spherex/` | NASA/IPAC Infrared Science Archive (IRSA) | SPHEREx 102-channel spectral framework (0.75–5.0 $\mu\text{m}$) and mission metadata. | IRSA ObsCore TAP Schema (`spherex.obscore`) |
| `images/` | NASA Image & Video Library (`images.nasa.gov`) | Official mission imagery and APOD dispatches with full original credits. | NASA Image API (`images-api.nasa.gov`) |

---

## Manifest Verification

Refer to [`manifest.json`](./manifest.json) for machine-readable dataset checksums, record counts, UTC retrieval timestamps, and schema definitions.

