import { MO_COST_POD } from './economics.js';

export const defGeom = {
  mode:'rect', length:2.20, width:1.60, height:2.40,
  doorWidth:0.75, doorHeight:2.00, doorCount:1,
  polygonSides:[{id:1,dir:'R',len:2.20},{id:2,dir:'D',len:1.60},{id:3,dir:'L',len:2.20},{id:4,dir:'U',len:1.60}]
};
export const defConf = {
  cieloYC:'CRI1916', cieloLayers:1,
  termWallCfg:'[{"type": "pintura", "paint": "POD_142", "coats": 2}, {"type": "ceramica"}, {"type": "pintura", "paint": "POD_143", "coats": 2}, {"type": "pintura", "paint": "POD_142", "coats": 2}]',
  termFaldon:'ceramica',
  pisoType:'ceramica',pisoMat:'POD_138',
  revFibro:'POD_085',
  revWallCfg:'[{"int": {"mat": "CRI1916", "layers": 1}, "ext": {"mat": "POD_081", "layers": 1}}, {"int": {"mat": "CRI1916_81", "layers": 2}, "ext": {"mat": "CRI1916_81", "layers": 1}}, {"int": {"mat": "CRI1916", "layers": 1}, "ext": {"mat": "POD_081", "layers": 1}}, {"int": {"mat": "POD_081", "layers": 1}, "ext": {"mat": "CRI010", "layers": 1}}]',
  artTina:'POD_121', artWCTanque:'POD_130', artWCTaza:'POD_131', artWCAsiento:'POD_132',
  artLavamanos:'POD_126', artPedestal:'POD_127', artGrifLav:'POD_135', artGrifTina:'POD_136', artExtractor:'POD_137', artMampara:'',
  elecIluminacion:'',
  accPercha:'', accPortarollo:'', accToallero:'',
  puertaMat:'POD_144', cerraduraMat:'POD_145', puertaQty:1,
  laborCostPerPod:MO_COST_POD,
};
export const defTyp = {id:`typ-${Date.now()}`,name:'Baño Tipo 1',count:1,geometry:defGeom,config:defConf};
