export function Filters({ filters, toggleFilter }) {
  return (
    <div>
      <label>
        <input type="checkbox" checked={filters.grace} onChange={() => toggleFilter("grace")} /> Sites of Grace
      </label>
      <label>
        <input type="checkbox" checked={filters.weapons} onChange={() => toggleFilter("weapons")} /> Weapons
      </label>
      <label>
        <input type="checkbox" checked={filters.armor} onChange={() => toggleFilter("armor")} /> Armor
      </label>
    </div>
  );
}
