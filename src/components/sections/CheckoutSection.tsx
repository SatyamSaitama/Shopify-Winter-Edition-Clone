import Image from "next/image";
import { CategorySectionShell } from "./CategorySectionShell";
import { Reveal } from "@/components/ui/Reveal";
import { ImageRow } from "@/components/ui/ImageRow";
import { FeatureGrid } from "@/components/ui/FeatureGrid";

export function CheckoutSection() {
  return (
    <CategorySectionShell
      id="checkout"
      name="Checkout"
      tagline="Convert customers with personalized checkout experiences and more payment options."
      sceneId="checkout"
    >
      <Reveal>
        <ImageRow
          panels={[
            {
              title: "Personalized Shop button",
              description:
                "The last four digits of a customer's saved card will appear on their Shop Pay button.",
              media: (
                <Image
                  src="/assets/content/03cf615f7c023dd5afc16904b8e4b619.png"
                  alt="A Buy with Shop button expanding to show the Mastercard logo and the last four digits of a card."
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              ),
              ctaLabel: "Read help doc",
            },
            {
              title: "Checkout and accounts customization per market",
              description:
                "Customize your checkout and customer account pages for different countries and B2B buyers directly in the editor.",
              media: (
                <Image
                  src="/assets/content/U94_Markets_in_the_Checkout.png"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="50vw"
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
            { title: "Shop Pay Installments in the UK", body: "Offer Shop Pay's Buy Now, Pay Later in the UK with terms up to 24 months." },
            { title: "Shop Pay works with Global-e", body: "Use Shop Pay in every market, with domestic orders handled by Shopify Payments and international orders processed by Global-e." },
            { title: "Apple Pay in Shop Pay", body: "Apple Pay is now available as a payment method in Shop Pay." },
            { title: "Reminders for Shop Pay subscriptions", body: "Shop Pay automatically notifies subscribers before their payment method expires." },
            { title: "Switch to Shopify Payments with zero downtime", body: "Move from third-party payment processors to Shopify Payments without interrupting checkout." },
            { title: "Streamlined Shopify Payments onboarding", body: "Set up Shopify Payments faster with localized forms, clear guidance, fewer requirements, and help from AI to fill out forms." },
            { title: "More payment methods in France", body: "Accept cross-border payments in France from Bancontact in Belgium, iDEAL in the Netherlands, Twint in Switzerland, Blik and Przelewy24 in Poland, MobilePay in Denmark, and EPS in Austria." },
            { title: "Klarna in more countries", body: "Let customers use Klarna on Shopify Payments in Belgium, Denmark, Finland, France, Switzerland, Czechia, Ireland, and Portugal." },
          ]}
        />
      </Reveal>
    </CategorySectionShell>
  );
}
