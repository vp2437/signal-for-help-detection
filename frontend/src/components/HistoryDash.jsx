import {
    useEffect,
    useState,
    } from "react";
    
    export default function HistoryDash(){
    
    const [
    captures,
    setCaptures
    ]=useState([]);

    const downloadImage = async (url, id) => {

        const response = await fetch(url);
      
        const blob = await response.blob();
      
        const blobUrl = window.URL.createObjectURL(blob);
      
        const link = document.createElement("a");
      
        link.href = blobUrl;
      
        link.download = `alert-${id}.jpg`;
      
        document.body.appendChild(link);
      
        link.click();
      
        link.remove();
      
        window.URL.revokeObjectURL(blobUrl);
      };
    
    useEffect(() => {

        const load = async () => {
      
          try {
      
            const res = await fetch(
              "https://austinaihub-hackathon-june.onrender.com/alerts"
            );
      
            const data = await res.json();
      
            setCaptures(data);
      
          } catch (err) {
      
            console.error(err);
      
          }
      
        };
      
        load();
      
      }, []);
    
      const remove = async (id) => {

        try {
      
          await fetch(
            `https://austinaihub-hackathon-june.onrender.com/alerts/${id}`,
            {
              method: "DELETE"
            }
          );
      
          setCaptures(
            captures.filter(
              item => item.id !== id
            )
          );
      
        } catch (err) {
      
          console.error(err);
      
        }
      };
    
    if(
    captures.length===0
    ){
    
    return(
    
    <div
    style={{
    textAlign:"center",
    }}
    >
    
    No captured alerts yet
    
    </div>
    
    );
    
    }
    
    return(
    
    <div>
    
    <h2 style={{
        fontWeight: "600",
        marginLeft: 20,
        fontSize: 24,
        marginTop: 20,
        marginBottom: 10,
    }}>
    Gallery
    </h2>
    
    <div
    style={{
    
    display:"grid",
    
    gridTemplateColumns:
    "repeat(auto-fill,minmax(300px,1fr))",
    
    gap:20,
    
    }}
    >
    
    {
    
    captures.map(
    item=>(
    
    <div
    key={item.id}
    style={{
    background:"#111",
    padding:16,
    borderRadius:12,
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 0 12px rgba(59,130,246,0.08)",
    }}
    >
    
    <img
    src={
        item.image_url
    }
    alt=""
    style={{
    width:"100%",
    borderRadius:10,
    }}
    />
    
    <div
      style={{
        margin: "14px auto 18px",
        display: "inline-block",
        padding: "5px 12px",
        borderRadius: 18,
        background: "rgba(70, 90, 120, 0.18)",
        color: "#93c5fd",
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      🕒{" "}
      {new Date(item.created_at).toLocaleDateString([], {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}
      {" • "}
      {new Date(item.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </div>

    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 18,
        marginTop: 6,
      }}
    >
      <button
        onClick={() => downloadImage(item.image_url, item.id)}
        style={{
          padding: "6px 14px",
          borderRadius: 8,
          border: "1px solid #3d5a80",
          background: "#2d4059",
          color: "#e5e7eb",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          minWidth: 90,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "#3a506b";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "#2d4059";
        }}
      >
        Download
      </button>

      <button
        onClick={() => remove(item.id)}
        style={{
          padding: "6px 14px",
          borderRadius: 8,
          border: "1px solid #7f4b4b",
          background: "#5a3d3d",
          color: "#e5e7eb",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          minWidth: 90,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "#6a4747";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "#5a3d3d";
        }}
      >
        Delete
      </button>
    </div>    

    </div>
    
    )
    
    )
    
    }
    
    </div>
    
    </div>
    
    );
    
    }