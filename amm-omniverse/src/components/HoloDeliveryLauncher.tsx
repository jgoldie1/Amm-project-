import { useState } from 'react';
import HoloDeliveryCenter from './HoloDeliveryCenter';
import { installStreetVerseShoppingDeliveryMissionRuntime } from '../runtime/StreetVerseShoppingDeliveryMissionRuntime';

installStreetVerseShoppingDeliveryMissionRuntime();

export default function HoloDeliveryLauncher() {
  const [open, setOpen] = useState(false);
  return <>
    <button
      type="button"
      aria-label="Open Holo Delivery"
      onClick={() => setOpen(true)}
      style={{position:'fixed',right:12,bottom:124,zIndex:9001,border:'1px solid #4fe3ff77',background:'linear-gradient(135deg,#073c4e,#182236)',color:'#fff',borderRadius:999,padding:'10px 14px',fontWeight:950,cursor:'pointer',boxShadow:'0 8px 30px #0008'}}
    >
      ✦ HOLO DELIVERY
    </button>
    {open && <HoloDeliveryCenter onClose={() => setOpen(false)} />}
  </>;
}
