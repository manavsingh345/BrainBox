import { motion } from "framer-motion";

const nodes = [
  { id: 1, x: 50, y: 40, size: 8 },
  { id: 2, x: 30, y: 60, size: 6 },
  { id: 3, x: 70, y: 55, size: 7 },
  { id: 4, x: 45, y: 75, size: 5 },
  { id: 5, x: 60, y: 30, size: 6 },
  { id: 6, x: 25, y: 35, size: 5 },
  { id: 7, x: 75, y: 70, size: 6 },
  { id: 8, x: 40, y: 25, size: 5 },
  { id: 9, x: 55, y: 65, size: 7 },
  { id: 10, x: 35, y: 50, size: 6 },
];

const connections = [
  [1, 2], [1, 3], [1, 5], [2, 4], [2, 6], [3, 7], [3, 9],
  [4, 9], [5, 8], [6, 10], [7, 9], [8, 5], [10, 4], [2, 10],
  [1, 9], [3, 5], [4, 7],
];

export const NeuralNetwork = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="w-full h-full opacity-30"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Connections */}
        {connections.map(([from, to], i) => {
          const fromNode = nodes.find(n => n.id === from);
          const toNode = nodes.find(n => n.id === to);
          if (!fromNode || !toNode) return null;
          
          return (
            <motion.line
              key={`line-${i}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="hsl(var(--primary))"
              strokeWidth="0.12"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ 
                duration: 2, 
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          );
        })}
        
        {/* Nodes */}
        {nodes.map((node, i) => (
          <motion.circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={node.size / 10}
            fill="hsl(var(--primary))"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.5 + i * 0.1,
              ease: "backOut"
            }}
          >
            <animate
              attributeName="opacity"
              values="0.3;0.6;0.3"
              dur={`${3 + i * 0.5}s`}
              repeatCount="indefinite"
            />
          </motion.circle>
        ))}
      </svg>
    </div>
  );
};
