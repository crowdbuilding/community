import { useState } from 'react'

const PHASES = [
  {
    num: '1', name: 'Definitieve selectiefase', sub: 'Structuur Ontwerp',
    period: 'Maart – Oktober 2025', color: '#4A90D9', members: 30,
    items: [
      { t: 'Start SO-fase', s: 'Lancering wervingscampagne OutForever', type: 'milestone', d: 'De selectiefase begint met een brede wervingscampagne om toekomstige bewoners te bereiken. Het doel is een diverse groep samen te brengen die de basis vormt voor de gemeenschap.' },
      { t: 'Workshop 0: WoonConcept & Kernwaarden', s: 'Gezamenlijk de fundamenten leggen', type: 'workshop', d: 'Bewoners bepalen samen hun kernwaarden en hoe die vertaald worden naar het woonconcept. Thema\'s als duurzaamheid, gemeenschapszin en diversiteit.' },
      { t: 'Formatie teams', s: 'Welzijn & Zorg (2–4), Bouwteam (3–6), Ledenteam (2–4)', type: 'team', d: 'Drie werkgroepen worden geformeerd: welzijn & zorg voor sociale cohesie, het bouwteam voor technische begeleiding, en het ledenteam voor communicatie en werving.' },
      { t: 'Kennismakingsbijeenkomst', s: 'Groepsvorming intensiveren', type: 'milestone', d: 'Een informele bijeenkomst waar alle geïnteresseerden elkaar leren kennen. Vertrouwen opbouwen en groepsdynamiek versterken.' },
      { t: 'Workshop 1: Collectieve Ruimtes', s: '"Wat willen we delen?"', type: 'workshop', d: 'Van gemeenschappelijke tuin tot gedeelde werkplekken, wasruimte of logeerkamer — hier worden de collectieve ambities concreet.' },
      { t: 'Workshop 2: Welzijn & Gezondheid', s: 'Omkijken naar elkaar', type: 'workshop', d: 'Zorgconcepten, mantelzorgondersteuning en welzijnsvoorzieningen die in het ontwerp geïntegreerd kunnen worden.' },
      { t: 'Workshop 3: Ontwerpkeuzes', s: 'Semi-open of gesloten, collectief en privaat', type: 'workshop', d: 'De balans tussen openheid en privacy. Hoe verhouden collectieve ruimtes zich tot privéwoningen?' },
      { t: 'Sociaal Bestek', s: 'Vastlegging sociale afspraken', type: 'special', d: 'Formeel document dat de sociale afspraken, waarden en ambities vastlegt. Leidraad voor het verdere ontwerpproces.' },
      { t: 'Workshop 4: Structuur en Leven', s: 'Groene binnentuin, flexibiliteit in SO', type: 'workshop', d: 'Het structuurontwerp vertaald naar leefbaarheid: groene buitenruimtes en flexibiliteit voor toekomstige aanpassingen.' },
      { t: 'SO indieningdocumenten vaststellen', s: 'Formele documenten structuurontwerp', type: 'key', d: 'Cruciale milestone: het SO vormt de basis voor het verdere ontwerp en de vergunningaanvraag.' },
    ]
  },
  {
    num: '2', name: 'Ontwikkelfase', sub: 'Voorlopig Ontwerp',
    period: 'Januari – April 2026', color: '#F09020', members: 71,
    items: [
      { t: 'Formalisering Vereniging Vlinderhaven', s: 'Van informeel naar formeel', type: 'formeel', d: 'De informele bewonersgroep wordt een officiële vereniging. Statuten opgesteld, bestuur gekozen, formele structuur vastgelegd.' },
      { t: 'Workshop 5: Collectieve ruimten en ontsluiting', s: 'Collectiviteit en programmering', type: 'workshop', d: 'Hoe worden gedeelde voorzieningen ontsloten? Welke programmering krijgen ze? Hoe wordt collectief gebruik georganiseerd?' },
      { t: 'Workshop 6: Gevelprincipes', s: 'Materialisatie en architectuur', type: 'workshop', d: 'Welke materialen worden gebruikt? Wat is de architectonische identiteit van Vlinderhaven? Duurzaamheid en esthetiek komen samen.' },
      { t: 'Workshop 7: Installatieprincipes', s: 'Ambities bepalen', type: 'workshop', d: 'Energiesystemen, warmtevoorziening, ventilatie en duurzaamheidsdoelen. BENG-normen en circulariteit staan centraal.' },
      { t: 'Voorlopige woningvoorkeur', s: 'Eerste indicatie woningkeuze', type: 'key', d: 'Bewoners geven een eerste indicatie van hun woningvoorkeur. Het project wordt persoonlijk.' },
      { t: 'VO indieningdocumenten vaststellen', s: 'Formele documentatie VO', type: 'milestone', d: 'Alle documenten voor het Voorlopig Ontwerp verzameld en vastgesteld voor gemeente en toetsende instanties.' },
      { t: 'VO-toets gemeente + BENG/MPG', s: 'Gemeentelijke en duurzaamheidstoetsing', type: 'formeel', d: 'Toetsing op BENG (energieprestatie) en MPG (milieuprestatie). Eventuele aanpassingen worden verwerkt.' },
    ]
  },
  {
    num: '3', name: 'Ontwikkelfase', sub: 'Definitief Ontwerp',
    period: 'Mei – November 2026', color: '#3BD269', members: 108,
    items: [
      { t: 'Reserveringsovereenkomst', s: 'Bewoners committeren zich formeel', type: 'formeel', d: 'Bewoners leggen hun intentie vast om een woning af te nemen. Financieel en emotioneel belangrijk moment.' },
      { t: 'Workshop 8: Definitieve keuze installaties', s: 'Technische systemen vastleggen', type: 'workshop', d: 'Warmtepompen, zonnepanelen, ventilatiesystemen en slimme gebouwtechniek.' },
      { t: 'Workshop 9: VvE Huishoudelijk Reglement', s: 'Beheer & Exploitatie', type: 'workshop', d: 'Kostenverdeling, beheer collectieve ruimtes, regels en afspraken voor de VvE.' },
      { t: 'Individuele woningontwerpgesprekken', s: 'Persoonlijke afstemming per huishouden', type: 'milestone', d: 'Individuele gesprekken over woningwensen: indelingskeuzes, afwerkingsniveau en meerwerk-opties.' },
      { t: 'Definitieve woningvoorkeur', s: 'Definitieve woningkeuze', type: 'key', d: 'Bewoners maken hun definitieve keuze. De toewijzing wordt vastgelegd — het moment waarop de woning "van jou" wordt.' },
      { t: 'Maximale VON-prijs', s: 'Vrij-op-naam prijs vastgesteld', type: 'milestone', d: 'Financiële zekerheid voor bewoners en basis voor hypotheekaanvragen.' },
      { t: 'DO indieningdocumenten vaststellen', s: 'DO-pakket gereed', type: 'key', d: 'Het complete Definitief Ontwerp afgerond. Alle technische, financiële en sociale onderdelen uitgewerkt.' },
      { t: 'DO-toets gemeente + BENG/MPG', s: 'Finale gemeentelijke toetsing', type: 'formeel', d: 'Beoordeling op ruimtelijke, energetische en milieutechnische criteria.' },
    ]
  },
  {
    num: '4', name: 'Vergunningsfase', sub: 'Uitwerking',
    period: 'December 2026 – Februari 2027', color: '#F23578', members: 122,
    items: [
      { t: 'Indiening Omgevingsvergunning', s: 'Formele aanvraag bij de gemeente', type: 'key', d: 'Een van de belangrijkste formele stappen — zonder vergunning kan er niet gebouwd worden.' },
      { t: 'Documenteren omgevingsvergunning', s: 'Aanvullende documentatie', type: 'milestone', d: 'Eventueel gevraagde aanvullende documenten. De gemeente kan verduidelijking vragen over specifieke onderdelen.' },
    ]
  },
  {
    num: '5', name: 'Uitvoeringsfase', sub: 'Technisch Ontwerp',
    period: 'Februari – April 2027', color: '#F4B400', members: null,
    items: [
      { t: 'Showroom-meetings', s: 'Materialen en afwerkingen bekijken', type: 'milestone', d: 'Bewoners bekijken materialen, kleuren en afwerkingen in het echt en maken definitieve keuzes.' },
      { t: 'Verkregen Omgevingsvergunning', s: 'De vergunning is verleend!', type: 'key', d: 'Een feestelijk moment — het project mag officieel gebouwd worden.' },
      { t: 'TO fasedocumenten', s: 'Technisch ontwerp voor de aannemer', type: 'formeel', d: 'Gedetailleerde bouwtekeningen en bestekken waarop de bouw gebaseerd wordt.' },
      { t: 'Acceptatie erfpacht', s: 'Erfpachtovereenkomst getekend', type: 'formeel', d: 'De erfpachtovereenkomst met de gemeente regelt het gebruik van de grond.' },
    ]
  },
  {
    num: '6', name: 'Bouw- en inbouwfase', sub: '',
    period: 'Mei 2027 – Oplevering 2029', color: '#7C5CFC', members: 150,
    items: [
      { t: 'Start bouw', s: 'Eerste werkzaamheden op de bouwplaats', type: 'key', d: 'Na jaren van voorbereiding begint de daadwerkelijke bouw. De droom wordt werkelijkheid.' },
      { t: 'Kijkdagen', s: 'Bewoners bezoeken de bouwplaats', type: 'milestone', d: 'Bewoners zien de voortgang met eigen ogen. Je ziet je toekomstige thuis vorm krijgen.' },
      { t: 'Oplevering', s: 'Vlinderhaven is klaar!', type: 'key', d: 'Het gebouw wordt opgeleverd. Na een lang traject is Vlinderhaven een feit. Welkom thuis!' },
    ]
  }
]

