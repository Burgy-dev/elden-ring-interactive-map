import { useState, useRef, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import mapImage from "./assets/map.png";
import initialMarkers from "./markers.json";
import initialCustomMarkers from "./customMarkers.json";
import initialCustomMarkers1 from "./customMarkers-1.json";
import graphData from "./graph.json";
import swordIcon from "./assets/sword.png";
import armorIcon from "./assets/armor.png";

function App() {
  const [imgSize, setImgSize] = useState(null);

  const [currentScale, setCurrentScale] = useState(1);

  // Grace markers (yellow)
  const [markers, setMarkers] = useState(
    initialMarkers.map((m) => ({
      ...m,
      type: "grace",
      completed: m.completed ?? false,
    }))
  );

  // Custom markers (red = Weapons)
  const [customMarkers, setCustomMarkers] = useState(
    initialCustomMarkers.map((m) => ({
      ...m,
      type: "custom",
      name: m.name || "",
      image: m.image || null,
      completed: m.completed ?? false,
    }))
  );

  // Custom markers 1 (green = Armor)
  const [customMarkers1, setCustomMarkers1] = useState(
    initialCustomMarkers1.map((m) => ({
      ...m,
      type: "custom-1",
      name: m.name || "",
      image: m.image || null,
      completed: m.completed ?? false,
    }))
  );

  const [activeMarker, setActiveMarker] = useState(null);
  const [hideCompleted, setHideCompleted] = useState(false);

  // Navigation state
  const [startMarker, setStartMarker] = useState(null);
  const [endMarker, setEndMarker] = useState(null);
  const [route, setRoute] = useState([]);

  // Graph setup
  const nodes = graphData.nodes;
  const edges = graphData.edges;

  const adjacency = {};
  edges.forEach(({ from, to }) => {
    if (!adjacency[from]) adjacency[from] = [];
    if (!adjacency[to]) adjacency[to] = [];
    const fromNode = nodes.find((n) => n.id === from);
    const toNode = nodes.find((n) => n.id === to);
    const dist = Math.hypot(fromNode.x - toNode.x, fromNode.y - toNode.y);
    adjacency[from].push({ id: to, dist });
    adjacency[to].push({ id: from, dist });
  });

  function nearestNode(marker) {
    let minNode = null;
    let minDist = Infinity;
    for (const n of nodes) {
      const d = Math.hypot(marker.x - n.x, marker.y - n.y);
      if (d < minDist) {
        minDist = d;
        minNode = n;
      }
    }
    return minNode;
  }

  function shortestPath(startId, endId) {
    const dist = {};
    const prev = {};
    const pq = new Set(nodes.map((n) => n.id));

    nodes.forEach((n) => (dist[n.id] = Infinity));
    dist[startId] = 0;

    while (pq.size) {
      const u = [...pq].reduce((a, b) => (dist[a] < dist[b] ? a : b));
      pq.delete(u);

      if (u === endId) break;

      for (const { id: v, dist: w } of adjacency[u] || []) {
        if (!pq.has(v)) continue;
        const alt = dist[u] + w;
        if (alt < dist[v]) {
          dist[v] = alt;
          prev[v] = u;
        }
      }
    }

    const path = [];
    let u = endId;
    while (u) {
      path.unshift(u);
      u = prev[u];
    }
    return path;
  }

  // Compute route when start/end selected
  useEffect(() => {
    if (startMarker && endMarker) {
      const startNode = nearestNode(startMarker);
      const endNode = nearestNode(endMarker);
      if (startNode && endNode) {
        const nodePath = shortestPath(startNode.id, endNode.id);
        const fullPath = [
          startMarker,
          ...nodePath.map((id) => nodes.find((n) => n.id === id)),
          endMarker,
        ];
        setRoute(fullPath);
      }
    } else {
      setRoute([]);
    }
  }, [startMarker, endMarker]);

  // Filter state
  const [filters, setFilters] = useState({
    grace: true,
    weapons: true,
    armor: true,
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const wrapperRef = useRef(null);
  const imgRef = useRef(null);

  const handleImageLoad = (e) => {
    setImgSize({
      w: e.target.naturalWidth,
      h: e.target.naturalHeight,
    });
  };

  // Center image on load
  useEffect(() => {
    if (imgSize && wrapperRef.current) {
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      const fitScale = Math.min(viewportW / imgSize.w, viewportH / imgSize.h);

      const scaledW = imgSize.w * fitScale;
      const scaledH = imgSize.h * fitScale;

      const offsetX = (viewportW - scaledW) / 2;
      const offsetY = (viewportH - scaledH) / 2;

      wrapperRef.current.setTransform(offsetX, offsetY, fitScale, 0, "linear");
    }
  }, [imgSize]);

  // Clamp panning
  const clampPosition = (x, y, scale) => {
    if (!imgSize) return { x, y };
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const scaledW = imgSize.w * scale;
    const scaledH = imgSize.h * scale;

    if (scaledW <= viewportW) {
      x = (viewportW - scaledW) / 2;
    } else {
      const minX = viewportW - scaledW;
      const maxX = 0;
      x = Math.min(maxX, Math.max(minX, x));
    }

    if (scaledH <= viewportH) {
      y = (viewportH - scaledH) / 2;
    } else {
      const minY = viewportH - scaledH;
      const maxY = 0;
      y = Math.min(maxY, Math.max(minY, y));
    }

    return { x, y };
  };
  // Handle marker click
  const handleMarkerClick = (id, type) => {
    const marker =
      type === "grace"
        ? markers.find((m) => m.id === id)
        : type === "custom"
        ? customMarkers.find((m) => m.id === id)
        : customMarkers1.find((m) => m.id === id);

    setActiveMarker(activeMarker?.id === id ? null : marker);
  };

  // Toggle complete state
  const toggleComplete = (id, type) => {
    if (type === "grace") {
      setMarkers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
      );
    } else if (type === "custom") {
      setCustomMarkers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
      );
    } else if (type === "custom-1") {
      setCustomMarkers1((prev) =>
        prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
      );
    }
    setActiveMarker(null);
  };

  // Handle filter toggle
  const toggleFilter = (filter) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  // Search and suggestions
  const allMarkers = [...markers, ...customMarkers, ...customMarkers1];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value) {
      setSuggestions([]);
      return;
    }

    const filtered = allMarkers
      .filter((m) => m.name?.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 5);
    setSuggestions(filtered);
  };

  const handleSelectSuggestion = (marker) => {
    setSearchTerm(marker.name);
    setSuggestions([]);
    setActiveMarker(marker);

    if (wrapperRef.current && imgSize) {
      const scale = 1.5;
      const x = window.innerWidth / 2 - marker.x * scale;
      const y = window.innerHeight / 2 - marker.y * scale;
      wrapperRef.current.setTransform(x, y, scale, 400, "easeOut");
    }
  };

  // Reset navigation
  const resetNavigation = () => {
    setStartMarker(null);
    setEndMarker(null);
    setRoute([]);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "black" }}>
      {/* Toolbar */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1000,
          background: "rgba(0,0,0,0.6)",
          padding: "8px 12px",
          borderRadius: "8px",
          color: "white",
          fontFamily: "sans-serif",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
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

      <TransformWrapper
        ref={wrapperRef}
        minScale={
          imgSize
            ? Math.min(
                window.innerWidth / imgSize.w,
                window.innerHeight / imgSize.h
              )
            : 1
        }
        maxScale={4}
        limitToBounds={false}
        onPanningStop={(ref) => {
          const { scale, positionX, positionY } = ref.state;
          const { x, y } = clampPosition(positionX, positionY, scale);
          if (x !== positionX || y !== positionY) {
            ref.setTransform(x, y, scale, 200, "easeOut");
          }
          setCurrentScale(scale);
        }}
        onZoomStop={(ref) => {
          const { scale, positionX, positionY } = ref.state;
          const { x, y } = clampPosition(positionX, positionY, scale);
          if (x !== positionX || y !== positionY) {
            ref.setTransform(x, y, scale, 200, "easeOut");
          }
          setCurrentScale(scale)
        }}
      >
        <TransformComponent>
          <div
            style={{ position: "relative" }}
            onClick={() => setActiveMarker(null)}
          >
            {/* Map Image */}
            <img
              ref={imgRef}
              src={mapImage}
              alt="Zoomable Map"
              onLoad={handleImageLoad}
              style={{
                display: "block",
                maxWidth: "none",
                maxHeight: "none",
              }}
            />

            {/* Navigation Path */}
            {route.length > 1 && (
              <svg
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              >
                {route.slice(0, -1).map((p, i) => {
                  const q = route[i + 1];
                  return (
                    <line
                      key={i}
                      x1={p.x}
                      y1={p.y}
                      x2={q.x}
                      y2={q.y}
                      stroke="blue"
                      strokeWidth="6"
                    />
                  );
                })}
              </svg>
            )}

            {/* Grace Markers */}
            {imgSize &&
              filters.grace &&
              markers
                .filter((m) => !(hideCompleted && m.completed))
                .map((m) => (
                  <Marker
                    key={m.id}
                    marker={m}
                    activeMarker={activeMarker}
                    handleMarkerClick={handleMarkerClick}
                    toggleComplete={toggleComplete}
                    setStartMarker={setStartMarker}
                    setEndMarker={setEndMarker}
                    startMarker={startMarker}
                    endMarker={endMarker}
                    scale={currentScale}
                  />
                ))}

            {/* Custom Markers (red = Weapons) */}
            {imgSize &&
              filters.weapons &&
              customMarkers
                .filter((m) => !(hideCompleted && m.completed))
                .map((m) => (
                  <Marker
                    key={m.id}
                    marker={m}
                    activeMarker={activeMarker}
                    handleMarkerClick={handleMarkerClick}
                    toggleComplete={toggleComplete}
                    setStartMarker={setStartMarker}
                    setEndMarker={setEndMarker}
                    startMarker={startMarker}
                    endMarker={endMarker}
                    scale={currentScale}
                  />
                ))}

            {/* Custom Markers 1 (green = Armor) */}
            {imgSize &&
              filters.armor &&
              customMarkers1
                .filter((m) => !(hideCompleted && m.completed))
                .map((m) => (
                  <Marker
                    key={m.id}
                    marker={m}
                    activeMarker={activeMarker}
                    handleMarkerClick={handleMarkerClick}
                    toggleComplete={toggleComplete}
                    setStartMarker={setStartMarker}
                    setEndMarker={setEndMarker}
                    startMarker={startMarker}
                    endMarker={endMarker}
                    scale={currentScale}
                  />
                ))}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

function Marker({
  marker: m,
  activeMarker,
  handleMarkerClick,
  toggleComplete,
  setStartMarker,
  setEndMarker,
  startMarker,
  endMarker,
  scale,
}) {
  const isActive = activeMarker?.id === m.id;

  // Base marker size (adjust these to taste)
  const baseSize = 40;
  const markerSize = baseSize / Math.sqrt(scale);
  const popupFontSize = 14 / scale;

  let markerContent;
  if (m.type === "custom") {
    markerContent = (
      <img
        src={swordIcon}
        alt="Weapon"
        style={{
          width: `${markerSize}px`,
          height: `${markerSize}px`,
          objectFit: "contain",
          pointerEvents: "none",
          opacity: m.completed ? 0.4 : 1.0,
          filter: "drop-shadow(0 0 0 black) drop-shadow(0 0 2px black)",
        }}
      />
    );
  } else if (m.type === "custom-1") {
    markerContent = (
      <img
        src={armorIcon}
        alt="Armor"
        style={{
          width: `${markerSize}px`,
          height: `${markerSize}px`,
          objectFit: "contain",
          pointerEvents: "none",
          opacity: m.completed ? 0.4 : 1.0,
          filter: "drop-shadow(0 0 0 black) drop-shadow(0 0 2px black)",
        }}
      />
    );
  } else {
    markerContent = (
      <div
        style={{
          width: `${markerSize}px`,
          height: `${markerSize}px`,
          borderRadius: "50%",
          background: m.completed
            ? "rgba(128,128,128,0.5)"
            : "yellow",
          border: "2px solid black"
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        left: `${m.x}px`,
        top: `${m.y}px`,
        transform: "translate(-50%, -50%)",
        cursor: "pointer",
        zIndex: isActive ? 3000 : 1000,
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleMarkerClick(m.id, m.type);
      }}
    >
      {markerContent}

      {isActive && (
        <div
          style={{
            position: "absolute",
            top: m.type === "grace" ? `-${100 / scale}px` : `-${200 / scale}px`,
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            padding: `${10 / scale}px ${14 / scale}px`,
            borderRadius: "8px",
            border: "2px solid black",
            whiteSpace: "normal",
            zIndex: 4000,
            fontSize: `${popupFontSize}px`,
            fontWeight: "bold",
            minWidth: `${200 / scale}px`,
            maxWidth: `${220 / scale}px`,
            textAlign: "center",
            color: "black",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: `${8 / scale}px`,
          }}
        >
          {/* Title text */}
          {(activeMarker?.type === "custom" ||
            activeMarker?.type === "custom-1") && (
            <>
              {activeMarker?.name && (
                <div style={{ marginBottom: 4 }}>{activeMarker.name}</div>
              )}
              {activeMarker?.image && (
                <img
                  src={activeMarker.image}
                  alt={activeMarker.name}
                  style={{
                    maxWidth: `${160 / scale}px`,
                    maxHeight: `${120 / scale}px`,
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              )}
            </>
          )}

          {activeMarker?.type === "grace" && (
            <div style={{ marginBottom: 8 }}>Site of Grace</div>
          )}

          {/* Buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!startMarker) {
                setStartMarker(m);
              } else if (!endMarker && m.id !== startMarker.id) {
                setEndMarker(m);
              }
            }}
            style={{
              background: startMarker ? "blue" : "darkblue",
              color: "white",
              border: "none",
              padding: `${6 / scale}px ${12 / scale}px`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: `${popupFontSize}px`,
              marginTop: `${6 / scale}px`,
              alignSelf: "center",
            }}
          >
            {!startMarker
              ? "Select as Starting Point"
              : !endMarker && m.id !== startMarker.id
              ? "Select as Destination"
              : "Navigation Active"}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleComplete(m.id, m.type);
            }}
            style={{
              background: m.completed ? "orange" : "green",
              color: "white",
              border: "none",
              padding: `${6 / scale}px ${12 / scale}px`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: `${popupFontSize}px`,
              marginTop: `${6 / scale}px`,
              alignSelf: "center",
            }}
          >
            {m.completed ? "Mark as Incomplete" : "Mark as Complete"}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;