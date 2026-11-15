import { Dialog } from '@ds/composites/Dialog'
import { Button } from '@ds/primitives/actions/Button'
import { useConfirm } from '@/store/confirm'

/** Renders the pending askConfirm() request, if any. Mounted once near the app root. */
const ConfirmHost = () => {
  const request = useConfirm((s) => s.request)
  const settle = useConfirm((s) => s.settle)
  if (!request) return null
  const { title, message, confirmLabel = 'OK', cancelLabel = 'Cancel', tone = 'primary' } = request

  return (
    <Dialog
      open
      title={title}
      onClose={() => settle(false)}
      actions={
        <>
          <Button variant="ghost" onClick={() => settle(false)} data-autofocus>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={() => settle(true)}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message}
    </Dialog>
  )
}

export { ConfirmHost }
