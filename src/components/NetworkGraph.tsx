import { useMemo } from 'react'
import type { NetworkEdge, NetworkNode } from '../types'

type NetworkGraphProps = {
  edges: NetworkEdge[]
  nodes: NetworkNode[]
  onSelectNode?: (nodeId: string) => void
  selectedNodeId?: string | null
}

type PositionedNode = NetworkNode & {
  connected: boolean
  emphasis: 'center' | 'neighbor' | 'other'
}

export function NetworkGraph({ edges, nodes, onSelectNode, selectedNodeId }: NetworkGraphProps) {
  const selectedId = selectedNodeId ?? nodes[0]?.id ?? null

  const { positionedNodes, visibleEdges } = useMemo(() => {
    if (!selectedId || nodes.length === 0) {
      return { positionedNodes: [], visibleEdges: [] }
    }

    const nodeMap = new Map(nodes.map((node) => [node.id, node]))
    const connectedEdges = edges
      .filter((edge) => edge.source === selectedId || edge.target === selectedId)
      .sort((left, right) => right.value - left.value)

    const neighbors = connectedEdges
      .slice(0, 8)
      .map((edge) => nodeMap.get(edge.source === selectedId ? edge.target : edge.source))
      .filter((node): node is NetworkNode => Boolean(node))

    const neighborIds = new Set(neighbors.map((node) => node.id))
    const otherNodes = nodes.filter((node) => node.id !== selectedId && !neighborIds.has(node.id)).slice(0, 3)

    const centerNode = nodeMap.get(selectedId)
    const positioned: PositionedNode[] = []

    if (centerNode) {
      positioned.push({ ...centerNode, connected: true, emphasis: 'center', x: 50, y: 46 })
    }

    neighbors.forEach((node, index) => {
      const angle = -Math.PI / 2 + (index / Math.max(neighbors.length, 1)) * Math.PI * 2
      const radius = neighbors.length <= 4 ? 28 : 32

      positioned.push({
        ...node,
        connected: true,
        emphasis: 'neighbor',
        x: 50 + Math.cos(angle) * radius,
        y: 46 + Math.sin(angle) * radius,
      })
    })

    otherNodes.forEach((node, index) => {
      positioned.push({
        ...node,
        connected: false,
        emphasis: 'other',
        x: 18 + index * 32,
        y: 88,
      })
    })

    return {
      positionedNodes: positioned,
      visibleEdges: connectedEdges.slice(0, 8),
    }
  }, [edges, nodes, selectedId])

  const nodeMap = useMemo(() => new Map(positionedNodes.map((node) => [node.id, node])), [positionedNodes])
  const maxNodeValue = Math.max(...positionedNodes.map((node) => node.value), 1)
  const maxEdgeValue = Math.max(...visibleEdges.map((edge) => edge.value), 1)

  return (
    <div className="network-wrap">
      <svg className="network-svg" viewBox="0 0 100 100">
        {visibleEdges.map((edge) => {
          const source = nodeMap.get(edge.source)
          const target = nodeMap.get(edge.target)

          if (!source || !target) {
            return null
          }

          return (
            <line
              key={`${edge.source}-${edge.target}`}
              stroke={`rgba(168, 85, 247, ${0.22 + edge.value / (maxEdgeValue * 1.6)})`}
              strokeLinecap="round"
              strokeWidth={0.8 + (edge.value / maxEdgeValue) * 2.2}
              x1={source.x}
              x2={target.x}
              y1={source.y}
              y2={target.y}
            />
          )
        })}

        {positionedNodes.map((node) => {
          const radius =
            node.emphasis === 'center'
              ? 5.2 + (node.value / maxNodeValue) * 3.2
              : node.emphasis === 'neighbor'
                ? 3.8 + (node.value / maxNodeValue) * 3.2
                : 3.2

          const glowFill = node.emphasis === 'center' ? 'rgba(236, 72, 153, 0.34)' : 'rgba(139, 92, 246, 0.18)'
          const fill = node.emphasis === 'center' ? '#ec4899' : node.connected ? '#8b5cf6' : 'rgba(148, 163, 184, 0.75)'

          return (
            <g className="network-node" key={node.id} onClick={() => onSelectNode?.(node.id)}>
              <circle cx={node.x} cy={node.y} fill={glowFill} r={radius + 1.8} />
              <circle cx={node.x} cy={node.y} fill={fill} r={radius} />
              <text className={`network-label${node.connected ? '' : ' is-muted'}`} textAnchor="middle" x={node.x} y={node.y + radius + 4.2}>
                {node.id}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
