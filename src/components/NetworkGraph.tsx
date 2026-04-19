import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force'
import { useEffect, useMemo, useState } from 'react'
import type { NetworkEdge, NetworkNode } from '../types'

type NetworkGraphProps = {
  edges: NetworkEdge[]
  nodes: NetworkNode[]
  onSelectNode?: (nodeId: string) => void
  selectedNodeId?: string | null
}

type SimNode = NetworkNode & { fx?: number | null; fy?: number | null }
type SimEdge = NetworkEdge & { source: SimNode | string; target: SimNode | string }

export function NetworkGraph({ edges, nodes, onSelectNode, selectedNodeId }: NetworkGraphProps) {
  const [positions, setPositions] = useState<NetworkNode[]>(nodes)

  useEffect(() => {
    if (nodes.length === 0) {
      setPositions([])
      return
    }

    const simNodes: SimNode[] = nodes.map((node) => ({ ...node }))
    const simEdges: SimEdge[] = edges.map((edge) => ({ ...edge }))

    const simulation = forceSimulation(simNodes)
      .force('link', forceLink(simEdges).id((node) => (node as SimNode).id).distance(18).strength(0.7))
      .force('charge', forceManyBody().strength(-120))
      .force('collide', forceCollide<SimNode>().radius((node) => 4 + node.value / 55))
      .force('center', forceCenter(50, 50))
      .alpha(1)
      .alphaDecay(0.05)
      .on('tick', () => {
        setPositions(
          simNodes.map((node) => ({
            id: node.id,
            value: node.value,
            x: Math.max(8, Math.min(92, node.x ?? 50)),
            y: Math.max(10, Math.min(90, node.y ?? 50)),
          })),
        )
      })

    return () => {
      simulation.stop()
    }
  }, [edges, nodes])

  const nodeMap = useMemo(() => new Map(positions.map((node) => [node.id, node])), [positions])
  const maxNodeValue = Math.max(...positions.map((node) => node.value), 1)
  const maxEdgeValue = Math.max(...edges.map((edge) => edge.value), 1)

  function isConnected(nodeId: string) {
    if (!selectedNodeId) {
      return true
    }

    if (selectedNodeId === nodeId) {
      return true
    }

    return edges.some(
      (edge) =>
        (edge.source === selectedNodeId && edge.target === nodeId) ||
        (edge.target === selectedNodeId && edge.source === nodeId),
    )
  }

  return (
    <div className="network-wrap">
      <svg className="network-svg" viewBox="0 0 100 100">
        {edges.map((edge) => {
          const source = nodeMap.get(edge.source)
          const target = nodeMap.get(edge.target)

          if (!source || !target) {
            return null
          }

          return (
            <line
              key={`${edge.source}-${edge.target}`}
              stroke={`rgba(168, 85, 247, ${selectedNodeId && edge.source !== selectedNodeId && edge.target !== selectedNodeId ? 0.08 : 0.18 + edge.value / (maxEdgeValue * 1.8)})`}
              strokeWidth={0.5 + (edge.value / maxEdgeValue) * 1.8}
              x1={source.x}
              x2={target.x}
              y1={source.y}
              y2={target.y}
            />
          )
        })}

        {positions.map((node) => {
          const radius = 2.8 + (node.value / maxNodeValue) * 4.6
          const active = selectedNodeId === null || selectedNodeId === node.id
          const connected = isConnected(node.id)

          return (
            <g className="network-node" key={node.id} onClick={() => onSelectNode?.(node.id)}>
              <circle cx={node.x} cy={node.y} fill={active ? 'rgba(236, 72, 153, 0.34)' : 'rgba(236, 72, 153, 0.1)'} r={radius + 1.6} />
              <circle cx={node.x} cy={node.y} fill={active ? '#ec4899' : '#8b5cf6'} opacity={connected ? 1 : 0.35} r={radius} />
              <text className="network-label" textAnchor="middle" x={node.x} y={node.y + radius + 3.8}>
                {node.id}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
