import React from "react";
import swordIcon from "../assets/sword.png";
import armorIcon from "../assets/armor.png";

function MarkerComponent({
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
  const baseSize = 40;
  const markerSize = baseSize / Math.sqrt(scale);
  const popupFontSize = 14 / scale;

  let markerContent;
  if (m.type === "custom") {
    markerContent = <img src={swordIcon} alt="Weapon" style={{ width: `${markerSize}px`, height: `${markerSize}px`, opacity: m.completed ? 0.2 : 1, filter: "drop-shadow(0 0 0 black) drop-shadow(0 0 2px black)" }} />;
  } else if (m.type === "custom-1") {
    markerContent = <img src={armorIcon} alt="Armor" style={{ width: `${markerSize}px`, height: `${markerSize}px`, opacity: m.completed ? 0.4 : 1, filter: "drop-shadow(0 0 0 black) drop-shadow(0 0 2px black)" }} />;
  } else {
    markerContent = <div style={{ width: `${markerSize}px`, height: `${markerSize}px`, borderRadius: "50%", background: m.completed ? "rgba(128,128,128,0.5)" : "yellow", border: "2px solid black" }} />;
  }

  return (
    <div style={{ position: "absolute", left: `${m.x}px`, top: `${m.y}px`, transform: "translate(-50%, -50%)", cursor: "pointer", zIndex: isActive ? 3000 : 1000 }}
      onClick={(e) => { e.stopPropagation(); handleMarkerClick(m.id, m.type); }}>
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

export const Marker = React.memo(MarkerComponent);
