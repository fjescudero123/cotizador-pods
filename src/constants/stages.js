import { Home, Box, PanelBottom, Zap, Droplets, PaintBucket, Layers, ShowerHead, LayoutGrid, DoorOpen, Wrench, Package } from 'lucide-react';

export const STAGES = [
  {id:'base',label:'1. Base',cat:'BASE',icon:Home},
  {id:'estructura',label:'2. Estructura',cat:'ESTRUCTURA',icon:Box},
  {id:'techo',label:'3. Techo',cat:'TECHO',icon:PanelBottom},
  {id:'electrico',label:'4. Eléctrico',cat:'ELECTRICO',icon:Zap},
  {id:'sanitario_ap',label:'5. Sanitario AP',cat:'SANITARIO AGUA POTABLE',icon:Droplets},
  {id:'sanitario_al',label:'6. Sanitario ALC',cat:'SANITARIO ALCANTARILLADO',icon:Droplets},
  {id:'revestimiento_muro',label:'7. Rev. Muro',cat:'REVESTIMIENTO DE MURO',icon:PaintBucket},
  {id:'cielo',label:'8. Cielo',cat:'CIELO',icon:Layers},
  {id:'sanitarios_artefactos',label:'9. Artefactos',cat:'SANITARIO ARTEFACTOS',icon:ShowerHead},
  {id:'terminacion_muro',label:'10. Term. Muro',cat:'TERMINACION DE MURO',icon:PaintBucket},
  {id:'piso',label:'12. Piso',cat:'PISO',icon:LayoutGrid},
  {id:'puertas',label:'13. Puertas',cat:'PUERTAS',icon:DoorOpen},
  {id:'accesorios',label:'14. Accesorios',cat:'ACCESORIOS',icon:Wrench},
  {id:'insumos',label:'15. Insumos',cat:'INSUMOS GENERALES',icon:Package}
];
