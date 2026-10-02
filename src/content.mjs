// All of the site's content lives here. Edit this file, then run `npm run build`.
//
// Text fields may contain inline HTML (links, <i>, <sub>). Keep them short and factual:
// every claim on the site should be traceable to the CV in assets/cv/.

export const site = {
  url: 'https://kapil2020.github.io',
  name: 'Kapil Kumar Meena',
  shortName: 'Kapil Meena',
  initials: 'KM',
  role: 'Postdoctoral Researcher',
  lab: 'HUMAN Lab',
  org: 'University of California, Los Angeles',
  orgShort: 'UCLA',
  location: 'Los Angeles, CA',
  email: 'kapilm.48@gmail.com',
  cv: 'assets/cv/Kapil-Kumar-Meena-CV.pdf',
  updated: 'October 2026',
  title: 'Kapil Kumar Meena · Travel behaviour, air pollution & AI for transportation',
  description:
    'Kapil Kumar Meena is a postdoctoral researcher in the HUMAN Lab at UCLA. He studies how people travel under air pollution, heat and new information, develops discrete choice and machine-learning methods, and builds decision tools such as the patented DRUM routing app.',
  keywords:
    'Kapil Kumar Meena, travel behaviour, discrete choice modelling, air pollution exposure, heat, route choice, transportation engineering, machine learning, UCLA, IIT Kharagpur, DRUM',
};

export const links = {
  scholar: 'https://scholar.google.com/citations?user=5jIAPTEAAAAJ&hl=en',
  orcid: 'https://orcid.org/0000-0002-0271-0175',
  github: 'https://github.com/kapil2020',
  linkedin: 'https://www.linkedin.com/in/kapilmeena/',
  researchgate: 'https://www.researchgate.net/profile/Kapil-Meena-3',
  classic: 'https://kapil2020.github.io/website/',
  humanLab: 'https://sites.google.com/cornell.edu/youngseokim/human-lab',
  ucla: 'https://www.ucla.edu/',
  iitkgp: 'https://www.iitkgp.ac.in/',
  iitr: 'https://www.iitr.ac.in/',
  mustlab: 'https://www.mustlab.in/',
  agarwal: 'https://faculty.iitr.ac.in/~amitfce/index.html',
  leeds: 'https://environment.leeds.ac.uk/transport',
  wri: 'https://wri-india.org/',
  drum: 'https://leap-routing-iitkgp.vercel.app/',
  drumCode: 'https://github.com/orgs/clean-route/repositories',
  hindu:
    'https://www.thehindu.com/sci-tech/energy-and-environment/iit-kgp-app-helps-commuters-pick-greener-routes-on-the-road/article69644558.ece',
  ssrn: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6904230',
};

/** Profile links shown in the hero, the footer and the command palette. */
export const profiles = [
  { key: 'scholar', label: 'Google Scholar', icon: 'scholar', href: links.scholar },
  { key: 'orcid', label: 'ORCID', icon: 'orcid', href: links.orcid },
  { key: 'github', label: 'GitHub', icon: 'github', href: links.github },
  { key: 'linkedin', label: 'LinkedIn', icon: 'linkedin', href: links.linkedin },
  { key: 'researchgate', label: 'ResearchGate', icon: 'researchgate', href: links.researchgate },
];

/** Headline numbers. Keep in step with the CV's "Record" line. */
export const stats = [
  { value: 9, label: 'Journal articles', href: '#publications', filter: 'journal' },
  { value: 6, label: 'Manuscripts under review', href: '#publications', filter: 'review' },
  { value: 17, label: 'Conference papers', href: '#publications', filter: 'conference' },
  { value: 1, label: 'Published patent', href: '#patent' },
  { value: 200, suffix: '+', label: 'Citations', href: links.scholar, note: 'Google Scholar, Aug 2026' },
  { value: 6, label: 'h-index', href: links.scholar, note: 'Google Scholar, Aug 2026' },
];

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------

export const hero = {
  eyebrow: `Postdoctoral Researcher · <a href="${links.humanLab}">HUMAN Lab</a>, UCLA`,
  // The tagline is set in the display face; <em> words get the accent gradient.
  tagline:
    'I study how people travel through <em>polluted air</em>, <em>extreme heat</em> and <em>new information</em>, and build the models and tools that help them choose better.',
  chips: [
    { icon: 'graduation-cap', text: 'Ph.D. IIT Kharagpur, 2026' },
    { icon: 'stamp', text: 'Patent published, 2026', href: '#patent' },
    { icon: 'newspaper', text: 'Featured in <i>The Hindu</i>', href: '#media' },
  ],
};

export const about = {
  lead:
    'Standard travel models describe choices mainly through time and cost. In Indian cities people also weigh the air they breathe, the heat they walk through, and whether they trust the information in front of them. My work puts those trade-offs at the centre of transportation research.',
  paragraphs: [
    `I am a postdoctoral researcher in the <a href="${links.humanLab}">HUMAN Lab</a> at the
     <a href="${links.ucla}">University of California, Los Angeles</a>, working with Prof. Youngseo Kim.
     I study how people make travel decisions when the air is polluted, the day is hot or the
     information is new, and I build the methods and tools that turn this evidence into better
     routes, prices and policies.`,
    `I received my Ph.D. in Transportation Engineering from <a href="${links.iitkgp}">IIT Kharagpur</a>
     in 2026, advised by <a href="${links.mustlab}">Prof. Arkopal Kishore Goswami</a>, with a thesis on
     how <i>perceived</i> air-pollution exposure reshapes urban travel behaviour. Before that I
     completed my M.Tech at <a href="${links.iitr}">IIT Roorkee</a> with
     <a href="${links.agarwal}">Prof. Amit Agarwal</a>. In 2024 I was a Visiting Research Fellow at the
     <a href="${links.leeds}">Institute for Transport Studies, University of Leeds</a>, and in
     2021&ndash;22 a research intern in electric mobility at <a href="${links.wri}">WRI India</a>.`,
    `My work moves from the street to the model to the decision. I collect field data, from on-road
     PM<sub>2.5</sub> sensing to stated-preference experiments and a two-wave commuter panel;
     estimate it with hybrid choice models, interpretable machine learning and new estimation
     methods; and carry the results into tools people use. One of them,
     <a href="#software">DRUM</a>, a pollution-aware routing app, was featured in
     <a href="#media"><i>The Hindu</i></a> and is the basis of a <a href="#patent">published Indian patent</a>.`,
  ],
  pillars: [
    { key: 'transport', icon: 'route', title: 'Transportation', text: 'How people choose modes, routes and times of travel' },
    { key: 'environment', icon: 'wind', title: 'Environment', text: 'Air pollution and heat exposure on the road' },
    { key: 'ai', icon: 'brain', title: 'AI & data science', text: 'Interpretable, behaviourally grounded models from sparse data' },
  ],
  now: [
    { title: 'PD-MUSE', text: 'Structured, convex estimation of nested and related discrete choice models.' },
    { title: 'HEAT', text: 'How heat changes exposure, daily activity and travel.' },
  ],
  facts: [
    { icon: 'map-pin', label: 'Based in', value: 'Los Angeles, CA' },
    { icon: 'school', label: 'Ph.D.', value: 'IIT Kharagpur, 2026' },
    { icon: 'users', label: 'Reviewer for', value: '8 journals' },
    { icon: 'heart-handshake', label: 'Open to', value: 'Collaborations & talks' },
  ],
};

