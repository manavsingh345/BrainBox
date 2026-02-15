import { useState } from "react";
import { Brain } from "lucide-react";
import "./chat.css"
import { BACKEND_URL } from "../config";
type ChatMessage = {
    sender?:"user" | "bot",
    text?:string,
    
};
interface ChatBotProps{
    onClose?:()=>void
}

export default function ChatBot({onClose}: ChatBotProps){
    const [message,setMessage]=useState("");
    const [chats,setChats]=useState<ChatMessage[]>([]);

    const getReply=async ()=>{
        if (!message) return;
        setChats((prev) => [...prev, { sender: "user", text: message }]);

        const payload={message};
        const options = {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify(payload),
        };
        try{
            const response=await fetch(`${BACKEND_URL}/api/v1/chat`,options);
            const data=await response.json();
            if (!response.ok) {
                setChats((prev)=>[...prev,{sender:"bot",text:"Unable to fetch reply right now."}]);
                return;
            }
            setChats((prev)=>[...prev,{sender:"bot",text:data.reply || "No response generated."}]);
        }catch(e){
            setChats((prev)=>[...prev,{sender:"bot",text:"Network error. Please try again."}]);
        }
        setMessage(""); 
    }
    return(
       <div className="chat h-full w-full bg-white shadow-xl rounded-2xl">
        <div className="flex flex-col rounded-2xl bg-gray-300">
            <div className="flex items-center border-b pb-2 justify-between drag-header cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-2 m-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500">
                    <Brain className="w-4 h-4 text-white" />
                </span>
                <p className="text-lg font-serif font-thin">Second Brain</p>
                </div>
                <span className="text-black cursor-pointer m-3"  onClick={onClose}><i className="fa-solid fa-xmark"></i></span>
            </div>
           
            <div className="messagesDiv flex-1 overflow-y-auto p-4 flex flex-col">
                {
                    chats.map((chat,idx)=>(
                        <p  key={idx} className={`p-2 rounded-lg max-w-[80%] ${chat.sender === "user" ? "bg-blue-400 self-end" : "bg-gray-200 self-start" }`}>{chat.text}</p>
                    ))
                } 
        </div>
            <input type="text" value={message} onChange={(e)=>setMessage(e.target.value)} onKeyDown={(e)=> e.key ==='Enter'? getReply():""} 
            placeholder="Enter your message" className=" bottom-0 w-sm bg-gray-200 text-black p-2 m-2 rounded-2xl mb-4 outline-none" />
            <span className="absolute bottom-0 right-0 text-black pb-6 pr-6 cursor-pointer" onClick={getReply}><i className="fa-solid fa-paper-plane"></i></span>
        </div>
      </div>
    )
}
