export default function MaintenancePage() {
  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div>
        <h1>🚧 Website Temporarily Unavailable</h1>

        <p style={{ marginTop: "1rem", fontSize: "18px" }}>
          This website is currently unavailable because some requirements
          have not yet been completed.
        </p>

        <p style={{ marginTop: "0.5rem" }}>
          Please check back later.
        </p>
      </div>
    </main>
  );
}
