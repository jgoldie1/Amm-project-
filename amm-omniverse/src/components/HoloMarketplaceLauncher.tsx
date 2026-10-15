import { useEffect, useState } from 'react';
import HoloMarketplaceCenter from './HoloMarketplaceCenter';

export default function HoloMarketplaceLauncher() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = () => setOpen(true);
    (window as any).__showHoloMarketplace = show;
    window.addEventListener('tryamm:holo-marketplace-open', show);
    return () => {
      window.removeEventListener('tryamm:holo-marketplace-open', show);
      if ((window as any).__showHoloMarketplace === show) delete (window as any).__showHoloMarketplace;
    };
  }, []);
  return <>
    <button type="button" onClick={()=>setOpen(true)} aria-label="Open Holo Marketplace" style={{position:'fixed',left:12,bottom:118,zIndex:20019,border:'1px solid #4fe3ff77',borderRadius:999,padding:'10px 14px',background:'linear-gradient(135deg,#0a2836,#15112a)',color:'#fff',fontWeight:900,fontSize:10,boxShadow:'0 8px 28px #0008'}}>◈ MARKET</button>
    {open && <HoloMarketplaceCenter onClose={()=>setOpen(false)} />}
  </>;
}
