import type { ReactElement } from "react"

interface Property{
    text:string,
    icon?:ReactElement,
    width?:string,
    height?:string,
    cursor?:string,
    onClick?:()=>void,
    color?:string,
}
export default function LogoCard({icon,text,onClick,color,cursor,height,width}:Property){
    return (
        <div onClick={onClick} className={`${color || "bg-[#101428]"} m-2 relative z-10  flex justify-center items-center border border-gray-800 rounded-xl hover:-translate-y-1 transition duration-500 ease-in-out ${cursor || ""}`} style={{height:height || "50px",width:width || "300px"}}>
          <span className="pr-2">{icon}</span>  
          <span className="text-white">{text}</span>
        </div>
    )
}