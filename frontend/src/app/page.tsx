import HeroSection from '@/components/home/HeroSection'
import FeaturedListings from '@/components/home/FeaturedListings'
import TrendingAuctions from '@/components/home/TrendingAuctions'
import CategoriesGrid from '@/components/home/CategoriesGrid'
import TopSellers from '@/components/home/TopSellers'
import MarketInsightsSection from '@/components/home/MarketInsightsSection'
import TrustBanner from '@/components/home/TrustBanner'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBanner />
      <FeaturedListings />
      <TrendingAuctions />
      <CategoriesGrid />
      <TopSellers />
      <MarketInsightsSection />
    </>
  )
}