// ---------------------------------------------------------------------------
// News. Newest first. `kind` sets the colour and icon:
// paper | patent | career | talk | award | grant | media | service
// ---------------------------------------------------------------------------

export const news = [
  {
    year: 2026,
    items: [
      { kind: 'paper', html: `<b>Two papers accepted at TRB 2027</b>, the 106th Annual Meeting in Washington, DC: <a href="#c17">seasonal air-quality preferences in mode choice</a> and <a href="#c16">conflict screening from a single traffic image</a>.` },
      { kind: 'patent', when: 'Jul', html: `<b>Patent published.</b> Our application on a personalised dynamic route planning system for sustainable urban mobility was published by the Indian Patent Office (<a href="#patent">No. 202631018379</a>).` },
      { kind: 'career', html: `<b>Joined the <a href="${links.humanLab}">HUMAN Lab</a> at UCLA</b> as a postdoctoral researcher with Prof. Youngseo Kim.` },
      { kind: 'career', html: `<b>Completed my Ph.D.</b> at IIT Kharagpur. Thesis: <i>Assessing impacts of perceived air pollution exposure on urban travel behaviour</i>.` },
      { kind: 'paper', html: `<b>&ldquo;Not all travellers think alike&rdquo;</b> accepted in <a href="#j9"><i>Transportation Research Record</i></a>.` },
      { kind: 'talk', when: 'Jan', html: `<b>Presented at the 105th TRB Annual Meeting</b> in Washington, DC, supported by a fully funded institute travel grant.` },
      { kind: 'paper', html: `<b>Two IEEE papers</b> on estimating air quality from sparse sensor networks, at <a href="#c14">COMSNETS 2026</a> and <a href="#c13">AIEI 2026</a>.` },
    ],
  },
  {
    year: 2025,
    items: [
      { kind: 'media', when: 'Jun', html: `<b>DRUM featured in <i>The Hindu</i>:</b> <a href="${links.hindu}">&ldquo;New app helps commuters pick &lsquo;greener&rsquo; routes on road&rdquo;</a>.` },
      { kind: 'paper', html: `<b>DRUM published</b> in <a href="#j8"><i>Transportation Research Record</i></a>: least-exposure routes cut exposure by half for 40% more travel time.` },
      { kind: 'service', html: `<b>Technical session chair</b> at the EASTS Conference, Jakarta.` },
      { kind: 'paper', html: `<b>Three journal articles</b> on active travel, transit-oriented development and school-commute exposure, in <a href="#j6">IJST</a>, <a href="#j5">STL</a> and <a href="#j7">J-EASTS</a>.` },
    ],
  },
  {
    year: 2024,
    items: [
      { kind: 'career', html: `<b>Visiting Research Fellow</b> at the <a href="${links.leeds}">Institute for Transport Studies, University of Leeds</a>, on an International Research Exchange grant.` },
      { kind: 'paper', html: `<b>Review published in <a href="#j4"><i>Transport Policy</i></a></b> on how air-pollution exposure shapes travel behaviour, and a <a href="#j3">machine-learning study</a> in the <i>Decision Analytics Journal</i>.` },
      { kind: 'award', html: `<b>Best Presentation Award</b>, Research Scholar Day, RCGSIDM, IIT Kharagpur.` },
      { kind: 'grant', html: `<b>Travel grant</b> to the 17th International Conference on Travel Behaviour Research (IATBR), Vienna.` },
    ],
  },
  {
    year: 2023,
    items: [
      { kind: 'award', html: `<b>Best Poster Presentation</b>, Cyber-Physical Systems Summit (CyPhySS), IISc Bengaluru.` },
      { kind: 'paper', html: `<b>Delhi commuters&rsquo; perception of air quality</b> published in the <a href="#j2"><i>Journal of Transport &amp; Health</i></a>.` },
      { kind: 'talk', html: `<b>Presented at WCTR 2023</b>, the 16th World Conference on Transport Research, Montr&eacute;al.` },
    ],
  },
];

// ---------------------------------------------------------------------------
// Research
// ---------------------------------------------------------------------------

