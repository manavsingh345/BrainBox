
import { Rnd } from "react-rnd";
import ChatBot from "./ChatBot";


interface DraggableChatBotProps {
  onClose: () => void;
}

export default function DraggableChatBot({onClose}:DraggableChatBotProps ) {
  const BOT_WIDTH = 360;
  const BOT_HEIGHT = 520;
  const GAP = 16;

  return (
    
    <Rnd
  default={{
    x: Math.max(GAP, window.innerWidth - BOT_WIDTH - GAP),
    y: Math.max(GAP, window.innerHeight - BOT_HEIGHT - GAP),
    width: BOT_WIDTH,
    height: BOT_HEIGHT,
  }}
  size={{ width: BOT_WIDTH, height: BOT_HEIGHT }}
  enableResizing={false}
  bounds="window"
  dragHandleClassName="drag-header"
  style={{ position: "fixed", zIndex: 60 }}
>
  <ChatBot onClose={onClose} />
</Rnd>

  );
}
