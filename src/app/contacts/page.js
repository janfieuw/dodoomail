import { prisma } from "@/lib/prisma";
import { createContact } from "./actions";
import { sendMailToSelected } from "./send-actions";
import "./contacts.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="logo">DODOO Mail</div>

        <nav className="nav">
          <a className="navItem active" href="/contacts">Contacten</a>
          <a className="navItem" href="#">Templates</a>
          <a className="navItem" href="#">Verzenden</a>
          <a className="navItem" href="#">Historiek</a>
          <a className="navItem" href="#">Instellingen</a>
        </nav>

        <div className="userBox">
          <strong>Jan</strong>
          <span>dodoomail lokaal</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <h1>Contacten</h1>
        </header>

        <section className="card">
          <h2>Contact toevoegen</h2>

          <form action={createContact} className="formGrid">
            <input name="companyName" placeholder="Bedrijfsnaam" required />
            <input name="email" placeholder="Email" type="email" required />
            <input name="sector" placeholder="Sector" />
            <input name="postalCode" placeholder="Postcode zetel" />
            <input name="note" placeholder="Nota" />

            <select name="status" defaultValue="lead">
              <option value="lead">Lead</option>
              <option value="verstuurd">Verstuurd</option>
              <option value="geopend">Geopend</option>
              <option value="geklikt">Geklikt</option>
              <option value="geantwoord">Geantwoord</option>
              <option value="niet_interessant">Niet interessant</option>
            </select>

            <button type="submit">Contact toevoegen</button>
          </form>
        </section>

        <section className="card">
          <div className="cardHeader">
            <div>
              <h2>Contactenlijst</h2>
              <p>{contacts.length} contacten</p>
            </div>
          </div>

          <form action={sendMailToSelected}>
            <button type="submit" className="sendButton">
              Mail versturen naar selectie
            </button>

            <table className="table">
              <thead>
                <tr>
                  <th>Selecteer</th>
                  <th>Bedrijfsnaam</th>
                  <th>Email</th>
                  <th>Sector</th>
                  <th>Postcode zetel</th>
                  <th>Nota</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>
                      <input
                        type="checkbox"
                        name="contactIds"
                        value={contact.id}
                      />
                    </td>
                    <td><strong>{contact.companyName}</strong></td>
                    <td>{contact.email}</td>
                    <td>{contact.sector}</td>
                    <td>{contact.postalCode}</td>
                    <td>{contact.note}</td>
                    <td>
                      <span className={`status ${contact.status}`}>
                        {contact.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </form>
        </section>
      </main>
    </div>
  );
}