import {
    useEffect,
    useState,
    } from "react";
    
    export default function HistoryDash(){
    
    const [
    captures,
    setCaptures
    ]=useState([]);
    
    useEffect(()=>{

        const load=()=>{
        
        setCaptures(
        
        JSON.parse(
        
        localStorage.getItem(
        "captures"
        )
        
        ||
        
        "[]"
        
        )
        
        );
        
        };
        
        load();
        
        window.addEventListener(
        "gallery-updated",
        load
        );
        
        return()=>{
        
        window.removeEventListener(
        "gallery-updated",
        load
        );
        
        };
        
    },[]);
    
    const remove=(id)=>{
    
    const updated=
    
    captures.filter(
    x=>
    x.id!==id
    );
    
    setCaptures(
    updated
    );
    
    localStorage.setItem(
    "captures",
    
    JSON.stringify(
    updated
    )
    
    );
    
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
    item.image
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
    🕒 {item.timestamp}
    </p>
    
    <p
    style={{
    color:"white"
    }}
    >
    🎯 {item.confidence}%
    </p>
    
    <div
    style={{
    display:"flex",
    gap:10,
    }}
    >
    
    <a
    href={
    item.image
    }
    download={`alert-${item.id}.png`}
    >
    
    <button>
    Save
    </button>
    
    </a>
    
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