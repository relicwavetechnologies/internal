"use client"

import ReactFlow, {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Node,
  Edge
} from 'reactflow'
import 'reactflow/dist/style.css'
import { PhaseNode } from './phase-node'
import { useState } from 'react'
import { ClientTaskModal } from './client-task-modal'

interface ClientPipelineViewProps {
  projectId: string
  phases: any[]
}

export function ClientPipelineView({ projectId, phases }: ClientPipelineViewProps) {
  const [selectedTask, setSelectedTask] = useState<any>(null)

  const nodes: Node[] = phases.map((phase, index) => ({
    id: phase.id,
    type: 'phase',
    position: { x: index * 380, y: 150 },
    data: {
      phase,
      onClick: () => {} // No action on phase click for clients
    }
  }))

  const edges: Edge[] = phases.slice(0, -1).map((phase, index) => ({
    id: `${phase.id}-${phases[index + 1].id}`,
    source: phase.id,
    target: phases[index + 1].id,
    animated: true,
    type: 'smoothstep',
  }))

  const nodeTypes = {
    phase: PhaseNode
  }

  return (
    <>
      <div className="h-[600px] w-full border rounded-lg bg-muted/20 relative isolate">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>

      <ClientTaskModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </>
  )
}
