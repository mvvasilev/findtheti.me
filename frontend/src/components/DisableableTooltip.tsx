import { useState, useEffect } from 'react'

import { Tooltip, TooltipProps } from '@mui/material'

const DisableableTooltip = ({
  disabled,
  children,
  ...tooltipProps
}: TooltipProps & { disabled: boolean }) => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  return (
    <Tooltip
      {...tooltipProps}
      open={open}
      onOpen={() => !disabled && setOpen(true)}
      onClose={() => setOpen(false)}
    >
      {children}
    </Tooltip>
  )
}

export default DisableableTooltip;