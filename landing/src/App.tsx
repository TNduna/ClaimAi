import { Route, Switch } from "wouter"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { AnnouncementBar } from "@/components/layout/AnnouncementBar"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import Home from "@/pages/Home"
import Marketing from "@/pages/Marketing"
import Sales from "@/pages/Sales"
import Finance from "@/pages/Finance"
import Product from "@/pages/Product"
import Personal from "@/pages/Personal"
import Healthcare from "@/pages/Healthcare"
import Pricing from "@/pages/Pricing"
import Trust from "@/pages/Trust"
import DataProcessing from "@/pages/Dataprocessing"
import Terms from "@/pages/terms"
import NotFound from "@/pages/NotFound"
import VsOpenclaw from "@/pages/compare/vsOpenclaw"
import VsChatgpt from "@/pages/compare/vsChatgpt"
import VsTrixta from "@/pages/compare/vsTrixta"
import VsNyla from "@/pages/compare/vsNyla"
import Features from "@/pages/feature"


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/solutions/marketing" component={Marketing} />
      <Route path="/solutions/sales" component={Sales} />
      <Route path="/solutions/finance" component={Finance} />
      <Route path="/solutions/product" component={Product} />
      <Route path="/solutions/personal" component={Personal} />
      <Route path="/solutions/healthcare" component={Healthcare} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/features" component={Features} />
      <Route path="/pages/feature" component={Features} />
      <Route path="/trust" component={Trust} />
      <Route path="/data-processing" component={DataProcessing} />
      <Route path="/terms" component={Terms} />
      <Route path="/compare/vsChatgpt" component={VsChatgpt} />
      <Route path="/compare/vsOpenclaw" component={VsOpenclaw} />
      <Route path="/compare/vsTrixta" component={VsTrixta} />
      <Route path="/compare/vsNyla" component={VsNyla} />
      <Route component={NotFound} />
    </Switch>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen flex flex-col">
        <AnnouncementBar />
        <Navigation />
        <main className="flex-1">
          <Router />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}