const TAG_MAP = {
  workshop: { label: 'Workshop', cls: 'roadmap-tag--blue' },
  milestone: { label: 'Milestone', cls: 'roadmap-tag--orange' },
  key: { label: 'Mijlpaal', cls: 'roadmap-tag--pink' },
  formeel: { label: 'Formeel', cls: 'roadmap-tag--green' },
  team: { label: 'Team', cls: 'roadmap-tag--muted' },
  special: { label: 'Document', cls: 'roadmap-tag--green' },
}

function RoadmapItem({ item }) {
  const [open, setOpen] = useState(false)
  const tag = TAG_MAP[item.type] || TAG_MAP.workshop
  const isKey = item.type === 'key'
  const isSpecial = item.type === 'special'

  let dotCls = 'roadmap-dot--step'
  if (item.type === 'key') dotCls = 'roadmap-dot--key'
  else if (item.type === 'milestone') dotCls = 'roadmap-dot--milestone'

  return (
    <div className={`roadmap-item ${open ? 'roadmap-item--open' : ''} ${isSpecial ? 'roadmap-item--special' : ''}`} onClick={() => setOpen(!open)}>
      <div className={`roadmap-dot ${isSpecial ? 'roadmap-dot--special' : dotCls}`} />
      <div className="roadmap-item__content">
        <div className="roadmap-item__top">
          <span className={`roadmap-item__title ${isKey ? 'roadmap-item__title--key' : ''}`}>{item.t}</span>
          <span className={`roadmap-tag ${tag.cls}`}>{tag.label}</span>
        </div>
        {item.s && <div className="roadmap-item__snippet">{item.s}</div>}
        {open && (
          <div className="roadmap-item__detail">{item.d}</div>
        )}
      </div>
      <i className={`fa-solid fa-chevron-down roadmap-item__chevron ${open ? 'roadmap-item__chevron--open' : ''}`} />
    </div>
  )
}