export const research = {
  lede:
    'I study travel trade-offs that standard models leave out, with data I collect in the field, estimate them with methods I develop, and carry the results into tools and policy.',
  pipeline: [
    {
      key: 'data', icon: 'database', title: 'Field data',
      items: ['On-road PM<sub>2.5</sub> sensing across transport micro-environments', 'Stated-preference experiments and two-wave commuter panels', 'Street and traffic images'],
    },
    {
      key: 'model', icon: 'cpu', title: 'Models',
      items: ['Discrete choice: hybrid latent class, ICLV, panel mixed logit', 'Convex estimation of nested and IPD logit models (PD&#8209;MUSE)', 'Geostatistical deep learning; graphs with grounded LLMs'],
    },
    {
      key: 'act', icon: 'lightbulb', title: 'Decisions',
      items: ['DRUM routing app and a published patent', 'Pricing and allocating shade', 'Information design for EV charging', 'Evidence for clean-air and heat policy'],
    },
  ],
  settings: 'Air pollution, heat, electric mobility and road safety, in Delhi, Kolkata, Mumbai, Kharagpur and tier-2 and tier-3 Indian cities.',
  thrusts: [
    {
      fig: 'seasonal-reroute', tone: 'air', kicker: 'Thrust 01',
      title: 'Travel under air pollution and heat',
      html: `I measure what commuters inhale across transport micro-environments and how they perceive it.
        In a two-wave panel that followed the same <b>723 commuters</b> in Kolkata from winter to summer,
        air quality carried about <b>four times</b> more weight in route choice in winter, and a pre-trip AQI
        alert was valued more than an equivalent cut in exposure. Hybrid latent class models separate
        commuters by how much exposure enters their decisions. I am extending this to heat: how people
        value shade, where a city should provide it, and how heat changes when and how people travel.`,
      cites: ['r5', 'j9', 'j2', 'j7', 'r4', 'c1'],
    },
    {
      fig: 'drum-routes', tone: 'clean', kicker: 'Thrust 02',
      title: 'Information and decision tools',
      html: `What travellers can do depends on what they know. I built <b>DRUM</b>, a routing engine that
        offers least-exposure and least-energy routes next to the shortest and fastest ones. In
        simulations for Central Delhi the least-exposure route cut exposure by <b>half</b> for 40% more
        travel time. DRUM was featured in <i>The Hindu</i> and is the basis of a published Indian patent.
        Related work studies how information about public chargers shapes choice, reliability and trust
        in EV charging, and how to encourage cycling to suburban rail.`,
      cites: ['j8', 'patent', 'r6', 'j3', 'j6', 'j5'],
    },
    {
      fig: 'pd-muse', tone: 'model', kicker: 'Thrust 03',
      title: 'Estimation methods and behaviourally grounded AI',
      html: `I develop methods that keep the structure of choice models while using what machine learning
        does well. <b>PD&#8209;MUSE</b> estimates nested logit and related models by solving a convex
        problem and a small search, instead of one hard non-concave problem. Other work joins econometric
        theory with deep learning for mode-choice prediction, estimates air quality from sparse sensor
        networks, and audits whether a single traffic image, read through a heterogeneous graph and a
        grounded LLM, can support conflict screening in mixed Indian traffic.`,
      cites: ['p1', 'r1', 'c14', 'c13', 'c16', 'r3'],
    },
  ],
};

// ---------------------------------------------------------------------------
// Publications
// ---------------------------------------------------------------------------

/** Research topics, used for tags, filters and thumbnail colour. */
export const topics = {
  air: { label: 'Air pollution', tone: 'air' },
  heat: { label: 'Heat', tone: 'heat' },
  choice: { label: 'Choice modelling', tone: 'model' },
  ai: { label: 'Machine learning', tone: 'ai' },
  active: { label: 'Active travel & transit', tone: 'clean' },
  ev: { label: 'Electric mobility', tone: 'ev' },
  safety: { label: 'Road safety', tone: 'safety' },
  tools: { label: 'Decision tools', tone: 'clean' },
};

/** Co-author pages. Authors not listed here are shown as plain text. */
export const people = {
  'A. K. Goswami': links.mustlab,
  'A. Agarwal': links.agarwal,
  'Y. Kim': links.humanLab,
};

export const ME = 'K. K. Meena';

export const pubGroups = [
  { type: 'patent', title: 'Patent &amp; press' },
  { type: 'journal', title: 'Journal articles' },
  { type: 'review', title: 'Manuscripts under review' },
  { type: 'prep', title: 'In preparation' },
  { type: 'conference', title: 'Refereed conference papers' },
];

const doi = (d) => `https://doi.org/${d}`;

