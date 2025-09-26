export function SearchBox({ searchTerm, suggestions, handleSearchChange, handleSelectSuggestion }) {
  return (
    <div style={{ position: "relative" }}>
      <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Search items..." />
      {suggestions.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", border: "1px solid #ccc" }}>
          {suggestions.map((s) => (
            <div key={s.id} onClick={() => handleSelectSuggestion(s)} style={{ padding: "6px 10px", cursor: "pointer" }}>
              {s.name || (s.type === "grace" ? "Site of Grace" : "Unnamed")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
