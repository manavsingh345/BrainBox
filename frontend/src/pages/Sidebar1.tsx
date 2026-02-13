import "./Sidebar1.css"
import { useContext, useEffect } from "react"
import { MyContext } from "./Context"
import {v1 as uuidv1} from "uuid";
import { Brain } from "lucide-react";
import { BACKEND_URL } from "../config";

interface Thread {
  threadId: string;
  title: string;
  pdfId?: string[];
  hasPDF?: boolean;
}
export default function Sidebar1(){

    const {allThreads,setAllThreads,currThreadId,setPrompt,setnewChat,setReply,setcurrThreadId,setprevChats} = useContext(MyContext);

    const getAllThreads = async () => {
        try{
            const token=localStorage.getItem("token") ?? "";
            const response=await fetch(`${BACKEND_URL}/api/v1/thread`,{
                headers:{
                    "Authorization": token
                }
            });
            if (!response.ok) {
              throw new Error("Failed to fetch threads");
            }
            const res=await response.json();
            const filterData = res.map((thread:Thread) => ({
              threadId: thread.threadId,
              title: thread.title,
              hasPDF: Array.isArray(thread.pdfId) && thread.pdfId.length > 0
            }));
            setAllThreads(filterData);
        }catch(e){
            console.error(e);
        }
    }
    useEffect(()=>{
        getAllThreads();
    },[currThreadId]);

    const NewChat =() => {
        setnewChat(true);
        setPrompt("");
        setReply("");
        setcurrThreadId(uuidv1());
        setprevChats([]);
    }

    const changeThread= async (newthreadId:string)=>{
        setcurrThreadId(newthreadId);
        try{
            const token=localStorage.getItem("token") ?? "";
            const response=await fetch(`${BACKEND_URL}/api/v1/thread/${newthreadId}`,{
                headers:{
                    "Authorization": token
                }
            });
            if (!response.ok) {
              throw new Error("Failed to fetch thread");
            }
            const res=await response.json();
            setprevChats(res);
            setnewChat(false);
            setReply("");
        }catch(e){
            console.error(e);
        }
    }
    const deleteThread= async(threadId:string)=>{
        try{
            const token=localStorage.getItem("token") ?? "";
            const response = await fetch(`${BACKEND_URL}/api/v1/thread/${threadId}`,{headers:{
                "Authorization": token
            },method:"DELETE"});
            if (!response.ok) {
              throw new Error("Failed to delete thread");
            }
            setAllThreads(prev => prev.filter(thread=>thread.threadId !== threadId));
            if(threadId === currThreadId){
                NewChat();
            }
        }catch(e){  
            console.error(e);
        }
    }
    
    return(

        <section className="Sidebar flex flex-col justify-between h-full relative">
            <div className="absolute left-0 top-[20px] bottom-[20px] w-[4px] bg-gray-100"></div>
            <button className="flex justify-between items-center cursor-pointer p-6 px-10" onClick={NewChat}>
                <div className="p-1.5 rounded-lg bg-primary">
                    <Brain className="w-5 h-5 text-primary-foreground" />
                </div>
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>
            
            <ul className="history">
                {
                    allThreads?.map((thread:Thread) =>(
                        <li key={thread.threadId} onClick={() => changeThread(thread.threadId)}>{thread.title}  {thread.hasPDF && <i className="fa-solid fa-file-pdf text-red-500 ml-2"></i>} <i className="fa-solid fa-trash"
                        onClick={(e)=>{
                            e.stopPropagation(); //stop event bubbling
                            deleteThread(thread.threadId);
                        }}></i></li>
                    ))
                }
            </ul>
        </section>
       
        
    )
};
