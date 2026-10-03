import type { LocationPage } from "./locations";

/** The 41 places named in the Union & Frame reference that had no CameraBoss page.
 * These are availability pages, not claims that a wedding was photographed there.
 * Every paragraph gives a couple a concrete planning question to consider.
 */
interface CoverageArea {
  name: string;
  region: string;
  source: string;
  lede: string;
  body: string;
  planning: string;
  nearby: string[];
}

const areas: CoverageArea[] = [
  {
    name: "Brighton", region: "London & the South East", source: "London",
    lede: "A seaside celebration can change character as quickly as the light.",
    body: "Brighton gives couples the choice of a busy city setting, quieter streets and an open seafront. We would build portraits around the part of that setting that matters to you, without asking you to disappear from your guests for an hour. Our published London work shows our approach to people and movement; it is not presented as a Brighton wedding.",
    planning: "If photographs by the water matter to you, tell us the ceremony time and whether you have another indoor option. Wind, crowds and the distance between venues all affect the portrait window.",
    nearby: ["London", "Guildford", "Southampton", "Canterbury"],
  },
  {
    name: "Cambridge", region: "London & the South East", source: "Oxford",
    lede: "Historic streets are a backdrop; the people are the point.",
    body: "A Cambridge wedding may bring together a college setting, a city ceremony and guests moving on foot. We photograph the formal moments without losing the smaller exchanges around them. Joy and Ifeanyi’s Oxford story is a relevant example of our work in another university city, clearly separate from Cambridge.",
    planning: "Let us know which spaces you can access for portraits and how far guests must travel between ceremony and reception. College and private-ground permissions should be settled with the venue before the day.",
    nearby: ["Ipswich", "Chelmsford", "London", "Oxford"],
  },
  {
    name: "Southampton", region: "London & the South East", source: "Oxford",
    lede: "A waterfront city wedding deserves a plan that can flex with the weather.",
    body: "Southampton offers both city-centre celebrations and journeys out towards the coast and Hampshire countryside. We look for a portrait plan that fits your timetable, not one that interrupts the day. Our Oxford wedding story shows the balance between location, family and candid moments in our published work.",
    planning: "Share the address of each venue, your guest travel plan and whether you want waterfront portraits. We can then account for traffic, wind and changing light before agreeing a photography schedule.",
    nearby: ["Bournemouth", "Salisbury", "Brighton", "Oxford"],
  },
  {
    name: "Canterbury", region: "London & the South East", source: "London",
    lede: "A compact historic centre makes timing and access part of the story.",
    body: "For a Canterbury wedding, the ceremony, streets and reception may all be close together, yet moving a wedding party still takes time. We would prioritise the people first and use the setting when it supports the moment. The London journal story below is an example of our documentary approach, not a Canterbury event.",
    planning: "Tell us about walking routes, any private spaces you have permission to use and where portraits can happen if the centre is busy. A short, realistic window often works better than a long detour.",
    nearby: ["Chelmsford", "Brighton", "London", "Ipswich"],
  },
  {
    name: "Chelmsford", region: "London & the South East", source: "Essex",
    lede: "Essex celebrations can move from a town ceremony to a countryside reception.",
    body: "Chelmsford couples often have several possible settings within one day. We can photograph the getting-ready moments, the ceremony and a change of pace at the reception while keeping the timeline comfortable. Fola and Marley’s published Essex wedding is real CameraBoss work in the county, though it was not photographed in Chelmsford.",
    planning: "Share both venue addresses and the time guests need to travel between them. If you want family groups before the reception, tell us how many so we can keep that part efficient.",
    nearby: ["Essex", "London", "Ipswich", "Cambridge"],
  },
  {
    name: "Guildford", region: "London & the South East", source: "London",
    lede: "From a Surrey town ceremony to a quieter setting beyond it.",
    body: "A Guildford wedding might centre on a town venue or move out into Surrey. Either way, we aim to make portraits feel like part of the day rather than a separate production. Our published London celebration demonstrates the way we cover family, tradition and unscripted reactions; it is not labelled as Guildford work.",
    planning: "If the ceremony and reception are in different places, include the travel interval and any access limits in your enquiry. We can suggest a portrait window that does not leave guests waiting.",
    nearby: ["London", "Brighton", "Oxford", "Southampton"],
  },
  {
    name: "Bath", region: "South West", source: "Bristol",
    lede: "The city’s stone and changing light can frame a very personal day.",
    body: "Bath has a distinctive streetscape, but we would never make a couple compete with it. The photographs should show the ceremony, family and feeling first, with the city appearing naturally around you. Dara’s Bristol and Nigeria wedding story is our published work elsewhere in the South West, offered as an example of how we handle a day with several chapters.",
    planning: "Tell us whether you want street portraits, indoor portraits or both. Walking time, visitor crowds and permission for private spaces can all change which plan feels relaxed.",
    nearby: ["Bristol", "Gloucester", "Cheltenham", "Salisbury"],
  },
  {
    name: "Bournemouth", region: "South West", source: "Bristol",
    lede: "A coastal wedding needs portraits that work with the day, not against it.",
    body: "Bournemouth can make the sea part of a wedding without making it the whole story. We would photograph the people indoors and outdoors, choosing a short portrait window if the beach is important to you. The Bristol story below is published CameraBoss work from elsewhere in the South West, not a Bournemouth gallery.",
    planning: "If you want photographs on the beach, send the venue location, ceremony time and an indoor fallback. Wind, travel and seasonal crowds can affect how comfortable that part of the day feels.",
    nearby: ["Southampton", "Salisbury", "Bath", "Bristol"],
  },
  {
    name: "Cheltenham", region: "South West", source: "Bristol",
    lede: "A town celebration can open out into the Cotswolds.",
    body: "Cheltenham offers a mix of formal town spaces and celebrations in the surrounding countryside. We would plan for the transition between them while keeping your people at the centre of the photographs. Our Bristol journal story illustrates our approach to a wedding with more than one setting; it is not claimed as local Cheltenham work.",
    planning: "Include the exact reception location and the time between venues when you enquire. If portraits need to happen before a countryside drive, we can plan them before the light or timetable changes.",
    nearby: ["Gloucester", "Bristol", "Bath", "Birmingham"],
  },
  {
    name: "Exeter", region: "South West", source: "Bristol",
    lede: "City energy and a quieter Devon setting can sit in the same wedding story.",
    body: "For an Exeter wedding, we would find the balance between the ceremony, time with guests and portraits that feel like you. A city venue and a rural reception call for a different plan from a single-site day. Dara’s Bristol story below is published work from another South West city and shows how we document a celebration across places.",
    planning: "Tell us where each part of the day happens and whether guests will move between the city and countryside. The distances determine how much time can be given to portraits without squeezing the reception.",
    nearby: ["Plymouth", "Bristol", "Bath", "Gloucester"],
  },
  {
    name: "Gloucester", region: "South West", source: "Bristol",
    lede: "An old city and the countryside around it offer different rhythms.",
    body: "A Gloucester celebration might keep everything close together or move into nearby rural venues. We photograph the day as it happens, then choose portrait locations that fit the light and your schedule. Our Bristol wedding story is a real example of CameraBoss work in the wider region, not a Gloucester wedding.",
    planning: "Share the ceremony and reception addresses, parking or access restrictions and any spaces the venue has reserved for photographs. That lets us protect time with guests and still make the portraits you want.",
    nearby: ["Cheltenham", "Bristol", "Bath", "Birmingham"],
  },
  {
    name: "Plymouth", region: "South West", source: "Bristol",
    lede: "Coastal light is beautiful, but the weather writes its own schedule.",
    body: "Plymouth weddings can bring a waterfront setting into the same frame as family and ceremony. We would plan photographs that work indoors as well as outside, so the day does not depend on perfect conditions. Our published Bristol story shows the CameraBoss approach to coverage elsewhere in the South West.",
    planning: "If waterfront photographs matter, tell us how far the venue is from your chosen spot and whether it is accessible in wedding clothes. A nearby indoor option keeps the timetable resilient.",
    nearby: ["Exeter", "Bristol", "Bath", "Bournemouth"],
  },
  {
    name: "Salisbury", region: "South West", source: "Oxford",
    lede: "A historic setting is strongest when your celebration remains the focus.",
    body: "A Salisbury wedding may bring guests from the city to Wiltshire countryside in one day. We would photograph its changes of pace and use the setting for portraits only where it adds to your story. Joy and Ifeanyi’s Oxford wedding is published CameraBoss work in another historic city, shown honestly as a style reference.",
    planning: "Tell us which spaces you have permission to use and the travel time between ceremony and reception. If you want family photographs in the city, we can plan them before guests disperse.",
    nearby: ["Southampton", "Bournemouth", "Bath", "Oxford"],
  },
  {
    name: "Lincoln", region: "Midlands", source: "Nottingham",
    lede: "A hilltop city asks for thoughtful timing, especially when people move on foot.",
    body: "Lincoln’s older streets and more modern venues can give a wedding contrasting settings. We would make the portrait plan suit the route, the weather and the people joining you. Lydia and Michael’s Nottingham wedding is published CameraBoss work elsewhere in the East Midlands and shows our mix of composed and candid photographs.",
    planning: "Let us know if portraits involve walking uphill or moving between sites. Time for older relatives, transport and a sheltered alternative can make the schedule much kinder to everyone.",
    nearby: ["Nottingham", "Loughborough", "Leicester", "Sheffield"],
  },
  {
    name: "Loughborough", region: "Midlands", source: "Leicester",
    lede: "A Leicestershire wedding can be intimate in town or expansive beyond it.",
    body: "Loughborough is close to CameraBoss’s Leicester base, making it a natural place to discuss coverage for a ceremony or celebration. We would plan around your venue and guests rather than offer a fixed portrait route. Our Leicester journal work gives you a real view of the photographs we have made nearby, without implying that it was in Loughborough.",
    planning: "Send the venue, ceremony time and any second location when you enquire. If you want portraits outside, tell us whether the venue has suitable space or whether travel would be needed.",
    nearby: ["Leicester", "Nottingham", "Derby", "Lincoln"],
  },
  {
    name: "Northampton", region: "Midlands", source: "Leicester",
    lede: "One day can move from a town ceremony to a countryside gathering.",
    body: "Northamptonshire weddings often involve the practical question of how much ground the day covers. We make time for the essential family photographs while leaving room for the moments that happen around them. Our published Leicester work is a nearby example of the CameraBoss style, clearly distinct from a Northampton wedding.",
    planning: "Tell us whether preparation, ceremony and reception share a site. If not, realistic travel time and a short portrait window will matter more than a long shot list.",
    nearby: ["Leicester", "Loughborough", "Coventry", "Oxford"],
  },
  {
    name: "Blackpool", region: "North West", source: "Liverpool",
    lede: "The coast can lend a wedding energy without taking over the photographs.",
    body: "A Blackpool celebration might include a brief promenade portrait or stay entirely with the people at the venue. Either can work. We photograph the atmosphere of the day and keep portraits proportionate to the time you actually want to spend away from guests. Ruth and Onyenka’s Liverpool wedding is published work elsewhere in the North West.",
    planning: "If you want seafront images, share the venue address, time of day and a weather backup. Wind, visitors and travel can all shorten a comfortable outdoor session.",
    nearby: ["Lancaster", "Bolton", "Liverpool", "Manchester"],
  },
  {
    name: "Bolton", region: "North West", source: "Manchester",
    lede: "A Greater Manchester wedding deserves its own pace and its own people.",
    body: "Bolton can be a setting for a town celebration or a starting point for a day that moves outward. We plan group portraits and couple time around your actual schedule, then pay attention to the unscripted moments in between. Ibrahim and Zainab’s Oldham wedding is genuine CameraBoss work elsewhere in Greater Manchester.",
    planning: "Share where you will get ready and whether the reception is at the ceremony venue. If there are several stops, we can decide what should be photographed before guests travel.",
    nearby: ["Manchester", "Liverpool", "Blackpool", "Chester"],
  },
  {
    name: "Chester", region: "North West", source: "Liverpool",
    lede: "Historic streets are a lovely setting when the schedule leaves room for them.",
    body: "A Chester wedding might invite portraits in the city centre, but the celebration itself should lead. We can work with indoor light, family groups and a brief walk if it suits you. Our published Liverpool wedding shows how we document the feeling of a North West celebration, rather than claiming a Chester booking we cannot show.",
    planning: "Tell us whether your venue allows photography outside its own grounds and how far guests must travel. City-centre crowds and walking time can make a short, planned route more useful than improvising.",
    nearby: ["Liverpool", "Crewe", "Manchester", "Wrexham"],
  },
  {
    name: "Crewe", region: "North West", source: "Manchester",
    lede: "A well-connected town can bring guests together from several directions.",
    body: "Crewe weddings may have guests arriving by rail while the ceremony or reception sits elsewhere in Cheshire. We would plan around the real travel and the moments you want documented, then let the celebration unfold. Our published Greater Manchester wedding is a regional example of the work, not a Crewe portfolio claim.",
    planning: "Send both venue addresses and tell us whether any part of the day depends on train arrivals or a transfer for guests. That helps us protect the ceremony and family-photograph windows.",
    nearby: ["Chester", "Manchester", "Liverpool", "Wrexham"],
  },
  {
    name: "Kendal", region: "North West", source: "Manchester",
    lede: "A gateway to the Lakes calls for a calm plan and a weather alternative.",
    body: "Kendal and its surrounding landscape can give a wedding a sense of space. We would keep the photographs connected to the people and avoid making a distant viewpoint the centre of the day. Our Greater Manchester journal story shows CameraBoss’s approach to a celebration elsewhere in the North West.",
    planning: "Tell us how far the venue is from accommodation and whether your portrait location is on site. Rural travel and changeable weather can use up a short gap surprisingly quickly.",
    nearby: ["Lancaster", "Blackpool", "Manchester", "Liverpool"],
  },
  {
    name: "Lancaster", region: "North West", source: "Liverpool",
    lede: "A compact city and Lancashire countryside can shape different chapters.",
    body: "For a Lancaster wedding, we would decide with you whether portraits belong in the city, at the venue or somewhere quieter nearby. The important photographs are still the ceremony and the people gathered around it. Ruth and Onyenka’s Liverpool wedding is published CameraBoss work from elsewhere in the North West.",
    planning: "Share the distance between ceremony and reception and whether you hope to photograph guests in the city before leaving. A wet-weather option is especially useful when the day includes outdoor travel.",
    nearby: ["Kendal", "Blackpool", "Bolton", "Liverpool"],
  },
  {
    name: "York", region: "Yorkshire & North East", source: "Leeds",
    lede: "A beautiful old city is best experienced with the people you came to celebrate.",
    body: "York offers intimate streets as well as larger celebration spaces. We would work with the pace of your wedding, taking portraits when the light and crowds allow without turning the day into a sightseeing route. Aderinsola and Elijah’s Leeds civil wedding is published CameraBoss work in Yorkshire, shown as a regional reference.",
    planning: "If your ceremony and portrait spots are on foot, allow for guest movement and busy streets. Tell us which spaces are private and whether the venue has an indoor alternative.",
    nearby: ["Leeds", "Harrogate", "Bradford", "Sheffield"],
  },
  {
    name: "Bradford", region: "Yorkshire & North East", source: "Leeds",
    lede: "A wedding shaped by family and culture needs space for all of its moments.",
    body: "Bradford couples may bring several traditions, ceremonies or gatherings together. We would listen to what matters in your family and plan coverage so neither the formal portraits nor the fleeting reactions are missed. Our Leeds wedding story is the published Yorkshire celebration we can show today; the Bradford festival on our journal is not a wedding portfolio.",
    planning: "Tell us about each ceremony, outfit change and any family groups that must happen at a particular time. These details help us photograph the full day without interrupting it.",
    nearby: ["Leeds", "Harrogate", "Huddersfield", "York"],
  },
  {
    name: "Durham", region: "Yorkshire & North East", source: "Newcastle",
    lede: "A small city with steep streets calls for portraits close to the celebration.",
    body: "Durham’s setting can be striking, but a wedding timetable is usually happier when photographs stay near the people and venue. We would make an intentional, short portrait plan and document the rest as it happens. Joanna and Jonathon’s Beamish Hall wedding is published CameraBoss work in the wider North East, not a Durham city wedding.",
    planning: "Tell us how guests will move between venues and whether portrait spots require a climb or a drive. Access, permissions and an indoor fallback are worth discussing early.",
    nearby: ["Newcastle", "York", "Leeds", "Sheffield"],
  },
  {
    name: "Harrogate", region: "Yorkshire & North East", source: "Leeds",
    lede: "Elegant surroundings work best when the photographs still feel like you.",
    body: "A Harrogate wedding may make use of town spaces or a venue in the wider Yorkshire landscape. We photograph people first, then compose portraits that belong naturally in the setting. Aderinsola and Elijah’s Leeds civil wedding is our published work nearby and demonstrates our quieter documentary side.",
    planning: "If you plan to move from a town ceremony to a rural reception, send both addresses and your guest transport plan. We can then decide where family groups and couple portraits fit.",
    nearby: ["Leeds", "York", "Bradford", "Huddersfield"],
  },
  {
    name: "Huddersfield", region: "Yorkshire & North East", source: "Leeds",
    lede: "A West Yorkshire day can move between town and open landscape.",
    body: "We would approach a Huddersfield wedding by learning which people, traditions and parts of the setting matter to you. The portraits can be considered without losing the natural energy of the celebration. Our Leeds civil wedding story is real CameraBoss work elsewhere in West Yorkshire, presented as a regional reference.",
    planning: "Tell us whether your venue is in town or beyond it and how long the journey between ceremony and reception takes. That will shape the portrait plan more than a generic list of photo spots.",
    nearby: ["Leeds", "Bradford", "Harrogate", "Sheffield"],
  },
  {
    name: "Glasgow", region: "Scotland", source: "Edinburgh",
    lede: "A city celebration can be bold, intimate and entirely your own.",
    body: "For a Glasgow wedding, we would balance time indoors with any portraits you want on the city streets. The people and traditions should remain more memorable than the backdrop. Olamide and John’s Edinburgh pre-wedding shoot is published CameraBoss work in Scotland; it is a couple session, not a Glasgow wedding.",
    planning: "Send your venues, ceremony time and an indoor portrait option. Scottish weather and city travel make that contingency more useful than a long fixed outdoor route.",
    nearby: ["Stirling", "Edinburgh", "Perth", "Dundee"],
  },
  {
    name: "Aberdeen", region: "Scotland", source: "Edinburgh",
    lede: "Granite streets and coastal light can frame a deeply personal celebration.",
    body: "Aberdeen gives couples a distinctive city setting, yet the strongest wedding images will still be about connection. We would plan portraits around the venue and the weather rather than assume the coast is always the right choice. Our Edinburgh pre-wedding shoot shows published CameraBoss work elsewhere in Scotland.",
    planning: "Tell us whether the ceremony and reception share a venue and if you want photographs outdoors. Travel distance, wind and an indoor alternative will help us build a realistic schedule.",
    nearby: ["Dundee", "Perth", "Inverness", "Edinburgh"],
  },
  {
    name: "Dundee", region: "Scotland", source: "Edinburgh",
    lede: "A waterfront city is a setting, not a reason to leave your guests behind.",
    body: "A Dundee wedding can hold city energy and quieter moments near the water. We would keep portrait time short enough that you stay present for the celebration. Olamide and John’s Edinburgh couple session is our published Scottish work; it demonstrates the style rather than pretending we photographed a Dundee wedding.",
    planning: "Share whether you want waterfront portraits and how far that location is from your venue. A sheltered option helps if the weather changes on the day.",
    nearby: ["Perth", "Edinburgh", "Stirling", "Aberdeen"],
  },
  {
    name: "Inverness", region: "Scotland", source: "Edinburgh",
    lede: "A Highland wedding benefits from generous travel time and a flexible plan.",
    body: "For an Inverness celebration, the venue may be close to town or part of a wider journey. We would find the photographs in the real day before considering a distant scenic stop. Our Edinburgh pre-wedding gallery is published CameraBoss work in Scotland, but it is not presented as an Inverness wedding.",
    planning: "Include venue addresses, access arrangements and the time you want with guests. Longer drives and changing weather can make on-site portraits a better choice than a separate location.",
    nearby: ["Aberdeen", "Perth", "Dundee", "Edinburgh"],
  },
  {
    name: "Perth", region: "Scotland", source: "Edinburgh",
    lede: "A river city can connect a town celebration with the countryside beyond.",
    body: "We would shape a Perth wedding story around the people, from preparations to the final gathering, using the setting where it adds something meaningful. Published CameraBoss work in Scotland currently includes Olamide and John’s Edinburgh couple session, which shows the portrait approach rather than a Perth wedding.",
    planning: "Tell us if guests travel between town and rural venues and whether portraits are possible at the reception site. That decides how much of the day can stay unhurried.",
    nearby: ["Dundee", "Stirling", "Edinburgh", "Aberdeen"],
  },
  {
    name: "Stirling", region: "Scotland", source: "Edinburgh",
    lede: "A historic town and its wider landscape deserve a plan built for your day.",
    body: "A Stirling wedding can feel intimate even when the setting is grand. We would photograph the ceremony and relationships first, then make considered portraits without stretching the timetable. Our published Edinburgh pre-wedding work is an honest Scottish reference, not proof of a Stirling booking.",
    planning: "Tell us about walking routes, access to any historic spaces and whether the reception is outside town. A realistic transfer time protects both the portraits and the celebration.",
    nearby: ["Glasgow", "Edinburgh", "Perth", "Dundee"],
  },
  {
    name: "Cardiff", region: "Wales", source: "Bristol",
    lede: "A capital-city wedding can still feel beautifully personal.",
    body: "Cardiff offers a range of city venues and outdoor settings, but no backdrop matters as much as the people gathered for you. We would decide with you where a short portrait window fits among the ceremony and reception. Our published Bristol wedding is from across the Severn, not from Cardiff; it shows how CameraBoss photographs a multi-part day.",
    planning: "Send the ceremony and reception addresses and tell us if you want city-centre or park portraits. Travel and permission to use private areas affect the best plan.",
    nearby: ["Newport", "Swansea", "Bristol", "Bath"],
  },
  {
    name: "Bangor", region: "Wales", source: "Edinburgh",
    lede: "North Wales can make travel and weather part of the wedding plan.",
    body: "For a Bangor, Gwynedd celebration, we would focus on the ceremony, families and real moments before considering a journey for scenery. Our published Edinburgh couple session is an example of CameraBoss portrait work elsewhere in the UK; it is not a Welsh wedding and we would not present it as one.",
    planning: "Share the venue addresses and whether guests will travel along the coast or inland. If outdoor portraits matter, an accessible indoor alternative and a little spare time will help.",
    nearby: ["Wrexham", "Chester", "Liverpool", "Swansea"],
  },
  {
    name: "Newport", region: "Wales", source: "Bristol",
    lede: "A South Wales wedding can gather people from both sides of the Severn.",
    body: "Newport couples may be planning a single-venue day or a celebration with guests arriving from Bristol, Cardiff and beyond. We would keep the photographs centred on those people while making time for portraits that feel natural. Dara’s Bristol story is published work nearby, but it is not a Newport wedding.",
    planning: "Tell us how the day moves between preparation, ceremony and reception, especially if any part crosses the Severn. We can then protect time for family portraits and the moments around them.",
    nearby: ["Cardiff", "Bristol", "Swansea", "Gloucester"],
  },
  {
    name: "Swansea", region: "Wales", source: "Bristol",
    lede: "A bay-side celebration should leave space for both scenery and people.",
    body: "A Swansea wedding can take place in the city or travel towards the Gower. We would use that setting carefully, without asking you to miss the best part of your reception for distant portraits. Our Bristol journal work is a regional style reference from outside Wales, shown plainly as such.",
    planning: "If you want coastal photographs, share the venue and portrait location so we can check travel and weather alternatives. Wind and daylight affect the plan more than a fixed list of scenic spots.",
    nearby: ["Cardiff", "Newport", "Bristol", "Bangor"],
  },
  {
    name: "Wrexham", region: "Wales", source: "Liverpool",
    lede: "A north-east Wales wedding can bring guests together across the border.",
    body: "For a Wrexham celebration, we would start with the people and your timeline, whether the venue is in town or further into the countryside. The published Liverpool wedding below shows CameraBoss work elsewhere in the North West of England; it is not presented as a Welsh wedding.",
    planning: "Tell us if any part of the day is in Cheshire or elsewhere across the border. Journey times and guest transfers help determine where couple and family portraits should happen.",
    nearby: ["Chester", "Crewe", "Liverpool", "Bangor"],
  },
  {
    name: "Belfast", region: "Northern Ireland", source: "Liverpool",
    lede: "A city wedding can bring generations and traditions into one room.",
    body: "For a Belfast wedding, we would learn how your day unfolds before proposing a portrait route. The best photographs are often the exchanges that happen while everyone is together. Our Liverpool wedding gallery is published CameraBoss work elsewhere in the UK, offered to show the photographic approach rather than imply Northern Ireland work.",
    planning: "Share the date, venues and how guests move between them. If you want city portraits, allow for traffic, access and a sheltered option so the celebration stays comfortable.",
    nearby: ["Bangor, County Down", "Derry", "Liverpool", "Manchester"],
  },
  {
    name: "Bangor, County Down", region: "Northern Ireland", source: "Liverpool",
    lede: "A seaside town gives a wedding its own light and pace.",
    body: "Bangor in County Down is distinct from Bangor in Wales, and this page is for couples planning in Northern Ireland. We would photograph the people and ceremony first, then consider a short coastal portrait window if it suits your day. Our published Liverpool wedding is work from elsewhere in the UK, not a Bangor gallery.",
    planning: "Tell us where the ceremony and reception are, and whether you hope to photograph by the water. Wind and travel from Belfast can shape the useful portrait window.",
    nearby: ["Belfast", "Derry", "Liverpool", "Manchester"],
  },
  {
    name: "Derry", region: "Northern Ireland", source: "Liverpool",
    lede: "The city’s walls and river can frame a day rooted in its people.",
    body: "A Derry wedding may move between historic streets and a reception outside the centre. We would keep portraits close to the day’s natural route so guests and family remain part of the story. Our Liverpool journal wedding demonstrates CameraBoss’s work elsewhere in the UK; it is not presented as a Derry booking.",
    planning: "Send the venue addresses, any access plans for city portraits and the guest travel time. A flexible indoor option helps if the weather or crowds change the route.",
    nearby: ["Belfast", "Bangor, County Down", "Liverpool", "Manchester"],
  },
];