function RoadmapPhase({ phase, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`roadmap-phase ${open ? 'roadmap-phase--open' : ''}`}>
      <div className="roadmap-phase__head" onClick={() => setOpen(!open)}>
        <div className="roadmap-phase__num" style={{ background: phase.color }}>{phase.num}</div>
        <div className="roadmap-phase__info">
          <div className="roadmap-phase__name">
            {phase.name}{phase.sub ? ` — ${phase.sub}` : ''}
          </div>
          <div className="roadmap-phase__period">{phase.period}</div>
        </div>
        <div className="roadmap-phase__meta">
          {phase.members && (
            <span className="roadmap-phase__members">
              <i className="fa-solid fa-users" /> {phase.members}
            </span>
          )}
          <i className={`fa-solid fa-chevron-down roadmap-phase__chevron ${open ? 'roadmap-phase__chevron--open' : ''}`} />
        </div>
      </div>
      {open && (
        <div className="roadmap-phase__body">
          {phase.items.map((item, i) => (
            <RoadmapItem key={i} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Roadmap() {
  return (
    <div className="view-roadmap">
      <div className="view-header">
        <span className="view-header__eyebrow">Ontwikkeltraject</span>
        <h1>Roadmap</h1>
        <p className="view-header__subtitle">
          Van structuurontwerp tot oplevering — workshops, milestones en formele stappen in zes fasen.
        </p>
      </div>

      <div className="roadmap-phases">
        {PHASES.map((phase, i) => (
          <div key={phase.num}>
            {i > 0 && <div className="roadmap-connector" />}
            <RoadmapPhase phase={phase} defaultOpen={false} />
          </div>
        ))}
      </div>
    </div>
  )
}
