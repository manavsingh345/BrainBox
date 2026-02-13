import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";

export function useContent(){
    const [contents,setContents]=useState([]);
    useEffect(()=>{
      

  let interval =  setInterval(()=>{
        axios.get(`${BACKEND_URL}/api/v1/content`,{
        headers:{
            "Authorization":localStorage.getItem("token")
        }
       }).then((response)=>{
        setContents(response.data.content)
       })
       },5*1000)
       return () => {
         clearInterval(interval);
       }
    },[])
    return contents;
}
