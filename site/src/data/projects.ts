export type VideoEmbed = {
  vimeoId?: string;
  youtubeId?: string;
  title?: string;
  aspect?: '16x9' | '9x16' | '1x1' | '4x5';
};

export type Category = 'Automotive' | 'Pharma' | 'Tourism' | 'Hospitality' | 'CPG' | 'Tech' | 'Health & Wellness' | 'Entertainment';

export type Project = {
  slug: string;
  client: string;
  selectsDir: string;
  category: Category;
  agency?: string;
  format?: string;
  role: string;
  videos?: VideoEmbed[];
  description?: string;
};

export const CATEGORIES: Category[] = ['Automotive', 'Pharma', 'Tourism', 'Hospitality', 'CPG', 'Tech', 'Health & Wellness', 'Entertainment'];

export const projects: Project[] = [
  { slug: 'ford', client: 'Ford', selectsDir: 'Ford', category: 'Automotive', agency: 'MinkHowl', role: 'Senior Producer', format: 'Motion · TikTok 9×16', description: 'Ford Escape social campaign with @ChelseaAsOfLate, @ElyseFox, @DavidSuh.', videos: [
    { vimeoId: '858776746', title: 'Get Ready' },
    { vimeoId: '858775799', title: 'Get It Done' },
    { vimeoId: '858775693', title: 'Get Recharged' },
    { vimeoId: '858775652', title: 'Get Your Angles' },
  ]},
  { slug: 'toyota', client: 'Toyota', selectsDir: 'Toyota', category: 'Automotive', agency: 'Bax + Towner', role: 'Senior Producer', format: 'Motion + Stills', description: '2025 Toyota Crown Signia — “Effortless Elegance.”', videos: [{ vimeoId: '1015756503', title: '2025 Crown Signia' }, { vimeoId: '858753061', title: 'Land Cruiser MY24' }] },
  { slug: 'infiniti', client: 'Infiniti', selectsDir: '', category: 'Automotive', agency: 'Designory · Bax + Towner', role: 'Senior Producer', format: 'Motion · MY25 Accessories', description: 'Infiniti MY25 Accessories campaign — overview plus three category films (Adventure, Everyday, Hospitality).', videos: [
    { youtubeId: 'nGNo5zUPl_I', title: 'Overview' },
    { youtubeId: 'SUvDnBcjRO8', title: 'Adventure Accessories' },
    { youtubeId: 'NaKECufdy-0', title: 'Everyday Accessories' },
    { youtubeId: '1Ecp86DFtk0', title: 'Hospitality Accessories' },
  ] },
  { slug: 'bfgoodrich', client: 'BFGoodrich', selectsDir: 'BFGoodrich', category: 'Automotive', agency: 'Bax + Towner / Poje Marketing', role: 'Senior Producer', format: 'Motion + Stills', description: 'Trail-Terrain T/A campaign — broadcast and digital.', videos: [
    { vimeoId: '828393629', title: 'Trail-Terrain 60s' },
    { vimeoId: '828393831', title: 'Core 30s' },
    { vimeoId: '828393714', title: 'Active 30s' },
    { vimeoId: '828393758', title: 'Broad 30s' },
    { vimeoId: '828393810', title: 'Built To Last 15s' },
    { vimeoId: '828393893', title: 'Engineered To Explore 15s' },
    { vimeoId: '828393923', title: 'Equipped For Every Season 15s' },
  ] },
  { slug: 'cruise', client: 'Cruise', selectsDir: 'Cruise', category: 'Automotive', agency: 'Bax + Towner', role: 'Senior Producer', format: 'Stills · LA locations' },
  { slug: 'casper', client: 'Casper', selectsDir: 'Casper', category: 'CPG', agency: 'Steelworks', role: 'Senior Producer', format: 'Motion + Stills', description: 'Dream Machine launch — Core and Cooling lines.', videos: [
    { vimeoId: '756461135', title: 'Core 30s' },
    { vimeoId: '756461374', title: 'Core 15s' },
  ] },
  { slug: 'oura', client: 'Oura Ring', selectsDir: 'Oura', category: 'Health & Wellness', role: 'Senior Producer', format: 'Motion · Holiday social', description: 'Six-spot holiday social campaign for Oura.', videos: [
    { vimeoId: '756169212', title: 'Holiday Party' },
    { vimeoId: '756169220', title: 'Holiday Yard Work' },
    { vimeoId: '756169226', title: 'Meditation / Giftwrap' },
    { vimeoId: '756169229', title: "Santa's Nap" },
    { vimeoId: '756169248', title: 'Sleep Sounds' },
    { vimeoId: '756169258', title: 'Workout / Pingpong' },
  ] },
  { slug: 'kt-tape', client: 'KT Tape', selectsDir: 'KTTape', category: 'Health & Wellness', agency: 'Bax + Towner', role: 'Senior Producer', format: 'Motion', videos: [{ vimeoId: '1015753206', title: 'KT Tape' }] },
  { slug: 'optinose', client: 'Optinose', selectsDir: 'Optinose', category: 'Pharma', agency: 'Fingerpaint', role: 'Senior Producer', format: 'Motion · 4K', description: 'XHANCE pharma campaign.', videos: [{ vimeoId: '910135161', title: 'Optinose 4K' }] },
  { slug: 'gavreto', client: 'Calcium · Gavreto', selectsDir: 'Gavreto', category: 'Pharma', role: 'Senior Producer', format: 'Stills' },
  { slug: 'gilead-galapagos', client: 'Gilead · Galapagos', selectsDir: 'Gilead', category: 'Pharma', role: 'Senior Producer', format: 'Stills' },
  { slug: 'forxiga', client: 'Forxiga', selectsDir: 'Forxiga', category: 'Pharma', role: 'Senior Producer', format: 'Stills' },
  { slug: 'prolia', client: 'Prolia', selectsDir: 'Prolia', category: 'Pharma', role: 'Senior Producer', format: 'Stills' },
  { slug: 'neom', client: 'NEOM', selectsDir: 'Neom', category: 'Tourism', role: 'Senior Producer', format: 'Motion + Stills · Erik Almas', description: 'Saudi Arabia destination campaign with photographer Erik Almas.', videos: [
    { vimeoId: '756152716', title: 'Boater' },
    { vimeoId: '756152717', title: 'Hikers' },
    { vimeoId: '756152727', title: 'Monolith' },
  ] },
  { slug: 'newport-beach', client: 'Visit Newport Beach', selectsDir: 'NewportBeachTourism', category: 'Tourism', agency: 'Greenhaus', role: 'Senior Producer', format: 'Motion + Stills', videos: [
    { vimeoId: '756483978', title: 'Lido Rooftop' },
    { vimeoId: '756484142', title: 'Surfboard' },
  ] },
  { slug: 'monarch-casino', client: 'Monarch Casino', selectsDir: 'MonarchCasinos', category: 'Hospitality', role: 'Senior Producer', format: 'Motion + Stills', videos: [{ vimeoId: '755835750', title: 'Resort 30s Final' }] },
  { slug: 'atlantis-casino', client: 'Atlantis Casino, Reno', selectsDir: 'AtlantisCasino', category: 'Hospitality', role: 'Senior Producer', format: 'Motion + Stills', videos: [{ vimeoId: '755947223', title: 'Atlantis Casino Reno' }] },
  { slug: 'resort-world', client: 'Resort World, Las Vegas', selectsDir: 'ResortWorld', category: 'Hospitality', agency: 'Hooray Agency', role: 'Senior Producer', format: 'Motion + Stills', videos: [
    { vimeoId: '755837736', title: 'Entertainment' },
    { vimeoId: '755837725', title: 'Pool' },
  ] },
  { slug: 'choices', client: 'Choices', selectsDir: 'Choices', category: 'Entertainment', role: 'Senior Producer', format: 'Motion · 4 spots', description: 'Camping, Gill, Soccer, Guitar.' },
  { slug: 'presidio-theatre', client: 'Presidio Theatre', selectsDir: 'PresideoTheatre', category: 'Entertainment', role: 'Senior Producer', format: 'Stills · Magic Lamp' },
  { slug: 'kelsey-mcclellan-current', client: 'Current', selectsDir: 'Current', category: 'Tech', agency: 'Photographer: Kelsey McClellan', role: 'Senior Producer', format: 'Stills' },
  { slug: 'lvl-watch', client: 'LVL', selectsDir: 'LVLWatch', category: 'Tech', role: 'Senior Producer', format: 'Stills · Wearable' },
  { slug: 'disney', client: 'Disney + GitHub', selectsDir: 'Disney + GitHub', category: 'Tech', role: 'Senior Producer', format: 'Stills' },
  { slug: 'kelsey-mcclellan-quaker', client: 'Quaker Rice Chips', selectsDir: 'QuakerRiceSnacks', category: 'CPG', agency: 'Mekanism · Kelsey McClellan', role: 'Senior Producer', format: 'Stills' },
  { slug: 'kelsey-mcclellan-sonic', client: 'Sonic', selectsDir: 'Sonic', category: 'CPG', agency: 'Photographer: Kelsey McClellan', role: 'Senior Producer', format: 'Stills' },
  { slug: 'kerrygold', client: 'Kerrygold', selectsDir: 'KerryGold', category: 'CPG', role: 'Senior Producer', format: 'Stills' },
  { slug: 'straus', client: 'Straus', selectsDir: 'Straus', category: 'CPG', role: 'Senior Producer', format: 'Stills' },
];