// `cv` is the item's label in the CV. `badge` is the short venue tag on the card.
// `fig` names the drawing in src/thumbs.mjs. Conference papers carry no drawing.
export const publications = [
  // Patent ------------------------------------------------------------------
  {
    id: 'patent', cv: 'Patent', type: 'patent', year: 2026, fig: 'patent', featured: true,
    title: 'Personalised dynamic route planning system for sustainable urban mobility',
    authors: ['K. K. Meena', 'A. K. Goswami'],
    venue: 'Indian Patent Application No. 202631018379, published 31 July 2026',
    badge: 'Patent 2026', status: 'Published',
    summary: 'The personalised routing system behind DRUM, which offers commuters routes that trade travel time against pollution exposure and energy use.',
    topics: ['tools', 'air'],
    links: [
      { label: 'DRUM app', href: links.drum },
      { label: 'Related paper', href: '#j8', internal: true },
      { label: 'The Hindu', href: '#media', internal: true },
    ],
    bib: { kind: 'misc', key: 'meena2026patent', howpublished: 'Indian Patent Application No. 202631018379', note: 'Published 31 July 2026' },
  },

  // Journal articles (CV J9 → J1) ---------------------------------------------
  {
    id: 'j9', cv: 'J9', type: 'journal', year: 2026, fig: 'latent-class', featured: true,
    title: 'Not all travellers think alike: Segmenting travel behaviour under air pollution exposure using a hybrid latent class and discrete choice approach',
    authors: ['K. K. Meena', 'A. K. Goswami'],
    venue: '<i>Transportation Research Record</i>', venueText: 'Transportation Research Record',
    badge: 'TRR 2026', status: 'Accepted',
    doi: '10.1177/03611981261429472',
    summary: 'A hybrid latent class choice model that separates commuters by how strongly air-pollution exposure enters their travel decisions.',
    topics: ['air', 'choice'],
    bib: { kind: 'article', key: 'meena2026travellers', journal: 'Transportation Research Record' },
  },
  {
    id: 'j8', cv: 'J8', type: 'journal', year: 2025, fig: 'drum-routes', featured: true,
    title: 'Dynamic route planning for urban green mobility: Development of a web application offering sustainable route options to commuters',
    authors: ['K. K. Meena', 'A. K. Singh', 'A. K. Goswami'],
    venue: '<i>Transportation Research Record</i>', venueText: 'Transportation Research Record',
    badge: 'TRR 2025', status: 'Published',
    doi: '10.1177/03611981251331011',
    summary: 'DRUM, a web app that offers five routes: shortest, fastest, least exposure, least energy, and a balanced option.',
    highlight: '−50% exposure for +40% travel time on the least-exposure route (Central Delhi)',
    topics: ['air', 'tools'],
    links: [
      { label: 'App', href: links.drum },
      { label: 'Patent', href: '#patent', internal: true },
      { label: 'The Hindu', href: '#media', internal: true },
    ],
    bib: { kind: 'article', key: 'meena2025dynamic', journal: 'Transportation Research Record' },
  },
  {
    id: 'j7', cv: 'J7', type: 'journal', year: 2025, fig: 'school-exposure',
    title: 'Assessing air pollution exposure to school children in different modes of transport while commuting to school: A case of Kharagpur, India',
    authors: ['A. Sumbhate', 'K. K. Meena', 'A. K. Goswami'],
    venue: '<i>Journal of the Eastern Asia Society for Transportation Studies</i>, 16', venueText: 'Journal of the Eastern Asia Society for Transportation Studies',
    badge: 'J-EASTS 2025', status: 'Published', volume: '16',
    doi: '10.11175/easts.16.PP3879',
    summary: 'Compares the air pollution that school children take in on different modes of travel to school in Kharagpur.',
    topics: ['air', 'active'],
    bib: { kind: 'article', key: 'sumbhate2025school', journal: 'Journal of the Eastern Asia Society for Transportation Studies' },
  },
  {
    id: 'j6', cv: 'J6', type: 'journal', year: 2025, fig: 'bike-rail',
    title: 'Modeling bicycle choice behavior and its potential health impact: Case of first/last mile access to suburban rail',
    authors: ['B. S. Manoj', 'K. K. Meena', 'H. Panchal', 'G. Sharma', 'A. K. Goswami'],
    venue: '<i>International Journal of Sustainable Transportation</i>', venueText: 'International Journal of Sustainable Transportation',
    badge: 'IJST 2025', status: 'Published',
    doi: '10.1080/15568318.2025.2572818',
    summary: 'Models who would cycle the first or last mile to suburban rail, and the health benefit if they did.',
    topics: ['active', 'choice'],
    bib: { kind: 'article', key: 'manoj2025bicycle', journal: 'International Journal of Sustainable Transportation' },
  },
  {
    id: 'j5', cv: 'J5', type: 'journal', year: 2025, fig: 'tod-priority',
    title: 'A prioritization framework to identify key attributes of transit-oriented development (TOD) using a multi-criteria decision-making (MCDM) approach: An Indian context',
    authors: ['B. S. Manoj', 'K. K. Meena', 'A. K. Goswami'],
    venue: '<i>Sustainable Transport and Livability</i>, 2', venueText: 'Sustainable Transport and Livability',
    badge: 'STL 2025', status: 'Published', volume: '2',
    doi: '10.1080/29941849.2025.2516475',
    summary: 'Ranks the attributes of transit-oriented development for Indian cities with multi-criteria decision-making.',
    topics: ['active'],
    bib: { kind: 'article', key: 'manoj2025tod', journal: 'Sustainable Transport and Livability' },
  },
  {
    id: 'j4', cv: 'J4', type: 'journal', year: 2024, fig: 'exposure-review', featured: true,
    title: 'A review of air pollution exposure impacts on travel behaviour and way forward',
    authors: ['K. K. Meena', 'A. K. Goswami'],
    venue: '<i>Transport Policy</i>, 154, 48&ndash;60', venueText: 'Transport Policy',
    badge: 'Transp. Policy 2024', status: 'Published', volume: '154', pages: '48--60',
    doi: '10.1016/j.tranpol.2024.05.024',
    summary: 'What is known about how exposure to air pollution affects travel choices, and what has not yet been studied.',
    topics: ['air'],
    bib: { kind: 'article', key: 'meena2024review', journal: 'Transport Policy' },
  },
  {
    id: 'j3', cv: 'J3', type: 'journal', year: 2024, fig: 'ml-awareness',
    title: 'A machine learning approach for unraveling the influence of air quality awareness on travel behavior',
    authors: ['K. K. Meena', 'D. Bairwa', 'A. Agarwal'],
    venue: '<i>Decision Analytics Journal</i>, 11, 100459', venueText: 'Decision Analytics Journal',
    badge: 'DAJ 2024', status: 'Published', volume: '11', pages: '100459',
    doi: '10.1016/j.dajour.2024.100459',
    summary: 'Uses machine learning to study how awareness of air quality relates to the way people travel.',
    topics: ['ai', 'air'],
    bib: { kind: 'article', key: 'meena2024machine', journal: 'Decision Analytics Journal' },
  },
  {
    id: 'j2', cv: 'J2', type: 'journal', year: 2023, fig: 'delhi-perception',
    title: 'Perception of commuters towards air quality in Delhi',
    authors: ['K. K. Meena', 'V. Singh', 'A. Agarwal'],
    venue: '<i>Journal of Transport &amp; Health</i>, 31, 101643', venueText: 'Journal of Transport & Health',
    badge: 'JTH 2023', status: 'Published', volume: '31', pages: '101643',
    doi: '10.1016/j.jth.2023.101643',
    summary: 'A survey of how Delhi commuters perceive the air they travel through.',
    topics: ['air'],
    bib: { kind: 'article', key: 'meena2023perception', journal: 'Journal of Transport \\& Health' },
  },
  {
    id: 'j1', cv: 'J1', type: 'journal', year: 2021, fig: 'systematic-review',
    title: 'Travellers’ exposure to air pollution: A systematic review and future directions',
    authors: ['V. Singh', 'K. K. Meena', 'A. Agarwal'],
    venue: '<i>Urban Climate</i>, 38, 100901', venueText: 'Urban Climate',
    badge: 'Urban Climate 2021', status: 'Published', volume: '38', pages: '100901',
    doi: '10.1016/j.uclim.2021.100901',
    summary: 'A systematic review of what travellers are exposed to across transport modes, and where research should go next.',
    topics: ['air'],
    bib: { kind: 'article', key: 'singh2021travellers', journal: 'Urban Climate' },
  },

  // Under review (CV R6 → R1) -------------------------------------------------
  {
    id: 'r6', cv: 'R6', type: 'review', year: 2026, fig: 'ev-charging',
    title: 'How charging information shapes choice, reliability, and trust in public EV charging',
    authors: ['K. K. Meena', 'S. V. Sesidhar'],
    venue: '<i>Transportation Research Part D: Transport and Environment</i>', venueText: 'Transportation Research Part D',
    badge: 'TR-D', status: 'Second revision',
    summary: 'How information about public chargers affects which one drivers choose, and how reliable and trustworthy they find the network.',
    topics: ['ev', 'choice'],
  },
  {
    id: 'r5', cv: 'R5', type: 'review', year: 2026, fig: 'seasonal-reroute', featured: true,
    title: 'Do commuters reroute for cleaner air? Seasonal salience in route choice behaviour from a two-wave panel in Kolkata, India',
    authors: ['K. K. Meena', 'A. K. Goswami'],
    venue: '<i>Travel Behaviour and Society</i>', venueText: 'Travel Behaviour and Society',
    badge: 'TBS', status: 'First revision',
    summary: 'The same commuters surveyed in winter and again in summer. A pre-trip AQI alert is valued more than an equivalent cut in exposure.',
    highlight: '723 commuters · 5,224 choices · air quality weighs ~4× more in winter',
    topics: ['air', 'choice'],
    links: [{ label: 'Preprint (SSRN)', href: links.ssrn }],
  },
  {
    id: 'r4', cv: 'R4', type: 'review', year: 2026, fig: 'shade-pricing',
    title: 'Pricing shade in urban mobility: Behavioural evidence and optimal allocation for heat-resilient access in Delhi',
    authors: ['S. V. Sesidhar', 'K. K. Meena'],
    venue: '<i>Transport Policy</i>', venueText: 'Transport Policy',
    badge: 'Transp. Policy', status: 'Under review',
    summary: 'Behavioural evidence on how people value shade in Delhi’s heat, and an optimal plan for where a city should provide it.',
    topics: ['heat', 'choice'],
  },
  {
    id: 'r3', cv: 'R3', type: 'review', year: 2026, fig: 'conflict-screening',
    title: 'Are closer encounters really more dangerous? Evidence from conflict screening in heterogeneous traffic',
    authors: ['S. Basu', 'S. Guha Majumdar', 'K. K. Meena', 'S. V. Sesidhar'],
    venue: '<i>IATSS Research</i>', venueText: 'IATSS Research',
    badge: 'IATSS Res.', status: 'Under review',
    summary: 'Asks whether closer encounters between road users really signal greater danger when traffic is heterogeneous.',
    topics: ['safety', 'ai'],
  },
  {
    id: 'r2', cv: 'R2', type: 'review', year: 2026, fig: 'seasonal-mode',
    title: 'Beyond time and cost: Seasonal air-quality preferences in travel mode choice from a two-wave commuter panel',
    authors: ['K. K. Meena', 'A. K. Goswami'],
    venue: '<i>Transportation Research Record</i>', venueText: 'Transportation Research Record',
    badge: 'TRR', status: 'Under review',
    summary: 'Mode choice in the same two-wave panel, with air quality as an attribute alongside time and cost. Also accepted for presentation at <a href="#c17">TRB 2027</a>.',
    topics: ['air', 'choice'],
  },
  {
    id: 'r1', cv: 'R1', type: 'review', year: 2025, fig: 'econ-deep',
    title: 'Beyond choice modelling: Bridging econometric theory and deep learning for robust mode choice prediction',
    authors: ['K. K. Meena', 'A. K. Goswami'],
    venue: '<i>Transportation Research Part A: Policy and Practice</i>', venueText: 'Transportation Research Part A',
    badge: 'TR-A', status: 'Under review',
    summary: 'Combines random-utility theory with deep learning to predict mode choice more robustly.',
    topics: ['ai', 'choice'],
  },

  // In preparation ----------------------------------------------------------------
  {
    id: 'p1', cv: 'P1', type: 'prep', year: 2026, fig: 'pd-muse',
    title: 'PD-MUSE: Primal-dual maximum-utility structured estimator for discrete choice models',
    authors: ['K. K. Meena', 'S. Tang', 'Y. Kim'],
    venue: 'Manuscript in preparation', venueText: 'Manuscript in preparation',
    badge: 'UCLA 2026', cite: 'PD-MUSE', status: 'In preparation',
    summary: 'A new way to estimate nested logit and related choice models: a convex problem and a small search replace one hard, non-concave problem.',
    topics: ['choice'],
  },

  // Refereed conference papers (CV C17 → C1) -------------------------------------
  {
    id: 'c17', cv: 'C17', type: 'conference', year: 2027,
    title: 'Beyond time and cost: Seasonal air-quality preferences in travel mode choice from a two-wave commuter panel',
    authors: ['K. K. Meena', 'A. K. Goswami'],
    venue: '106th Annual Meeting of the Transportation Research Board, Washington, DC', badge: 'TRB 2027', status: 'Accepted for presentation',
    topics: ['air', 'choice'],
  },
  {
    id: 'c16', cv: 'C16', type: 'conference', year: 2027,
    title: 'Can one traffic image support conflict screening? A validity audit of a heterogeneous graph and grounded LLM framework in unstructured Indian traffic',
    authors: ['S. Basu', 'S. Guha Majumdar', 'K. K. Meena', 'S. V. Sesidhar'],
    venue: '106th Annual Meeting of the Transportation Research Board, Washington, DC', badge: 'TRB 2027', status: 'Accepted for presentation',
    topics: ['safety', 'ai'],
  },
  {
    id: 'c15', cv: 'C15', type: 'conference', year: 2026,
    title: 'Not all travellers think alike: Segmenting travel behaviour under air pollution exposure',
    authors: ['K. K. Meena', 'A. K. Goswami'],
    venue: '105th Annual Meeting of the Transportation Research Board, Washington, DC', badge: 'TRB 2026',
    topics: ['air', 'choice'],
  },
  {
    id: 'c14', cv: 'C14', type: 'conference', year: 2026,
    title: 'A hybrid geostatistical and deep learning framework for urban pollutant concentration prediction from sparse data',
    authors: ['C. Gupta', 'A. Amitabh', 'K. K. Meena', 'A. K. Goswami'],
    venue: '18th International Conference on Communication Systems &amp; Networks (COMSNETS), IEEE', venueText: '18th International Conference on Communication Systems and Networks (COMSNETS)',
    badge: 'COMSNETS 2026', doi: '10.1109/COMSNETS67989.2026.11418296',
    topics: ['air', 'ai'],
    bib: { kind: 'inproceedings', key: 'gupta2026hybrid', publisher: 'IEEE' },
  },
  {
    id: 'c13', cv: 'C13', type: 'conference', year: 2026,
    title: 'GeoNBeats: Unified spatio-temporal neural basis expansion for air quality estimation in sparse sensor networks',
    authors: ['V. Joshi', 'K. K. Meena', 'A. K. Goswami'],
    venue: 'IEEE International Conference on AI Engineering and Innovation (AIEI)', badge: 'AIEI 2026', doi: '10.1109/AIEI69164.2026.11496657',
    topics: ['air', 'ai'],
    bib: { kind: 'inproceedings', key: 'joshi2026geonbeats', publisher: 'IEEE' },
  },
  {
    id: 'c12', cv: 'C12', type: 'conference', year: 2026,
    title: 'Developing an integrated walkability score using image-based feature extraction and user preferences',
    authors: ['A. Singh', 'K. K. Meena', 'G. Sharma', 'A. K. Goswami', 'S. Mishra'],
    venue: '105th Annual Meeting of the Transportation Research Board, Washington, DC; also accepted at WCTR 2026, France', badge: 'TRB 2026',
    topics: ['active', 'ai'],
  },
  {
    id: 'c11', cv: 'C11', type: 'conference', year: 2025,
    title: 'Dynamic route planning for urban green mobility',
    authors: ['K. K. Meena', 'A. K. Singh', 'A. K. Goswami'],
    venue: '7th Conference of the Transportation Research Group of India (CTRG), SVNIT Surat', badge: 'CTRG 2025',
    topics: ['air', 'tools'],
  },
  {
    id: 'c10', cv: 'C10', type: 'conference', year: 2025,
    title: 'Assessing the air pollution exposure to school children in different modes of transport while commuting to school',
    authors: ['A. Sumbhate', 'K. K. Meena', 'A. K. Goswami'],
    venue: 'Eastern Asia Society for Transportation Studies (EASTS) Conference, Jakarta', badge: 'EASTS 2025',
    topics: ['air', 'active'],
  },
  {
    id: 'c9', cv: 'C9', type: 'conference', year: 2025,
    title: 'A prioritization framework to identify key attributes of transit-oriented development (TOD)',
    authors: ['B. S. Manoj', 'K. K. Meena', 'A. K. Goswami'],
    venue: '1st World Symposium on Sustainable Transport and Livability (WSSTL), IISc Bengaluru', badge: 'WSSTL 2025',
    topics: ['active'],
  },
  {
    id: 'c8', cv: 'C8', type: 'conference', year: 2025,
    title: 'Accessibility assessment of urban public transit to key facilities through spatial analysis: A case study of Delhi',
    authors: ['R. Kodukulla', 'K. K. Meena', 'G. Sharma', 'A. K. Goswami'],
    venue: 'Transportation Infrastructure Projects: Conception to Execution (TIPCE), IIT Roorkee', badge: 'TIPCE 2025',
    topics: ['active'],
  },
  {
    id: 'c7', cv: 'C7', type: 'conference', year: 2025,
    title: 'Air pollution exposure among Kolkata’s auto-rickshaw drivers: PM variability, health risks and predictive modelling',
    authors: ['S. Dasgupta', 'K. K. Meena', 'D. Majumdar', 'A. K. Goswami'],
    venue: 'Advances in Energy Research (AEEE), India', badge: 'AEEE 2025',
    topics: ['air', 'ai'],
  },
  {
    id: 'c6', cv: 'C6', type: 'conference', year: 2024,
    title: 'Impact of air pollution on informed decision-making for choice of a travel mode',
    authors: ['K. K. Meena', 'R. Taneja', 'A. Agarwal'],
    venue: '16th International Conference on Communication Systems &amp; Networks (COMSNETS), IEEE', venueText: '16th International Conference on Communication Systems and Networks (COMSNETS)',
    badge: 'COMSNETS 2024', doi: '10.1109/COMSNETS59351.2024.10427003', pages: '189--194',
    topics: ['air', 'choice'],
    bib: { kind: 'inproceedings', key: 'meena2024impact', publisher: 'IEEE' },
  },
  {
    id: 'c5', cv: 'C5', type: 'conference', year: 2024,
    title: 'Breathable modes to school: Assessing the air pollution exposure of travel choices for school children in urban environments',
    authors: ['A. Sumbhate', 'K. K. Meena', 'A. K. Goswami'],
    venue: '52nd Urban Affairs Association (UAA) Annual Meeting, Nashville', badge: 'UAA 2024',
    topics: ['air', 'active'],
  },
  {
    id: 'c4', cv: 'C4', type: 'conference', year: 2024,
    title: 'Analysing user behaviour along dedicated bicycle facilities in an urban environment',
    authors: ['P. Mohanty', 'K. K. Meena', 'A. K. Goswami'],
    venue: '52nd Urban Affairs Association (UAA) Annual Meeting, Nashville', badge: 'UAA 2024',
    topics: ['active'],
  },
  {
    id: 'c3', cv: 'C3', type: 'conference', year: 2024,
    title: 'Assessing the willingness to bicycle for the first mile to the Mumbai suburban rail',
    authors: ['B. S. Manoj', 'K. K. Meena', 'H. Panchal', 'G. Sharma', 'A. K. Goswami'],
    venue: '17th International Conference on Travel Behaviour Research (IATBR), Vienna', badge: 'IATBR 2024',
    topics: ['active', 'choice'],
  },
  {
    id: 'c2', cv: 'C2', type: 'conference', year: 2023,
    title: 'A review of air pollution exposure impacts on travel behaviour and way forward',
    authors: ['K. K. Meena', 'A. K. Goswami'],
    venue: '16th World Conference on Transport Research (WCTR), Montréal', badge: 'WCTR 2023',
    topics: ['air'],
  },
  {
    id: 'c1', cv: 'C1', type: 'conference', year: 2022,
    title: 'On-road pollution exposure in multiple transport micro-environments: A case study of tier-2 and tier-3 cities in India',
    authors: ['K. K. Meena', 'R. Kumar', 'A. K. Goswami'],
    venue: '14th International Conference on Transportation Planning and Implementation Methodologies for Developing Countries (TPMDC), IIT Bombay', badge: 'TPMDC 2022',
    topics: ['air'],
  },
];

