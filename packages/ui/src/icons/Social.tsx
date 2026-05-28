import type { ReactElement } from "react"

interface Icon{
    icon?:ReactElement
}
export default function Social(props:Icon){
    return(
        <div className="h-10 w-10 bg-gray-800 border rounded-lg border-gray-700 flex justify-center items-center">
            {props.icon}
        </div>
    )
}