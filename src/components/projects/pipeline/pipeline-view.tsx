"use client"

import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  ConnectionLineType,
  BackgroundVariant
} from 'reactflow'
import 'reactflow/dist/style.css'
import { PhaseNode } from './phase-node'
import { useState } from 'react'
import { PipelinePhaseDrawer } from './pipeline-phase-drawer'

interface PipelineViewProps {
  projectId: string
  phases: any[]
  employees: any[]
}

export function PipelineView({ projectId, phases, employees }: PipelineViewProps) {
  const [selectedPhase, setSelectedPhase] = useState<any>(null)

  const nodes: Node[] = phases.map((phase, index) => ({
    id: phase.id,
    type: 'phase',
    position: { x: index * 380, y: 150 },
    data: {
      phase,
      onClick: () => setSelectedPhase(phase)
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
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
        </ReactFlow>
      </div>

      <PipelinePhaseDrawer
        phase={selectedPhase}
        isOpen={!!selectedPhase}
        onClose={() => setSelectedPhase(null)}
        projectId={projectId}
        employees={employees}
      />
    </>
  )
}
