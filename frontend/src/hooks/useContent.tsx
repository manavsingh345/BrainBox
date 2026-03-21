import axios from "axios";
import { useAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";
import { getAuthorizationHeader } from "../lib/clerk";

export function useContent(){
    const [contents,setContents]=useState([]);
    const { getToken, isSignedIn } = useAuth();
    useEffect(()=>{
      if (!isSignedIn) {
        setContents([]);
        return;
      }

      let cancelled = false;

      const fetchContents = async () => {
        try {
          const authorization = await getAuthorizationHeader(getToken);
          const response = await axios.get(`${BACKEND_URL}/api/v1/content`,{
            headers:{
              Authorization: authorization
            }
          });

          if (!cancelled) {
            setContents(response.data.content);
          }
        } catch (error) {
          if (!cancelled) {
            console.error("Failed to fetch content", error);
          }
        }
      };

      void fetchContents();
      const interval = setInterval(() => {
        void fetchContents();
      }, 5 * 1000);

      return () => {
        cancelled = true;
        clearInterval(interval);
      }
    },[getToken, isSignedIn])
    return contents;
}
