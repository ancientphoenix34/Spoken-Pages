import { PricingTable } from '@clerk/nextjs'

const Page = () => {
  return (
    <div className="clerk-subscriptions">
      <h1 className="page-title">Choose Your Plan</h1>
      <p className="page-description">
        Unlock more books, longer sessions, and unlimited conversations.
      </p>

      <div className="clerk-pricing-container">
        <div className="clerk-pricing-table-wrapper">
          <PricingTable />
        </div>
      </div>
    </div>
  )
}

export default Page
