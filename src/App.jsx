import { useState, useRef, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import mapImage from "./assets/map.webp";
import initialMarkers from "./markers.json";
import initialCustomMarkers from "./customMarkers.json";
import initialCustomMarkers1 from "./customMarkers-1.json";

import { Marker } from "./components/Marker.jsx";
import { Toolbar } from "./components/Toolbar.jsx";
import { NavigationPath } from "./components/NavigationPath.jsx";
import { useGraph } from "./hooks/useGraph";
import { clampPosition } from "./utils/clampPosition";

import { useAuth } from "./AuthContext.jsx";
import { api } from "./api";
import { AuthToolbar } from "./components/AuthToolbar.jsx";

function App() {
  const { user } = useAuth();
  const [imgSize, setImgSize] = useState(null);
  const [currentScale, setCurrentScale] = useState(1);
  const [fitScale, setFitScale] = useState(1);

  // Markers
  const [markers, setMarkers] = useState(() => {
    return initialMarkers.map((m) => ({ ...m, type: "grace", completed: m.completed ?? false }));
  });

  const [customMarkers, setCustomMarkers] = useState(() => {
    return initialCustomMarkers.map((m) => ({ ...m, type: "custom", completed: m.completed ?? false }));
  });

  const [customMarkers1, setCustomMarkers1] = useState(() => {
    return initialCustomMarkers1.map((m) => ({ ...m, type: "custom-1", completed: m.completed ?? false }));
  });

  const [activeMarker, setActiveMarker] = useState(null);
  const [hideCompleted, setHideCompleted] = useState(false);

  // load progress if the user is logged in
  useEffect(() => {
    if (user) {
      api.get("/progress").then((res) => {
        const { grace = [], custom = [], custom1 = [] } = res.data;

        setMarkers((prev) =>
          prev.map((m) => ({ ...m, completed: grace.includes(m.id) }))
        );

        setCustomMarkers((prev) =>
          prev.map((m) => ({ ...m, completed: custom.includes(m.id) }))
        );

        setCustomMarkers1((prev) =>
          prev.map((m) => ({ ...m, completed: custom1.includes(m.id) }))
        );
      });
    }
  }, [user]);

  // If no user, reset markers
  useEffect(() => {
    if (!user) {
      // Reset all markers to incomplete locally when the user logs out
      setMarkers((prev) => prev.map((m) => ({ ...m, completed: false })));
      setCustomMarkers((prev) => prev.map((m) => ({ ...m, completed: false })));
      setCustomMarkers1((prev) => prev.map((m) => ({ ...m, completed: false })));
    }
  }, [user]);


  // Navigation
  const [startMarker, setStartMarker] = useState(null);
  const [endMarker, setEndMarker] = useState(null);
  const [route, setRoute] = useState([]);

  // Filters
  const [filters, setFilters] = useState({ grace: true, weapons: true, armor: true });

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Graph
  const { nearestNode, shortestPath, nodes } = useGraph();

  const wrapperRef = useRef(null);
  const imgRef = useRef(null);

  const handleImageLoad = (e) => {
    const w = e.target.naturalWidth;
    const h = e.target.naturalHeight;
    setImgSize({ w, h });

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const newFitScale = Math.min(viewportW / w, viewportH / h);
    setFitScale(newFitScale);
  };

  // Center image
  useEffect(() => {
    if (imgSize && wrapperRef.current) {
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      const newFitScale = Math.min(viewportW / imgSize.w, viewportH / imgSize.h);
      setFitScale(newFitScale);

      const scaledW = imgSize.w * newFitScale;
      const scaledH = imgSize.h * newFitScale;

      const offsetX = (viewportW - scaledW) / 2;
      const offsetY = (viewportH - scaledH) / 2;

      wrapperRef.current.setTransform(offsetX, offsetY, newFitScale, 0, "linear");
    }
  }, [imgSize]);

  // Compute route
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

  // Toggle complete
  const toggleComplete = (id, type) => {
    const update = (list, setList) =>
      setList((prev) => prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m)));

    if (user) {
      // Normalize custom-1 to custom1 before sending
      const normalizedType = type === "custom-1" ? "custom1" : type;
      api.patch("/progress/toggle", { id, type: normalizedType })
        .then(res => {
          // Update local state optimistically
          if (type === "grace") update(markers, setMarkers);
          else if (type === "custom") update(customMarkers, setCustomMarkers);
          else if (type === "custom-1") update(customMarkers1, setCustomMarkers1);
        })
        .catch(console.error);
    } else {
      // Fallback to localStorage for logged-out users
      if (type === "grace") update(markers, setMarkers);
      else if (type === "custom") update(customMarkers, setCustomMarkers);
      else if (type === "custom-1") update(customMarkers1, setCustomMarkers1);
    }

    setActiveMarker(null);
  };


  // Add reset markers
  const resetMarkers = () => {
    if (user) {
      // If logged in, clear progress on the backend
      api.put("/progress/bulk", { grace: [], custom: [], custom1: [] })
        .then(() => {
          setMarkers((prev) => prev.map((m) => ({ ...m, completed: false })));
          setCustomMarkers((prev) => prev.map((m) => ({ ...m, completed: false })));
          setCustomMarkers1((prev) => prev.map((m) => ({ ...m, completed: false })));
        })
        .catch(console.error);
    }
  };

  // Search
  const allMarkers = [...markers, ...customMarkers, ...customMarkers1];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value) return setSuggestions([]);
    const filtered = allMarkers.filter((m) =>
      m.name?.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5);
    setSuggestions(filtered);
  };

  const handleSelectSuggestion = (marker) => {
    setSearchTerm(marker.name);
    setSuggestions([]);
    setActiveMarker(marker);

    if (wrapperRef.current && imgSize) {
      const newScale = 1.5;
      const x = window.innerWidth / 2 - marker.x * newScale;
      const y = window.innerHeight / 2 - marker.y * newScale;
      wrapperRef.current.setTransform(x, y, newScale, 400, "easeOut");
      setCurrentScale(newScale);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "black" }}>
      <Toolbar
        filters={filters}
        toggleFilter={(f) => setFilters((prev) => ({ ...prev, [f]: !prev[f] }))}
        hideCompleted={hideCompleted}
        setHideCompleted={setHideCompleted}
        resetNavigation={() => { setStartMarker(null); setEndMarker(null); setRoute([]); }}
        resetMarkers={resetMarkers}
        searchTerm={searchTerm}
        suggestions={suggestions}
        handleSearchChange={handleSearchChange}
        handleSelectSuggestion={handleSelectSuggestion}
      />

      <AuthToolbar />

      <TransformWrapper
        ref={wrapperRef}
        minScale={fitScale}
        maxScale={4}
        limitToBounds={false}
        pinch={{ step: 0.1 }}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: true }}
        onPanningStop={(ref) => {
          const { scale, positionX, positionY } = ref.state;
          const { x, y } = clampPosition(positionX, positionY, scale, imgSize);
          ref.setTransform(x, y, scale, 200, "easeOut");
          setCurrentScale(scale);
        }}
        onZoomStop={(ref) => {
          let { scale, positionX, positionY } = ref.state;
          if (scale < fitScale) scale = fitScale;
          if (scale > 4) scale = 4;
          const { x, y } = clampPosition(positionX, positionY, scale, imgSize);
          ref.setTransform(x, y, scale, 200, "easeOut");
          setCurrentScale(scale);
        }}
      >
        <TransformComponent>
          <div style={{ position: "relative" }} onClick={() => setActiveMarker(null)}>
            <img ref={imgRef} src={mapImage} alt="Map" onLoad={handleImageLoad} style={{ display: "block", maxWidth: "none", maxHeight: "none" }} />
            <NavigationPath route={route} />
            {[...markers, ...customMarkers, ...customMarkers1]
              .filter((m) => filters[m.type === "grace" ? "grace" : m.type === "custom" ? "weapons" : "armor"])
              .filter((m) => !(hideCompleted && m.completed))
              .map((m) => (
                <Marker
                  key={m.id}
                  marker={m}
                  scale={currentScale}
                  activeMarker={activeMarker}
                  handleMarkerClick={handleMarkerClick}
                  toggleComplete={toggleComplete}
                  setStartMarker={setStartMarker}
                  setEndMarker={setEndMarker}
                  startMarker={startMarker}
                  endMarker={endMarker}
                />
              ))}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

export default App;