/** Journals and conferences for the "published and presented at" ribbon. */
export const venues = [
  'Transportation Research Record', 'Transport Policy', 'Journal of Transport & Health', 'Urban Climate',
  'Decision Analytics Journal', 'Int. J. of Sustainable Transportation', 'Sustainable Transport and Livability',
  'J. of the Eastern Asia Society for Transportation Studies', 'TRB Annual Meeting', 'IEEE COMSNETS', 'IATBR',
  'WCTR', 'EASTS', 'TPMDC',
];

export const media = {
  outlet: 'The Hindu',
  title: 'New app helps commuters pick ‘greener’ routes on road',
  byline: 'By Ashmita Gupta · 8 June 2025',
  text: 'A feature on DRUM and the IIT Kharagpur team that built it, with results from the Delhi simulations.',
  href: links.hindu,
  thumb: 'assets/img/hindu-thumb',
  clipping: 'assets/img/hindu-clipping.jpg',
};

// ---------------------------------------------------------------------------
// Software
// ---------------------------------------------------------------------------

export const software = [
  {
    id: 'drum', fig: 'sw-drum', tone: 'clean', wide: true,
    kicker: 'Dynamic Routing for Urban Mobility', name: 'DRUM', live: true,
    text: 'Pollution-aware route planning for commuters: five routes from live air-quality and traffic data, including the least-exposure and least-energy options. The basis of the published patent and of a TRR paper.',
    creds: [{ label: 'Patent', href: '#patent' }, { label: 'The Hindu', href: '#media' }, { label: 'TRR 2025', href: '#j8' }],
    tags: ['React', 'Python', 'GraphHopper', 'Mapbox'],
    links: [{ label: 'Open app', href: links.drum, primary: true }, { label: 'Code', href: links.drumCode }],
  },
  {
    id: 'survey', fig: 'sw-survey', tone: 'model',
    kicker: 'Stated-preference surveys', name: 'Choice experiment platform', live: true,
    text: 'Adaptive choice experiments with live response analysis. The instrument behind the two-wave panel of 723 Kolkata commuters.',
    tags: ['React', 'Node.js', 'MongoDB'],
    links: [{ label: 'Open app', href: 'https://survey-iitkgp.vercel.app/', primary: true }],
  },
  {
    id: 'pm25', fig: 'sw-pm25', tone: 'air',
    kicker: 'Machine learning', name: 'Next-day PM<sub>2.5</sub> forecasting', nameText: 'Next-day PM2.5 forecasting', live: true,
    text: 'Machine-learning forecasts of next-day fine particulate concentrations for cities worldwide, in an interactive global viewer.',
    tags: ['Python', 'scikit-learn'],
    links: [
      { label: 'Open viewer', href: 'https://kapil2020.github.io/global-PM-2.5-next-day-forecasting/', primary: true },
      { label: 'Code', href: 'https://github.com/kapil2020/global-PM-2.5-next-day-forecasting' },
    ],
  },
  {
    id: 'aqi', fig: 'sw-aqi', tone: 'heat',
    kicker: 'Real-time monitoring', name: 'India air-quality dashboard',
    text: 'City-level analysis of real-time air quality across India.',
    tags: ['Streamlit', 'Plotly'],
    links: [{ label: 'Code', href: 'https://github.com/kapil2020/india-air-quality-dashboard', primary: true }],
  },
  {
    id: 'modeshare', fig: 'sw-modeshare', tone: 'clean',
    kicker: 'Cycling and motorcycles', name: 'Mode-share dashboard', live: true,
    text: 'Cycling and motorcycle mode share in cities worldwide, with a model that predicts it.',
    tags: ['JavaScript', 'Machine learning'],
    links: [
      { label: 'Open dashboard', href: 'https://kapil2020.github.io/cycling-dashboard/', primary: true },
      { label: 'Code', href: 'https://github.com/kapil2020/cycling-dashboard' },
    ],
  },
  {
    id: 'districts', fig: 'sw-districts', tone: 'ai',
    kicker: 'Spatial data', name: 'Bharat Districts Explorer', live: true,
    text: 'District-level demographic and spatial data for India, explored on an interactive map.',
    tags: ['D3.js'],
    links: [{ label: 'Open explorer', href: 'https://kapil2020.github.io/Bharat-Districts-Explorer/', primary: true }],
  },
];

