import { Routes, Route } from 'react-router-dom'
import Launcher from './Launcher'
import BeverageCostMonitor from './apps/BeverageCostMonitor'
import WineListPerformance from './apps/WineListPerformance'
import BTGProfitability from './apps/BTGProfitability'
import VendorScorecard from './apps/VendorScorecard'
import CellarDashboard from './apps/CellarDashboard'
import StaffTrainingHub from './apps/StaffTrainingHub'
import PurchaseOrderBuilder from './apps/PurchaseOrderBuilder'
import PairingAssistant from './apps/PairingAssistant'
import CompVarianceTracker from './apps/CompVarianceTracker'
import EventPlanner from './apps/EventPlanner'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Launcher />} />
      <Route path="/app/01-beverage-cost-monitor" element={<BeverageCostMonitor />} />
      <Route path="/app/02-wine-list-performance" element={<WineListPerformance />} />
      <Route path="/app/03-btg-profitability" element={<BTGProfitability />} />
      <Route path="/app/04-vendor-scorecard" element={<VendorScorecard />} />
      <Route path="/app/05-cellar-dashboard" element={<CellarDashboard />} />
      <Route path="/app/06-staff-training-hub" element={<StaffTrainingHub />} />
      <Route path="/app/07-purchase-order-builder" element={<PurchaseOrderBuilder />} />
      <Route path="/app/08-pairing-assistant" element={<PairingAssistant />} />
      <Route path="/app/09-comp-variance-tracker" element={<CompVarianceTracker />} />
      <Route path="/app/10-event-planner" element={<EventPlanner />} />
    </Routes>
  )
}
