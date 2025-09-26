import graphData from "../graph.json";

export function useGraph() {
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

  return { nearestNode, shortestPath, nodes };
}
