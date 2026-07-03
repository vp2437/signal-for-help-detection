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
    
    <p
    style={{
    color:"white"
    }}
    >
    🕒 {new Date(item.created_at).toLocaleString()}
    </p>
    
    <p
    style={{
    color:"white"
    }}
    >
    🎯 {(item.confidence * 100).toFixed(1)}%
    </p>
    
    <div
    style={{
    display:"flex",
    gap:10,
    }}
    >
    
    <button
    onClick={() =>
        downloadImage(
        item.image_url,
        item.id
        )
    }
    >
    Save
    </button>
    
    <button
    onClick={()=>
    remove(
    item.id
    )
    }
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