// ---------------------------------------------------------------------------
// Experience and education
// ---------------------------------------------------------------------------

export const appointments = [
  {
    when: '2026 –', title: 'Postdoctoral Researcher', org: `<a href="${links.humanLab}">HUMAN Lab</a>, University of California, Los Angeles`, place: 'Los Angeles, CA',
    text: 'With Prof. Youngseo Kim. Structured discrete choice estimation (PD-MUSE, manuscript in preparation); heat, exposure and daily activity and travel (HEAT).',
    current: true,
  },
  {
    when: '2024', title: 'Visiting Research Fellow', org: `<a href="${links.leeds}">Institute for Transport Studies</a>, University of Leeds`, place: 'Leeds, UK',
    text: 'International Research Exchange, jointly funded by the University of Leeds and IIT Kharagpur.',
  },
  {
    when: '2021 – 2022', title: 'Research Intern, Electric Mobility', org: `<a href="${links.wri}">WRI India</a>`, place: 'Remote',
    text: 'Inhaled-dose comparison for commuters across electric and internal-combustion fleets; recommendations for electric mobility in tier-2 cities.',
  },
];

export const education = [
  {
    when: '2022 – 2026', title: 'Ph.D., Transportation Engineering', org: `<a href="${links.iitkgp}">Indian Institute of Technology Kharagpur</a>`, place: 'Kharagpur, India',
    text: `RCG School of Infrastructure Design and Management. Advisor: <a href="${links.mustlab}">Prof. Arkopal Kishore Goswami</a>. Thesis: <i>Assessing impacts of perceived air pollution exposure on urban travel behaviour</i>.`,
  },
  {
    when: '2019 – 2021', title: 'M.Tech, Transportation Engineering', org: `<a href="${links.iitr}">Indian Institute of Technology Roorkee</a>`, place: 'Roorkee, India',
    text: `Advisor: <a href="${links.agarwal}">Prof. Amit Agarwal</a>. Thesis: <i>Air quality perception of commuters in Delhi</i>.`,
  },
  {
    when: '2015 – 2019', title: 'B.Tech (Honours), Civil Engineering', org: 'Rajasthan Technical University', place: 'Kota, India',
    text: 'Top 5% of class.',
  },
];

