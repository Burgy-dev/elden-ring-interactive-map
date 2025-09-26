export function NavigationPath({ route }) {
  if (route.length < 2) return null;
  return (
    <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
      {route.slice(0, -1).map((p, i) => {
        const q = route[i + 1];
        return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="blue" strokeWidth="6" />;
      })}
    </svg>
  );
}
