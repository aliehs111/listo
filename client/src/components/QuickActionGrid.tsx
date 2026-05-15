interface Props {
  actions: string[]
  onAction: (action: string) => void
}

export default function QuickActionGrid({ actions, onAction }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {actions.map(action => (
        <button
          key={action}
          onClick={() => onAction(action)}
          className="py-3 px-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:border-gray-400 transition-colors text-center leading-tight"
        >
          {action}
        </button>
      ))}
    </div>
  )
}