export const awards = [
  { year: '2026', icon: 'plane', title: 'Institute Travel Grant (full funding)', org: 'TRB Annual Meeting, IIT Kharagpur' },
  { year: '2024', icon: 'globe', title: 'International Research Exchange Grant', org: 'University of Leeds and IIT Kharagpur' },
  { year: '2024', icon: 'plane', title: 'Institute Travel Grant (partial funding)', org: 'IATBR, Vienna, IIT Kharagpur' },
  { year: '2024', icon: 'trophy', title: 'Best Presentation Award', org: 'Research Scholar Day, RCGSIDM, IIT Kharagpur' },
  { year: '2023', icon: 'medal', title: 'Best Poster Presentation', org: 'Cyber-Physical Systems Summit (CyPhySS), IISc Bengaluru' },
  { year: '2019 – 2026', icon: 'award', title: 'MHRD Fellowship', org: 'Ministry of Education, Government of India' },
  { year: '2019', icon: 'badge-check', title: 'GATE Civil Engineering, All India Rank 559', org: 'Graduate Aptitude Test in Engineering' },
  { year: 'School', icon: 'sparkles', title: 'Regional winner, National Children’s Science Congress', org: 'Department of Science & Technology, Government of India' },
];

export const talks = [
  { year: '2025', title: 'DRUM: pollution-aware dynamic routing for urban mobility', where: 'Google India' },
  { year: '2022', title: 'Transportation data analysis using real-world mobility data', where: 'NIT Calicut' },
  { year: '2022', title: 'Data visualisation and decision support using Tableau', where: 'Swastik Edustart' },
  { year: '2020', title: 'Quality control and performance evaluation of road infrastructure', where: 'IIT Roorkee' },
  { year: '2019', title: 'Practical aspects of concrete mix design and quality assurance', where: 'Wonder Cement Ltd.' },
];

