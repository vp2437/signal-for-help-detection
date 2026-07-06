import {
    useState,
    useCallback,
  } from "react";

  import { useRef } from "react"; // add useRef
  
  import ReactFlow, {
    Background,
    Controls,
    useReactFlow,
    ReactFlowProvider,
  } from "reactflow";
  
  import "reactflow/dist/style.css";

  const HIDE_HANDLES = `
  .react-flow__handle { opacity:0!important; width:1px!important; height:1px!important; min-width:0!important; min-height:0!important; pointer-events:none!important; border:none!important; }
`;

  const COLORS = {
    pink: "#ff5d94",
    blue: "#2d8cff",
    purple: "#9b6dff",
    green: "#49d17d",
    grey: "#64748b",
  
    text: "#e2e8f0",
    subtitle: "#8fb8ff",
  
    panel: "rgba(3,10,25,0.82)",
    border: "rgba(64,120,255,0.15)",
  
    edge: "#2d8cff",
  };
  
  const hiddenNetwork = {

    victim: [
      { id: "recruiter",  label: "Recruiter",            x: 100,  y: 100,  color: COLORS.pink },
      { id: "transport",  label: "Transport",            x: 100,  y: 480,  color: COLORS.blue },
      { id: "employer",   label: "Employer",             x: 900,  y: 100,  color: COLORS.purple },
      { id: "safehouse",  label: "Control",        x: 900,  y: 480,  color: COLORS.green },
    ],
  
    recruiter: [
      { id: "agency",        label: "Recruitment Agency",     x: -280, y: 0,    color: "#ff6b9f" },
      { id: "broker",        label: "Broker",                 x: -320, y: 200,  color: "#ff6b9f" },
      { id: "advertisement", label: "Online Advertisement",   x: -180, y: 360,  color: "#ff6b9f" },
      { id: "job",           label: "Fraudulent Job Offer",   x: -60,  y: -120, color: "#ff6b9f" },
    ],
  
    transport: [
      { id: "driver",         label: "Driver",            x: -160, y: 560, color: "#60a5fa" },
      { id: "route",          label: "Transport Route",   x: -300, y: 420, color: "#60a5fa" },
      { id: "intermediaries", label: "Facilitator",       x: -80,  y: 680, color: "#60a5fa" },
    ],
  
    employer: [
      { id: "factory",      label: "Factory",           x: 1160, y: -20, color: "#c084fc" },
      { id: "labour",       label: "Domestic Work",     x: 1280, y: 180, color: "#c084fc" },
      { id: "construction", label: "Construction Site", x: 1100, y: 340, color: "#c084fc" },
    ],
  
    safehouse: [
      { id: "location",     label: "Document Seizure",       x: 1100, y: 580, color: "#4ade80" },
      { id: "surveillance", label: "Surveillance",        x: 960,  y: 720, color: "#4ade80" },
      { id: "housing",      label: "Debt Bondage",  x: 740,  y: 640, color: "#4ade80" },
    ],
  
  };

  const stage3Leaves = {
    agency:        { count: 3, color: "#f472b6", offsets: [{ dx:-180, dy:-100 },{ dx:-260, dy:40 },{ dx:-140, dy:160 }] },
    broker:        { count: 2, color: "#f472b6", offsets: [{ dx:-220, dy:-80 },{ dx:-300, dy:100 }] },
    advertisement: { count: 4, color: "#f472b6", offsets: [{ dx:-160, dy:-120 },{ dx:-260, dy:0 },{ dx:-200, dy:140 },{ dx:-80, dy:200 }] },
    job:           { count: 2, color: "#f472b6", offsets: [{ dx:-120, dy:-160 },{ dx:60, dy:-180 }] },
    driver:        { count: 3, color: "#93c5fd", offsets: [{ dx:-220, dy:60 },{ dx:-300, dy:200 },{ dx:-140, dy:280 }] },
    route:         { count: 2, color: "#93c5fd", offsets: [{ dx:-260, dy:-60 },{ dx:-340, dy:100 }] },
    intermediaries:{ count: 4, color: "#93c5fd", offsets: [{ dx:-160, dy:120 },{ dx:-60, dy:220 },{ dx:-280, dy:260 },{ dx:60, dy:300 }] },
    factory:       { count: 3, color: "#d8b4fe", offsets: [{ dx:180, dy:-120 },{ dx:280, dy:20 },{ dx:200, dy:160 }] },
    labour:        { count: 2, color: "#d8b4fe", offsets: [{ dx:220, dy:-80 },{ dx:320, dy:100 }] },
    construction:  { count: 4, color: "#d8b4fe", offsets: [{ dx:160, dy:100 },{ dx:280, dy:60 },{ dx:220, dy:220 },{ dx:100, dy:280 }] },
    location:      { count: 2, color: "#86efac", offsets: [{ dx:180, dy:80 },{ dx:300, dy:-20 }] },
    surveillance:  { count: 3, color: "#86efac", offsets: [{ dx:-80, dy:160 },{ dx:100, dy:200 },{ dx:240, dy:120 }] },
    housing:       { count: 2, color: "#86efac", offsets: [{ dx:-160, dy:120 },{ dx:-60, dy:220 }] },
  };
  
  function NetworkFlow({
    stage,
    setStage,
    showIntroPanel,
    setShowIntroPanel,
    setSelectedNode,
    setAiInsight,
    setLoadingInsight,
    selectedEdge,
    setSelectedEdge,
  }) {
  
    const { setCenter } =
      useReactFlow();
  
    const [nodes, setNodes] =
      useState([
        {
          id: "victim",
  
          position: {
            x: 450,
            y: 300,
          },
  
          data: {
            label: "Victim",
          },
  
          style: {
            background: "#4f8cff",
            color: "white",
            border: "none",
            width: 28,
            height: 28,
            borderRadius: "50%",
            boxShadow: "0 0 18px #4f8cff",
          },
        },
      ]);

    const [openedRoot, setOpenedRoot] =
      useState(false);
  
    const [edges, setEdges] =
      useState([]);

    const [activeNode, setActiveNode] = useState("victim");

    const abortRef = useRef(null);

    const victimStyle = {
    background: "#4f8cff",
    color: "white",
    border: "none",
    width: 28,
    height: 28,
    borderRadius: "50%",
    boxShadow: "0 0 18px #4f8cff",
    };

    const resetGraph = () => {

        if (abortRef.current) abortRef.current.abort();

        setNodes([
          {
            id: "victim",
            position: {
              x: 480,
              y: 270,
            },
            data: {
              label: "Victim",
            },
            style: victimStyle,
          },
        ]);
      
        setEdges([]);
      
        setOpenedRoot(false);
      
        setStage(1);

        setShowIntroPanel(true);
        setSelectedNode();
        
        setAiInsight(null);
        setSelectedEdge(null);
        setLoadingInsight(false);
      
        setCenter(
          500,
          300,
          {
            zoom: 1.4,
            duration: 800,
          }
        );
      };
  
    const revealed =
      new Set(
        nodes.map(
          n => n.id
        )
      );

      const nodeInfo = {

        recruiter:
          "Recruiters identify, target, and approach vulnerable individuals for exploitation.",
      
        transport:
          "Transport facilitates the movement of victims during trafficking operations.",
      
        employer:
          "Employers or exploiters profit from forced labour or other forms of exploitation.",
      
        safehouse:
          "Confinement in controlled locations is used to isolate victims and restrict their freedom of movement.",
      
        agency:
          "Fraudulent recruitment agencies may deceive individuals through false employment opportunities.",
      
        broker:
          "Brokers or facilitators connect multiple actors within trafficking networks.",
      
        advertisement:
          "Online or print advertisements may be used to advertise fraudulent employment opportunities.",
      
        job:
          "Fraudulent job offers are a common recruitment method used to deceive victims.",
      
        driver:
          "Drivers facilitate the transportation of victims between locations.",
      
        route:
          "Transport routes may be selected to reduce the likelihood of detection.",
      
        intermediaries:
          "Facilitators may coordinate logistics, transportation, or communication within trafficking operations.",
      
        factory:
          "Factories and manufacturing settings are documented sectors where forced labour may occur.",
      
        labour:
          "Domestic work is a documented sector in which forced labour has been identified.",
      
        construction:
          "Construction is a documented sector where labour exploitation and forced labour may occur.",
      
        location:
          "Identity documents or passports may be confiscated to prevent victims from leaving or seeking assistance.",
      
        surveillance:
          "Surveillance and monitoring may be used to restrict victims' movement and communication.",
      
        housing:
          "Debt bondage is commonly used to control victims by creating financial dependence through real or fabricated debts."
      };

      const getColor = (id) => {
        if (id === "victim") return "#4f8cff";
        for (const group of Object.values(hiddenNetwork)) {
          const m = group.find(n => n.id === id);
          if (m) return m.color;
        }
        return "#8fb8ff";
      };
  
    const onNodeClick =
      useCallback(
        (_, node) => {

            setSelectedNode({
                title: node.data?.label || node.id,
                info: nodeInfo[node.id] || "Part of the trafficking network.",
                color: getColor(node.id),
            });

            setActiveNode(node.id);

            if (node.id === "victim") {

                setStage(2);
              
                setShowIntroPanel(false);
              
                setSelectedNode({
                    title: "Victim",
                    info: "The investigation begins from a single distress signal.",
                    color: "#4f8cff",
                  });
              }
              
              if (
                ["recruiter", "transport", "employer", "safehouse"]
                  .includes(node.id)
              ) {
                setStage(3);
              }

            setCenter(
                node.position.x,
                node.position.y,
                {
                  zoom: 1.35,
                  duration: 700,
                }
              );

            if (
                node.id === "victim" &&
                !openedRoot
              ) {
                setStage(2);
                setOpenedRoot(true);
              
                setNodes(prev =>
                  prev.map(n =>
                    n.id === "victim"
                      ? {
                          ...n,
                          data: {
                            label: "Victim",
                          },
                          style: {
                            ...n.style,
                            width: 28,
                            height: 28,
                          },
                        }
                      : n
                  )
                );
              }
  
          const connections =
            hiddenNetwork[
              node.id
            ];
  
            if (!connections) {
                setNodes(prev => prev.map(n => ({
                  ...n,
                  style: {
                    ...n.style,
                    border: n.id === node.id ? "2.5px solid white" : "none",
                    boxShadow: n.id === node.id
                      ? `0 0 0 3px ${getColor(n.id)}, 0 0 24px ${getColor(n.id)}`
                      : n.style?.boxShadow ?? `0 0 18px ${getColor(n.id)}`,
                  },
                })));
                return;
              }
  
          const newNodes = [];
  
          const newEdges = [];
  
          connections.forEach(
            (target) => {
  
              if (
                !revealed.has(
                  target.id
                )
              ) {
  
                newNodes.push({
  
                  id:
                    target.id,
  
                  position: {
                    x: target.x,
                    y: target.y,
                  },
  
                  data: {
                    label:
                      target.label,
                  },

                  border:
                    activeNode === target.id
                        ? "3px solid white"
                        : "none",
  
                  style: {

                    animation:"pulse 3s infinite",
  
                    background:
                      target.color,
  
                    color:
                      "white",
  
                    border:
                      "none",
  
                    width:
                      target.label
                        ? 16
                        : 16,
  
                    height:
                      target.label
                        ? 16
                        : 16,
  
                    borderRadius:
                      "50%",
  
                    boxShadow:
                      `0 0 18px ${target.color}`,
  
                    fontSize:
                      11,
  
                  },
  
                });
  
              }
  
              newEdges.push({
  
                id:
                  `${node.id}-${target.id}`,
  
                source:
                  node.id,
  
                target:
                  target.id,
  
                animated:
                  true,
  
                type:
                  "default",

                  data: {
                    sourceLabel: node.data?.label || node.id,
                    targetLabel: target.label,
                  },
  
                  style:{
                    stroke: target.color,
                    strokeDasharray: 'none',
                    strokeWidth: 1.8,
                    opacity: 1,
                  },
  
              });
  
            }
          );
  
          const leafNodes = [];
          const leafEdges = [];
          newNodes.forEach(newNode => {
            const leafDef = stage3Leaves[newNode.id];
            if (leafDef) {
              const cx = newNode.position.x;
              const cy = newNode.position.y;
              leafDef.offsets.forEach((offset, i) => {
                const leafId = `${newNode.id}_leaf_${i}`;
                if (!revealed.has(leafId)) {
                  leafNodes.push({
                    id: leafId,
                    position: { x: cx + offset.dx, y: cy + offset.dy },
                    data: { label: "" },
                    style: {
                      background: leafDef.color,
                      border: "none",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      boxShadow: `0 0 6px ${leafDef.color}88`,
                      pointerEvents: "none",
                      cursor: "default",
                      opacity: 0.7,
                    },
                  });
                  leafEdges.push({
                    id: `${newNode.id}-${leafId}`,
                    source: newNode.id,
                    target: leafId,
                    animated: false,
                    type: "default",
                    style: { stroke: leafDef.color, strokeWidth: 0.8, opacity: 0.4 },
                  });
                }
              });
            }
          });

setNodes(prev => {
  const allNew = [...newNodes, ...leafNodes].filter(n => !prev.find(p => p.id === n.id));
  const merged = [...prev, ...allNew];
  return merged.map(n => ({
    ...n,
    style: {
      ...n.style,
      border: n.id === node.id ? "2.5px solid white" : "none",
      boxShadow: n.id === node.id
        ? `0 0 0 3px ${getColor(n.id)}, 0 0 24px ${getColor(n.id)}`
        : n.style?.boxShadow ?? `0 0 18px ${getColor(n.id)}`,
    },
  }));
});

setEdges(prev => {
  const existing = new Set(prev.map(e => e.id));
  return [
    ...prev,
    ...[...newEdges, ...leafEdges].filter(e => !existing.has(e.id)),
  ];
});
  
if (node.id === "victim") {

    setCenter(
      440, 290,
      { zoom: 0.9, duration: 1000 }
    );
  
  } else if (["recruiter","transport","employer","safehouse"].includes(node.id)) {
  
    // zoom to fit this node + its stage3 children
    const children = hiddenNetwork[node.id] || [];
    const xs = [node.position.x, ...children.map(c => c.x)];
    const ys = [node.position.y, ...children.map(c => c.y)];
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const spanX = maxX - minX + 300;
    const spanY = maxY - minY + 300;
    const zoom = Math.min(1.1, Math.max(0.45, 800 / Math.max(spanX, spanY)));
  
    setCenter(cx, cy, { zoom, duration: 900 });
  
  } else {
  
    setCenter(
      node.position.x,
      node.position.y,
      { zoom: 1.2, duration: 800 }
    );
  
  }
  
        },
        [nodes, stage, openedRoot]
      );

      const onEdgeClick = async (_, edge) => {

        setSelectedEdge(edge.id);

        try {

          setAiInsight(null);
      
          setLoadingInsight(true);
      
          const response = await fetch(
            "https://austinaihub-hackathon-june.onrender.com/explain-edge",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
      
              body: JSON.stringify({
                source: edge.data.sourceLabel,
                target: edge.data.targetLabel,
              }),
            }
          );
      
          const data = await response.json();
      
          setAiInsight({
            title:
              `${edge.data.sourceLabel} → ${edge.data.targetLabel}`,
            text:
              data.explanation,
          });
      
        } catch (err) {
      
          console.error(err);
      
        } finally {
      
          setLoadingInsight(false);
      
        }
      };
  
    return (
  
        <>
        <style>{HIDE_HANDLES}</style>
        <ReactFlow
        nodes={nodes}
        edges={edges.map(edge => ({
          ...edge,

          animated:
            edge.id === selectedEdge,

          style: {
            ...edge.style,

            stroke:
              edge.id === selectedEdge
                ? "#ffffff"
                : edge.style?.stroke,

            strokeWidth:
              edge.id === selectedEdge
                ? 4
                : edge.style?.strokeWidth,

            filter:
              edge.id === selectedEdge
                ? "drop-shadow(0 0 8px white)"
                : "none",
          },
        }))}
        onEdgeClick={onEdgeClick}
        onNodeClick={(e, node) => {
          if (node.id.includes("_leaf_")) return;
          onNodeClick(e, node);
        }}
        defaultViewport={{
            x: 80,
            y: -150,
            zoom: 1.4,
          }}
        minZoom={0.3}
        maxZoom={2}
        connectOnClick={false}
        nodesConnectable={false}
      >
  
        <Controls
        showInteractive={false}
        position="bottom-left"
        />

<div
  style={{
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }}
>
{!showIntroPanel && (
  <button
    onClick={resetGraph}
    style={{
      background: "rgba(3,10,25,0.9)",
      border: "1px solid rgba(100,150,255,0.2)",
      color: "#dbeafe",
      padding: "10px 44px",
      borderRadius: "12px",
      cursor: "pointer",
      height: "42px",
    }}
  >
    ↻ Reset View
  </button>
    )}
  {!showIntroPanel && (
    <div
      title="Expand panels"
    //   onClick={() => setShowIntroPanel(true)}
      style={{
        width: "42px",
        height: "42px",
        borderRadius: "10px",
        background: "rgba(3,10,25,0.9)",
        border: "1px solid rgba(100,150,255,0.2)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#8fb8ff",
        fontSize: "18px",
      }}
    >

    </div>
  )}
</div>
  
        <Background
          gap={50}
          size={1}
          color="#1e3a8a"
        />
  
      </ReactFlow>
      </>
  
    );
  
  }
  
  export default function InvisibleNetwork() {

    const [stage, setStage] = useState(1);
    const [showIntroPanel, setShowIntroPanel] = useState(true);

    const [selectedNode, setSelectedNode] = useState();

    const [aiInsight, setAiInsight] = useState(null);
    const [loadingInsight, setLoadingInsight] = useState(false);

    const [selectedEdge, setSelectedEdge] = useState(null);
  
    return (
  
      <div
        style={{
  
          width: "100%",
          height: "80vh",
  
          borderRadius: 24,
  
          overflow: "hidden",
  
          position: "relative",
  
        //   backgroundImage:
        //     "url('/world-map.png')",
  
          backgroundSize:
            "cover",
  
          backgroundPosition:
            "center",
  
          backgroundColor:
            "#050816",

          background:
            "radial-gradient(circle at center, #071a35 0%, #020617 70%)"
  
        }}
      >
  
        <div
          style={{
  
            position: "absolute",
  
            top: 20,
  
            left: 20,
  
            zIndex: 10,
  
            color: "white",
  
            maxWidth: 320,
  
          }}
        >
  
        <h2
        style={{
        fontSize:"24px",
        fontWeight:"600",
        color:"#f8fafc",
        marginBottom:"6px",
        }}
        >
        Invisible Connections
        </h2>

        <p
        style={{
        fontSize:"14px",
        color:"#8fb8ff",
        margin:0,
        }}
        >
        Explore the unseen network behind human trafficking.
        </p>
  
        </div>

        {showIntroPanel && (
        <div
        style={{
        position:"absolute",
        right:20,
        top:20,
        width:"240px",
        zIndex:10,
        color:"white",
        background:"rgba(3,10,25,0.82)",
        backdropFilter:"blur(10px)",
        padding:"20px",
        borderRadius:"16px",
        border:"1px solid rgba(64,120,255,0.15)",
        boxShadow:"0 0 40px rgba(0,0,0,0.35)",
        fontWeight: 600,
        }}
        >

        <h3 >
        The Network Behind One Signal
        </h3>

        <p
        style={{
            fontSize: "13px",
            lineHeight: "1.9",
            color: "#94a3b8",
            marginTop: 10,
        }}>
        This visualization represents how
        one silent signal can reveal
        a much larger system of people,
        locations, and enabling structures.
        </p>

        <p 
        style={{
            fontSize: "13px",
            lineHeight: "1.9",
            color: "#94a3b8",
            marginTop: 20,
        }}>
        Click any node or edge to get more
        information.
        </p>

        </div>
        )}

        {showIntroPanel && (

        <div
        style={{
        position:"absolute",
        right:20,
        top:320,
        width:"240px",
        zIndex:10,
        color:"white",
        background:"rgba(3,10,25,0.82)",
        backdropFilter:"blur(10px)",
        padding:"20px",
        borderRadius:"16px",
        border:"1px solid rgba(64,120,255,0.15)",
        boxShadow:"0 0 40px rgba(0,0,0,0.35)",
        fontWeight: 600,
        }}
        >


        <blockquote
        style={{
        margin:0,
        fontStyle:"italic",
        opacity:0.9,
        }}
        >
        "Trafficking is not a single act.
        It is a system."
        </blockquote>

        <p
        style={{
        fontSize: "13px",
        lineHeight: "1.9",
        marginTop:12,
        color:"#60a5fa",
        }}
        >
        Awareness today.
        <br />
        Change tomorrow.
        </p>

        </div>

        )}

<div style={{
  position: "absolute",
  right: 20,
  top: 70,
  width: "240px",
  zIndex: 20,
  display: "flex",
  flexDirection: "column",
  gap: "10px",
}}>

  {selectedNode && (
    <div style={{
      background: "rgba(3,10,25,0.88)",
      backdropFilter: "blur(10px)",
      padding: "16px 18px",
      borderRadius: "14px",
      border: `1px solid ${selectedNode.color}44`,
      boxShadow: `0 0 20px ${selectedNode.color}33`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: selectedNode.color,
          boxShadow: `0 0 8px ${selectedNode.color}`,
          flexShrink: 0,
        }} />
        <span style={{ fontSize: "18px", fontWeight: 700, color: selectedNode.color }}>
          {selectedNode.title}
        </span>
      </div>
      <p style={{ fontSize: "13px", lineHeight: "1.9", color: "#94a3b8", margin: 0, fontWeight: 600 }}>
        {selectedNode.info}
      </p>
    </div>
  )}

  {loadingInsight && (
    <div style={{
      background: "rgba(3,10,25,0.92)",
      padding: "18px",
      borderRadius: "14px",
      border: "1px solid rgba(45,140,255,0.2)",
    }}>
      <div style={{ color: "#60a5fa", fontWeight: 700, marginBottom: "10px" }}>
        AI RELATIONSHIP ANALYSIS
      </div>
      <p style={{ color: "#94a3b8", lineHeight: "1.8", margin: 0 }}>
        Analyzing relationship...
      </p>
    </div>
  )}

  {aiInsight && !loadingInsight && (
    <div style={{
      background: "rgba(3,10,25,0.92)",
      padding: "18px",
      borderRadius: "14px",
      border: "1px solid rgba(45,140,255,0.2)",
    }}>
      <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: 14, marginBottom: "8px" }}>
        AI RELATIONSHIP ANALYSIS
      </div>
      <h4 style={{ color: "#dbeafe", margin: "0 0 10px 0" }}>
        {aiInsight.title}
      </h4>
      <p style={{ color: "#94a3b8", margin: 0 }}>
        {aiInsight.text}
      </p>
    </div>
  )}

