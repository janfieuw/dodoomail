import { sendTestMail } from "./actions";

export default function TestMailPage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Testmail verzenden</h1>

      <form action={sendTestMail}>
        <input
          name="to"
          type="email"
          placeholder="Ontvanger"
          required
          style={{
            padding: 12,
            width: 320,
            marginRight: 10,
          }}
        />

        <button
          type="submit"
          style={{
            padding: 12,
          }}
        >
          Verstuur testmail
        </button>
      </form>
    </div>
  );
}