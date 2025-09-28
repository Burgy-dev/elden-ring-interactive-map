import { SearchBox } from "./SearchBox";
import { Filters } from "./Filters";

export function Toolbar({
  filters,
  toggleFilter,
  hideCompleted,
  setHideCompleted,
  resetNavigation,
  resetMarkers,
  searchTerm,
  suggestions,
  handleSearchChange,
  handleSelectSuggestion,
}) {
  return (
    <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000, background: "rgba(0,0,0,0.6)", padding: "8px 12px", borderRadius: "8px", color: "white", fontFamily: "sans-serif", display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Hide or Show Completed */}
      <button
        onClick={() => setHideCompleted((prev) => !prev)}
        style={{
          background: hideCompleted ? "purple" : "gray",
          color: "white",
          padding: "6px 12px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {hideCompleted ? "Show Completed" : "Hide Completed"}
      </button>

      {/* Reset Navigation */}
      <button
        onClick={resetNavigation}
        style={{
          background: "blue",
          color: "white",
          padding: "6px 12px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Reset Navigation
      </button>

      {/* Reset Markers */}
      <button
        onClick={resetMarkers}
        style={{
          background: "red",
          color: "white",
          padding: "6px 12px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Reset Markers
      </button>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <label>
          <input
            type="checkbox"
            checked={filters.grace}
            onChange={() => toggleFilter("grace")}
          />
          Sites of Grace
        </label>
        <label>
          <input
            type="checkbox"
            checked={filters.weapons}
            onChange={() => toggleFilter("weapons")}
          />
          Weapons
        </label>
        <label>
          <input
            type="checkbox"
            checked={filters.armor}
            onChange={() => toggleFilter("armor")}
          />
          Armor
        </label>
      </div>

      {/* Search box */}
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search items..."
          style={{
            padding: "6px 10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            width: "200px",
            color: "white",
          }}
        />
        {suggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
              maxHeight: "150px",
              overflowY: "auto",
              color: "black",
              zIndex: 2000,
            }}
          >
            {suggestions.map((s) => (
              <div
                key={s.id}
                onClick={() => handleSelectSuggestion(s)}
                style={{
                  padding: "6px 10px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
              >
                {s.name || (s.type === "grace" ? "Site of Grace" : "Unnamed")}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
