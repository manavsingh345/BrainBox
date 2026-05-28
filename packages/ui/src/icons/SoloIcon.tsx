interface Size{
    height?:string,
    width?:string,
    color?:string,
}
export default function SoloIcon({ width = "24", height = "24",color }: Size){
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-pen-tool ${color || "text-indigo-400"}`} aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
    )
}