</div>

<div
style={{
position:"absolute",
left:28,
top:140,
zIndex:20,
color: "white",
}}
>

<div
  style={{
    position: "absolute",
    left: 6,
    top: 15,
    width: "2px",
    height: "238px",
    background:
      "linear-gradient(to bottom,#2d8cff,#ff5d94,#9b6dff)",
    opacity: 0.6,
  }}
/>

{/* Stage 1 */}

<div
style={{
display:"flex",
gap:"12px",
marginBottom:"90px",
}}
>

<div
style={{
width:"14px",
height:"14px",
borderRadius:"50%",
background:
stage >= 1
?
"#2d8cff"
:
"transparent",
border:"2px solid #2d8cff",
boxShadow:
stage >= 1
?
"0 0 15px #2d8cff"
:
"none",
}}
/>

<div>
<div style={{color:"#2d8cff"}}>
Stage 1
</div>
<div>The Silent Signal</div>
</div>

</div>

{/* Stage 2 */}

<div
style={{
display:"flex",
gap:"12px",
marginBottom:"65px",
}}
>

<div
style={{
width:"14px",
height:"14px",
borderRadius:"50%",
background:
stage >= 2
?
"#ff5d94"
:
"transparent",
border:"2px solid #ff5d94",
}}
/>

<div>
<div style={{
color:
stage >=2
?
"#ff5d94"
:
"#94a3b8"
}}>
Stage 2
</div>

<div>
Direct Connections
</div>

</div>

</div>

{/* Stage 3 */}

<div
style={{
display:"flex",
gap:"12px",
}}
>

<div
style={{
width:"14px",
height:"14px",
borderRadius:"50%",
background:
stage >= 3
?
"#9b6dff"
:
"transparent",
border:"2px solid #9b6dff",
}}
/>

<div>

<div style={{
color:
stage >=3
?
"#9b6dff"
:
"#94a3b8"
}}>
Stage 3
</div>

<div>
Deeper Links
</div>

</div>

</div>

</div>
  
        <ReactFlowProvider>
        <NetworkFlow
          stage={stage}
          setStage={setStage}
          showIntroPanel={showIntroPanel}
          setShowIntroPanel={setShowIntroPanel}
          setSelectedNode={setSelectedNode}
          setAiInsight={setAiInsight}
          setLoadingInsight={setLoadingInsight}
          selectedEdge={selectedEdge}
          setSelectedEdge={setSelectedEdge}
        />
        </ReactFlowProvider>
  
      </div>
  
    );
  
  }
