import Image from "next/image";
import { CategorySectionShell } from "./CategorySectionShell";
import { Reveal } from "@/components/ui/Reveal";
import { ImageRow } from "@/components/ui/ImageRow";
import { FeatureGrid } from "@/components/ui/FeatureGrid";
import { FallingCoins } from "@/components/ui/FallingCoins";

export function FinanceSection() {
  return (
    <CategorySectionShell
      id="finance"
      name="Finance"
      tagline="Modern financial tools designed for growing your business and getting that coin."
      sceneId="finance"
      overlay={<FallingCoins />}
    >
      <Reveal>
        <ImageRow
          panels={[
            {
              title: "Continuous funding with the Shopify Capital flex account",
              description:
                "Apply once for ongoing access to funding with Shopify Capital and only pay fees on your outstanding balance. Get replenished funds, subject to approval, as you repay. US only.",
              media: (
                <Image
                  src="/assets/content/1bf084da109bb3fe83016948c3c88b1f.png"
                  alt="An application for funding, a request to withdraw money, and the money being withdrawn."
                  fill
                  className="object-cover"
                  sizes="33vw"
                />
              ),
              ctaLabel: "Read help doc",
            },
            {
              title: "Automatic transfers in Shopify Balance",
              description:
                "Set rules in Shopify Balance to automatically split each payout across accounts, such as expenses, inventory, marketing, and savings. US only.",
              media: (
                <Image
                  src="/assets/content/U158_Automated_transfers_for_Shopify_Balance_payouts.png"
                  alt="An interface showing a breakdown of a payout into sales tax, marketing, inventory, and savings."
                  fill
                  className="object-cover"
                  sizes="33vw"
                />
              ),
              ctaLabel: "Read help doc",
            },
            {
              title: "Staff cards with spend controls",
              description:
                "Issue Shopify Balance cards to staff and set spend controls. US only.",
              media: (
                <Image
                  src="/assets/content/U163_Spend_controls_secondary_cardholders_for_Balance.png"
                  alt="A credit card shown with an interface breaking down staff cards by department."
                  fill
                  className="object-cover"
                  sizes="33vw"
                />
              ),
              ctaLabel: "Read help doc",
            },
          ]}
        />
      </Reveal>

      <Reveal>
        <FeatureGrid
          items={[
            { title: "Shopify Capital in more European countries", body: "Access fast funding with adjustable repayment terms in the Netherlands, Spain, and Ireland with Shopify Capital." },
            { title: "Track international profit margins", body: "Compare actual and estimated costs by market, including duties, taxes, and shipping adjustments." },
            { title: "Credits on USDC transactions", body: "Earn automatic credits on every order paid with USDC, which appear in your order timeline and payouts — paid in fiat or USDC on settlement. US, Mexico, and Canada." },
            { title: "Same-day ACH transfers", body: "Send money from your Shopify Balance account by 1pm ET to have transfers arrive the same business day. US only." },
          ]}
        />
      </Reveal>
    </CategorySectionShell>
  );
}