export const teaching = {
  interests:
    'Core courses in transportation engineering, traffic engineering and transportation planning; electives in travel demand and discrete choice analysis, transportation data analytics and machine learning, and transport, environment and health.',
  ta: [
    { code: 'NPTEL', name: 'Multimodal Urban Transport' },
    { code: 'CEN 662', name: 'Intersection Design' },
    { code: 'CE13001', name: 'Engineering Drawing' },
  ],
  taNote: 'Teaching Assistant at IIT Kharagpur and IIT Roorkee, 2019–2025: laboratory sessions, simulation tools and geospatial analysis.',
};

export const service = {
  reviewer: [
    'Transport Policy', 'Transportation Research Part A: Policy and Practice', 'Transportation Research Record',
    'Travel Behaviour and Society', 'Journal of Transport & Health', 'Research in Transportation Business & Management',
    'Expert Systems with Applications', 'PLOS Climate',
  ],
  roles: [
    { year: '2025', text: 'Technical Session Chair, EASTS Conference, Jakarta' },
    { year: '2023, 2024', text: 'Overall Coordinator, Annual Conference on Infrastructure (IBSR), IIT Kharagpur' },
    { year: '2022 – 2023', text: 'Departmental Social Media Head, IIT Kharagpur' },
    { year: '2020 – 2021', text: 'Placement Representative, IIT Roorkee' },
  ],
  member: [
    'ASCE Transportation & Development Institute', 'Transportation Research Group of India',
    'World Conference on Transport Research Society', 'International Association for Travel Behaviour Research',
  ],
};

export const skills = [
  { key: 'model', icon: 'chart-line', title: 'Modelling', items: ['Hybrid latent class', 'ICLV', 'Mixed logit', 'Nested & IPD logit', 'Panel econometrics', 'Stated-preference design', 'Willingness-to-pay', 'MCDM'] },
  { key: 'ai', icon: 'brain', title: 'Learning', items: ['Deep learning', 'Interpretable ML', 'Geostatistics & kriging', 'LSTM & Prophet', 'Computer vision for the built environment', 'Convex optimisation'] },
  { key: 'code', icon: 'code-xml', title: 'Software', items: ['Python', 'R', 'JavaScript', 'React', 'Node.js', 'SQL', 'MongoDB', 'Git', 'LaTeX', 'NLOGIT', 'SPSS', 'VISSIM', 'QGIS', 'Tableau', 'D3.js'] },
  { key: 'field', icon: 'map', title: 'Fieldwork', items: ['Low-cost sensor deployment', 'On-road exposure measurement by mode', 'Two-wave panel survey administration'] },
];
