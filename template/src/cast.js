// The Odd Town recurring cast: always these looks, so viewers recognise them across stories.
// Use: import { CAST } from './cast.js'; const mia = B.person(CAST.mia);
export const CAST = {
  mia: { shirt: '#3E6B4E', pants: '#2B3550', hair: '#5A3A22', long: true, kid: true, scarf: '#C8443F' },          // narrator, 12
  sam: { shirt: '#F2A93B', pants: '#384060', hair: '#2A1C14', kid: true, hat: 'beanie', hatCol: '#3C6FB6' },      // little brother, 6 (scale group 0.84)
  leo: { shirt: '#3C6FB6', pants: '#384060', hair: '#2A1C14', kid: true, hat: 'beanie', hatCol: '#C8443F', scarf: '#F2A93B' }, // best friend
  dad: { shirt: '#4A6380', pants: '#2E2E3A', hair: '#3A2A20', zip: '#2E3A4A' },
  mom: { shirt: '#5E8A7A', pants: '#3A3550', hair: '#8A5A3A', long: true },
  gran: { shirt: '#C77DBA', pants: '#3A3550', hair: '#D8D8DC', long: true },
  pell: { shirt: '#6E5A48', pants: '#2B2B35', hair: '#9A9AA0', glasses: true },   // Mr. Pell, curtains always shut
  okafor: { shirt: '#7A4A3A', pants: '#2B2B35', hair: '#1A1410', skin: '#8A5A3C' },
  kidA: { shirt: '#C8443F', pants: '#384060', hair: '#6A4A2A', kid: true, hat: 'cap', hatCol: '#E8B830' },
  kidB: { shirt: '#C77DBA', pants: '#3A3550', hair: '#8A5A3A', kid: true, long: true },
  man: { shirt: '#4A5E80', pants: '#2E2E3A', hair: '#3A2A20', hat: 'beanie', hatCol: '#7A3A3A' },
  // a ghost/pale version of anyone: { ...CAST.mia, shirt: '#A9AFB8', pants: '#7C828C', hair: '#9DA2AA', skin: '#DCE0E6', scarf: '#C6CAD0' }
};
