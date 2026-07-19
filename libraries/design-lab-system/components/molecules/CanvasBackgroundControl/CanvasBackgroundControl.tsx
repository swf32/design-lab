import { useEffect, useState } from 'react'
import { useDesignLabI18n } from '../../../i18n'
import { TabSwitcher } from '../TabSwitcher/TabSwitcher'

export type CanvasMode = 'dark-grid' | 'light-grid' | 'solid'
export type CanvasBackgroundControlProps = { mode:CanvasMode; color:string; onModeChange:(mode:CanvasMode)=>void; onColorChange:(color:string)=>void }

const presets = ['#111111', '#f2f1ed', '#264653', '#6d3be8', '#d96c52', '#2a9d8f']
const validHex = /^#[0-9a-f]{6}$/i

export function CanvasBackgroundControl({ mode, color, onModeChange, onColorChange }: CanvasBackgroundControlProps) {
  const {t}=useDesignLabI18n()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [draft, setDraft] = useState(color)
  useEffect(() => setDraft(color), [color])

  const chooseMode = (next: CanvasMode) => {
    onModeChange(next)
    setPickerOpen(next === 'solid')
  }
  const commit = (next: string) => {
    setDraft(next)
    if (validHex.test(next)) onColorChange(next)
  }

  return <div className="dl-canvas-control-wrap">
    <TabSwitcher ariaLabel="Canvas background" variant="segmented" size="small" className="dl-canvas-control" value={mode} onChange={chooseMode} options={[
      {value:'dark-grid',label:<span className="dl-canvas-control__sample dl-canvas-control__sample--dark"/>,accessibleLabel:t('canvas.dark')},
      {value:'light-grid',label:<span className="dl-canvas-control__sample dl-canvas-control__sample--light"/>,accessibleLabel:t('canvas.light')},
      {value:'solid',label:<span className="dl-canvas-control__sample" style={{background:color}}/>,accessibleLabel:t('canvas.solid')},
    ]}/>
    {mode==='solid' && pickerOpen && <div className="dl-canvas-color-popover" role="dialog" aria-label={t('canvas.dialog')}>
      <div className="dl-canvas-color-popover__preview" style={{background:validHex.test(draft)?draft:color}}/>
      <label><span>{t('canvas.hex')}</span><input value={draft} maxLength={7} spellCheck={false} onChange={(event)=>commit(event.target.value)} /></label>
      <div className="dl-canvas-color-popover__presets">{presets.map((preset)=><button key={preset} type="button" aria-label={preset} className={preset.toLowerCase()===color.toLowerCase()?'is-active':''} style={{background:preset}} onClick={()=>commit(preset)}/>)}</div>
    </div>}
  </div>
}
