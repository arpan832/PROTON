/* DAILY BUGLE FALLBACK DATASET - Demo stories clearly marked as fallback */

window.BUGLE_FALLBACK_ARTICLES = [
  {
    id: 'fb-001',
    title: 'BREAKING: Mysterious Webs Appear Across Queens Overnight',
    excerpt: 'Residents woke up to find intricate web patterns covering fire escapes and rooftops. NYPD has no leads, but locals call it "friendly."',
    content: `In an unusual turn of events, Queens residents discovered elaborate web structures spanning multiple buildings overnight. The webs, described as "incredibly strong yet delicate," appeared between 2-4 AM according to security footage.

NYPD spokesperson said they are investigating but have no suspects. "We've seen similar patterns before," said one officer who asked to remain anonymous. "Usually they disappear by morning, and somehow crime drops 30% on those nights."

Local bodega owner Mr. Delmar reported his cat was rescued from a tree at 3:12 AM by "someone very fast." He declined to elaborate.

The Daily Bugle's own J. Jonah Jameson called the webs "a menace and a public eyesore," demanding the city take action.

Meanwhile, social media is buzzing with #QueensWebs trending citywide.`,
    category: 'Breaking',
    timestamp: new Date(Date.now() - 1000*60*20).toISOString(),
    source: 'Daily Bugle - Field Report',
    image: null,
    isFallback: true,
    breaking: true
  },
  {
    id: 'fb-002',
    title: 'Stark Industries Announces New Sustainable Web-Fluid Prototype',
    excerpt: 'The new bio-degradable formula could revolutionize urban traversal tech, sources say.',
    content: `Stark Industries R&D division today teased a new sustainable web-fluid compound that breaks down within 2 hours of exposure to air, solving long-standing complaints from sanitation departments.

"We've been working with some... enthusiastic field testers," said a Stark spokesperson, hinting at collaboration with an unnamed vigilante.

The formula uses organic polymers and is said to be 400% stronger than previous versions. Environmental groups praised the move.

Details are scarce, but patent filings suggest electromagnetic properties that could allow for "targeted adhesion."

The Daily Bugle will continue to investigate whether taxpayer money funded this project.`,
    category: 'Technology',
    timestamp: new Date(Date.now() - 1000*60*60*2).toISOString(),
    source: 'Daily Bugle Tech Desk',
    image: null,
    isFallback: true,
    breaking: false
  },
  {
    id: 'fb-003',
    title: 'India Launches Quantum Communication Satellite, Joins Elite Space Club',
    excerpt: 'ISRO’s latest mission achieves breakthrough in secure communications.',
    content: `India has successfully launched its first quantum communication satellite, marking a significant milestone in the country's space program. The satellite, developed by ISRO, will enable ultra-secure communications using quantum key distribution.

Scientists at ISRO said the technology is "unhackable in principle" due to laws of quantum physics. The satellite will first connect ground stations in Bangalore and Hyderabad.

Prime Minister's office called it "a proud moment for 1.4 billion Indians."

International observers noted this puts India among only a handful of nations with quantum satellite capability, alongside China and EU initiatives.

The Daily Bugle Science team notes this could have implications for secure journalism and source protection in the future.`,
    category: 'India',
    timestamp: new Date(Date.now() - 1000*60*60*5).toISOString(),
    source: 'Daily Bugle Science Bureau',
    image: null,
    isFallback: true,
    breaking: false
  },
  {
    id: 'fb-004',
    title: 'World: Webb Telescope Spots Ancient Galaxies That Shouldn’t Exist',
    excerpt: 'Astronomers baffled by massive, mature galaxies appearing just 300 million years after Big Bang.',
    content: `NASA's James Webb Space Telescope has discovered six massive galaxies that appear far too mature for their age, challenging our understanding of early universe formation.

The galaxies, seen as they were 13.4 billion years ago, are as massive as our Milky Way but formed in a fraction of the time current models allow.

"This is like finding a fully grown adult in a nursery," said Dr. Priya Sharma, lead researcher.

Theories now range from modified dark matter behavior to entirely new physics. Some suggest we may need to rethink the Big Bang timeline itself.

For Peter Parker fans, it’s a reminder that with great telescopes comes great responsibility to rewrite textbooks.`,
    category: 'Science',
    timestamp: new Date(Date.now() - 1000*60*60*8).toISOString(),
    source: 'Daily Bugle - Science',
    image: null,
    isFallback: true,
    breaking: false
  },
  {
    id: 'fb-005',
    title: 'Spider-Man Saves Broadway: Actor Rescued Mid-Performance',
    excerpt: 'EXCLUSIVE: Eyewitnesses claim web-slinger swung into theater to stop falling chandelier.',
    content: `EXCLUSIVE - Last night's performance of "Into the Spider-Verse: The Musical" took an unexpected turn when a 200-pound chandelier rigging failed mid-song.

According to multiple audience members, a figure in red and blue dropped from the rafters, caught the fixture, and secured it with webbing in under 3 seconds.

"It was better than the actual show," said one attendee. "10/10, would nearly die again."

The production company has not commented, but ticket sales spiked 400% overnight.

J. Jonah Jameson, publisher of this newspaper, maintains this was a publicity stunt. "If he wanted to help, he'd get a job," Jameson stated.

The actor, who was underneath, is reportedly writing a memoir titled "Saved by a Spider."`,
    category: 'Entertainment',
    timestamp: new Date(Date.now() - 1000*60*60*12).toISOString(),
    source: 'Daily Bugle Entertainment',
    image: null,
    isFallback: true,
    breaking: true
  },
  {
    id: 'fb-006',
    title: 'Mumbai Local Trains Get AI-Powered Crowd Management System',
    excerpt: 'New system predicts congestion and suggests optimal coaches in real-time.',
    content: `Mumbai's suburban railway, which carries over 7.5 million passengers daily, has introduced an AI-based crowd management system.

Using CCTV and sensor data, the system predicts crowd density 15 minutes in advance and displays coach-wise occupancy on platform screens and app.

Developed by IIT Bombay students, the system also suggests less crowded alternatives and has reduced average boarding time by 22% in trials.

Western Railway officials said the tech will be rolled out to 20 stations by December.

Commuter Anjali Mehta said: "For once, I got a seat on a Monday morning. It's a miracle."

The Daily Bugle notes that if AI can solve Mumbai locals, it can solve anything.`,
    category: 'India',
    timestamp: new Date(Date.now() - 1000*60*60*18).toISOString(),
    source: 'Daily Bugle Mumbai',
    image: null,
    isFallback: true,
    breaking: false
  },
  {
    id: 'fb-007',
    title: 'World Cup Qualifier: Underdog Team Stuns Champions with Last-Minute Web of Passes',
    excerpt: 'Coach credits "spider-like teamwork" for historic victory.',
    content: `In a match being called the biggest upset of the decade, the underdog national team defeated reigning world champions 2-1 with a goal in the 93rd minute.

The winning play involved 14 consecutive passes described by commentators as "a web that trapped the defense."

Coach Rivera said post-match: "We told the boys to stick together like... well, you know. Like a team that sticks."

The victory secures their first World Cup appearance in 28 years. Celebrations erupted across the capital, with fans climbing streetlights (safely, officials stressed).

The Daily Bugle Sports desk is investigating whether this coach has connections to Queens.`,
    category: 'Sports',
    timestamp: new Date(Date.now() - 1000*60*60*22).toISOString(),
    source: 'Daily Bugle Sports',
    image: null,
    isFallback: true,
    breaking: false
  },
  {
    id: 'fb-008',
    title: 'Global Climate Summit Reaches Historic Deal on Web of Carbon Capture',
    excerpt: '150 nations agree to interconnected carbon capture network.',
    content: `After two weeks of intense negotiations, 150 nations have agreed to create a global interconnected network of carbon capture facilities, described as a "web" that will span continents.

The deal includes $500 billion in funding and mandates that major emitters build capture capacity equivalent to 10% of emissions by 2030.

Environmental activists cautiously welcomed the deal, though some called it "a safety net full of holes."

UN Secretary General said: "For the first time, the world is acting like a true ecosystem - interconnected, interdependent."

The Daily Bugle will track implementation. We remain skeptical but hopeful.`,
    category: 'World',
    timestamp: new Date(Date.now() - 1000*60*60*30).toISOString(),
    source: 'Daily Bugle World',
    image: null,
    isFallback: true,
    breaking: false
  },
  {
    id: 'fb-009',
    title: 'Quantum Computing Breakthrough: Error Correction at Room Temperature',
    excerpt: 'Researchers achieve 99.9% fidelity without cryogenic cooling.',
    content: `A team at University of Chicago has demonstrated quantum error correction at room temperature, a breakthrough that could accelerate practical quantum computing by a decade.

Previous systems required temperatures near absolute zero, making them expensive and bulky. The new approach uses nitrogen-vacancy centers in diamond.

"Our grandmothers could run this in their kitchen," joked lead researcher Dr. Ben Reilly (no relation).

Tech giants have already expressed interest. Google called it "a spider-web of qubits that finally holds."

The Daily Bugle Tech desk notes that Peter Parker's old physics professor would be proud, if confused.`,
    category: 'Technology',
    timestamp: new Date(Date.now() - 1000*60*60*36).toISOString(),
    source: 'Daily Bugle Tech',
    image: null,
    isFallback: true,
    breaking: false
  },
  {
    id: 'fb-010',
    title: 'Jazz Club in Harlem Discovers Lost Coltrane Recording in Basement',
    excerpt: 'Tape from 1965 session includes unheard 12-minute improvisation.',
    content: `A Harlem jazz club undergoing renovation discovered a box of reel-to-reel tapes containing a previously unknown John Coltrane recording from 1965.

The tape includes a 12-minute improvisation that Coltrane reportedly called "too personal" to release at the time.

Audio engineers say the quality is remarkable, and a remastered version will be released next month, with proceeds funding music education in NYC public schools.

Miles Morales, a regular at the club, said: "You can hear the whole city in that solo."

The Daily Bugle Arts section gives this 5 stars before even hearing it. Some things you just know.`,
    category: 'Entertainment',
    timestamp: new Date(Date.now() - 1000*60*60*48).toISOString(),
    source: 'Daily Bugle Culture',
    image: null,
    isFallback: true,
    breaking: false
  },
  {
    id: 'fb-011',
    title: 'BREAKING: Daily Bugle Website Traffic Hits Record After Redesign',
    excerpt: 'Readers praise new holographic interface - Jameson takes credit.',
    content: `This very newspaper's new digital interface, launched last week, has seen traffic increase 300% according to analytics.

Users describe it as "like reading the news inside Spider-Man's computer" and "finally, a news app that doesn't look like every other news app."

Publisher J. Jonah Jameson immediately claimed credit, stating: "I told Parker to make it pop. He finally listened."

Our tech team, led by the ever-humble Peter Parker (photographer), says the redesign uses "glass morphism with a red tint" and "subtle spider-sense pulses."

We have no idea what that means, but readers seem to like it.

In related news, Jameson is now demanding a "Make It More Bugle" button on every page.`,
    category: 'Breaking',
    timestamp: new Date(Date.now() - 1000*60*5).toISOString(),
    source: 'Daily Bugle Internal',
    image: null,
    isFallback: true,
    breaking: true
  },
  {
    id: 'fb-012',
    title: 'IPL 2026: Young Spinner Takes 7 Wickets, Credits Spider-Man Comic for Inspiration',
    excerpt: '19-year-old says he learned spin by watching how spiders wrap prey.',
    content: `In a stunning IPL debut, 19-year-old spinner Aarav Singh took 7 wickets for 12 runs, breaking a 20-year-old record.

When asked about his unorthodox technique, Singh said: "I used to read Spider-Man comics. I noticed how spiders wrap their prey - it's all about angles and patience. I tried to bowl like that."

Cricket analysts are now studying arachnid movement patterns for coaching.

The BCCI has invited a biologist to explain spider silk physics to coaches.

The Daily Bugle Sports editor, who has never watched cricket, is now an expert after reading this article.`,
    category: 'Sports',
    timestamp: new Date(Date.now() - 1000*60*60*60).toISOString(),
    source: 'Daily Bugle Sports - India',
    image: null,
    isFallback: true,
    breaking: false
  }
];
