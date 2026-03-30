export default function PrivacyPolicy() {
  return (
    <div className="login-page" style={{ alignItems: 'flex-start', overflow: 'auto' }}>
      <div className="cl-card cl-card--elevated" style={{ maxWidth: 720, margin: '40px auto', padding: '32px 28px' }}>
        <h1 style={{ marginBottom: 4 }}>Privacybeleid</h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 24 }}>
          Laatst bijgewerkt: 28 maart 2026
        </p>

        <section style={{ marginBottom: 24 }}>
          <h2>1. Wie zijn wij?</h2>
          <p>
            Dit platform wordt beheerd door <strong>CrowdBuilding</strong> ("wij", "ons").
            Wij zijn verantwoordelijk voor de verwerking van persoonsgegevens via dit
            community platform, zoals beschreven in dit privacybeleid.
          </p>
          <p>
            Contactgegevens:<br />
            E-mail: <a href="mailto:privacy@crowdbuilding.com">privacy@crowdbuilding.com</a>
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2>2. Welke gegevens verzamelen wij?</h2>
          <p>Wij verwerken de volgende persoonsgegevens:</p>
          <ul>
            <li><strong>Accountgegevens:</strong> naam, e-mailadres en profielfoto (via Google-account of e-mailinlog)</li>
            <li><strong>Lidmaatschappen:</strong> aan welke projecten je deelneemt en je rol daarin</li>
            <li><strong>Inhoud:</strong> berichten, reacties, updates en documenten die je plaatst</li>
            <li><strong>Evenementen:</strong> aanmeldingen voor bijeenkomsten</li>
            <li><strong>Voorkeuren:</strong> thema-instelling (licht/warm/donker), opgeslagen in je browser</li>
          </ul>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2>3. Waarom verwerken wij deze gegevens?</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                <th style={{ textAlign: 'left', padding: '8px 8px 8px 0' }}>Doel</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Grondslag (AVG)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                <td style={{ padding: '8px 8px 8px 0' }}>Inloggen en authenticatie</td>
                <td style={{ padding: 8 }}>Uitvoering overeenkomst</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                <td style={{ padding: '8px 8px 8px 0' }}>Community-functies (berichten, reacties, events)</td>
                <td style={{ padding: 8 }}>Uitvoering overeenkomst</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                <td style={{ padding: '8px 8px 8px 0' }}>Thema-voorkeur opslaan</td>
                <td style={{ padding: 8 }}>Gerechtvaardigd belang</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                <td style={{ padding: '8px 8px 8px 0' }}>Foutmonitoring (Sentry)</td>
                <td style={{ padding: 8 }}>Gerechtvaardigd belang</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2>4. Wie heeft toegang tot je gegevens?</h2>
          <p>Wij delen je persoonsgegevens alleen met de volgende partijen:</p>
          <ul>
            <li><strong>Supabase Inc.</strong> — database- en authenticatiedienst (verwerker, data opgeslagen in de EU)</li>
            <li><strong>Google</strong> — alleen als je inlogt via Google OAuth (authenticatie)</li>
            <li><strong>Sentry</strong> — foutmonitoring (alleen technische foutmeldingen, geen persoonsgegevens)</li>
            <li><strong>Vercel Inc.</strong> — hosting van de applicatie</li>
          </ul>
          <p>
            Met elk van deze partijen zijn passende verwerkersovereenkomsten gesloten.
            Wij verkopen je gegevens nooit aan derden.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2>5. Hoe lang bewaren wij je gegevens?</h2>
          <p>
            Wij bewaren je persoonsgegevens zolang je account actief is. Na verwijdering van
            je account worden je gegevens binnen 30 dagen definitief verwijderd, tenzij
            wettelijke bewaartermijnen van toepassing zijn.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2>6. Jouw rechten</h2>
          <p>Op grond van de AVG heb je de volgende rechten:</p>
          <ul>
            <li><strong>Inzage</strong> — opvragen welke gegevens wij van je hebben</li>
            <li><strong>Rectificatie</strong> — onjuiste gegevens laten corrigeren</li>
            <li><strong>Verwijdering</strong> — je account en gegevens laten verwijderen</li>
            <li><strong>Dataportabiliteit</strong> — je gegevens ontvangen in een gangbaar formaat</li>
            <li><strong>Bezwaar</strong> — bezwaar maken tegen verwerking op basis van gerechtvaardigd belang</li>
            <li><strong>Beperking</strong> — verwerking tijdelijk laten stopzetten</li>
          </ul>
          <p>
            Je kunt deze rechten uitoefenen door een e-mail te sturen naar{' '}
            <a href="mailto:privacy@crowdbuilding.com">privacy@crowdbuilding.com</a>.
            Wij reageren binnen 30 dagen.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2>7. Cookies en lokale opslag</h2>
          <p>
            Wij gebruiken geen tracking cookies. Wel gebruiken wij:
          </p>
          <ul>
            <li><strong>Sessie-opslag</strong> — voor authenticatie (noodzakelijk, beheerd door Supabase)</li>
            <li><strong>localStorage</strong> — voor je thema-voorkeur (functioneel, geen tracking)</li>
          </ul>
          <p>
            Aangezien deze opslag strikt noodzakelijk of functioneel is, is hiervoor
            geen voorafgaande toestemming vereist.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2>8. Beveiliging</h2>
          <p>
            Wij nemen passende technische en organisatorische maatregelen om je
            persoonsgegevens te beschermen, waaronder:
          </p>
          <ul>
            <li>Versleutelde verbindingen (HTTPS/TLS)</li>
            <li>Row-Level Security op databaseniveau</li>
            <li>Rolgebaseerde toegangscontrole</li>
            <li>Beperking van data-toegang tot wat noodzakelijk is</li>
          </ul>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2>9. Klachten</h2>
          <p>
            Als je een klacht hebt over de verwerking van je persoonsgegevens, kun je
            contact met ons opnemen via{' '}
            <a href="mailto:privacy@crowdbuilding.com">privacy@crowdbuilding.com</a>.
            Je hebt ook het recht om een klacht in te dienen bij de{' '}
            <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">
              Autoriteit Persoonsgegevens
            </a>.
          </p>
        </section>

        <section>
          <h2>10. Wijzigingen</h2>
          <p>
            Wij kunnen dit privacybeleid van tijd tot tijd aanpassen. De meest recente
            versie is altijd beschikbaar op deze pagina. Bij belangrijke wijzigingen
            informeren wij je via het platform.
          </p>
        </section>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <a href="/login" className="cl-btn cl-btn--primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
            <i className="fa-solid fa-arrow-left" /> Terug naar inloggen
          </a>
        </div>
      </div>
    </div>
  )
}
