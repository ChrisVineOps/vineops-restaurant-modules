import logoUrl from './assets/vineops-logo.png'

export default function Logo({ height = 26 }) {
  return <img src={logoUrl} alt="VineOps" style={{ height, display: 'block' }} />
}