export function createCoveragePages(published: LocationPage[]): LocationPage[] {
  const byName = new Map(published.map((page) => [page.name, page]));
  return areas.map((area) => {
    const source = byName.get(area.source);
    if (!source) throw new Error(`Missing published location source for ${area.name}: ${area.source}`);
    const slug = area.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const searchName = area.name === "Bangor" ? "Bangor, Gwynedd" : area.name === "Newport" ? "Newport, South Wales" : area.name === "Perth" ? "Perth, Scotland" : area.name;
    return {
      path: `/${slug}-wedding-photographer/`,
      name: area.name,
      region: area.region,
      title: `${searchName} Wedding Photographer | CameraBoss`,
      description: `Wedding photography in ${searchName} by CameraBoss. ${area.lede} Explore work and check availability.`,
      lede: area.lede,
      heading: `Wedding photography in ${area.name}, planned around you.`,
      body: area.body,
      planning: area.planning,
      storySlug: source.storySlug,
      storyContext: `Published CameraBoss work: ${source.storyContext}`,
      evidenceNote: `The story below was photographed outside ${area.name}. It shows our approach while you consider coverage for your own celebration.`,
      nearby: area.nearby,
      focus: source.focus,
      image: source.image,
      imageAlt: source.imageAlt,
      proofImage: source.proofImage,
    };
  });
}

export const referenceLocationGroups = [
  { region: "London & South East", places: ["Brighton", "Cambridge", "London", "Oxford", "Southampton", "Canterbury", "Chelmsford", "Guildford"] },
  { region: "South West", places: ["Bath", "Bristol", "Bournemouth", "Cheltenham", "Exeter", "Gloucester", "Plymouth", "Salisbury"] },
  { region: "Midlands", places: ["Birmingham", "Leicester", "Nottingham", "Coventry", "Derby", "Lincoln", "Loughborough", "Northampton"] },
  { region: "North West", places: ["Liverpool", "Manchester", "Blackpool", "Bolton", "Chester", "Crewe", "Kendal", "Lancaster"] },
  { region: "Yorkshire & North East", places: ["Leeds", "Newcastle", "Sheffield", "York", "Bradford", "Durham", "Harrogate", "Huddersfield"] },
  { region: "Scotland", places: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness", "Perth", "Stirling"] },
  { region: "Wales", places: ["Cardiff", "Bangor", "Newport", "Swansea", "Wrexham"] },
  { region: "Northern Ireland", places: ["Belfast", "Bangor, County Down", "Derry"] },
] as const;
