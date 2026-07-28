import Image from "next/image";
import { CategorySectionShell } from "./CategorySectionShell";
import { Reveal } from "@/components/ui/Reveal";
import { GhostButton } from "@/components/ui/Button";
import { FeatureGrid } from "@/components/ui/FeatureGrid";

function HubGraphic() {
  return (
    <div className="flex aspect-video items-center justify-center rounded-md bg-linear-to-br from-[#3a3a3a] to-[#111]">
      <div className="h-24 w-40 rounded-xl bg-[#5c5c5c] shadow-card" />
    </div>
  );
}

const posFeatures = [
  {
    title: "Scanner support",
    image: "/assets/content/U254_Scanner_support.png",
    alt: "An HP barcode scanner with a red light.",
  },
  {
    title: "Sell subscriptions on POS",
    image: "/assets/content/U49_Sell_subscriptions_POS.png",
    alt: "On the POS, a modal where a subscription is being added for a skate magazine.",
  },
  {
    title: "Quick count POS extension",
    image: "/assets/content/U53_Quick_count_POS_extension.png",
    alt: "A modal where skateboard items can be added and subtracted based on inventory count.",
  },
  {
    title: "Customize the smart grid",
    image: "/assets/content/6f0d7e6128d962253121b3aec1527854.png",
    alt: "On the POS, the smart grid, lock screen, receipt, and customer display are being edited.",
  },
  {
    title: "Local delivery with Uber Direct",
    image: "/assets/content/U62_Uber_Direct_POS_local.png",
    alt: "The Uber Direct app icon on a package of skateboard bearings being delivered locally.",
  },
];

export function RetailSection() {
  return (
    <CategorySectionShell
      id="retail"
      name="Retail"
      tagline="New in-store hardware that provides unwavering reliability."
      sceneId="retail"
    >
      <Reveal className="grid grid-cols-1 items-center gap-10 sm:grid-cols-2">
        <div>
          <h3 className="text-2xl font-bold text-ink">Not your standard hub</h3>
          <p className="mt-3 text-base leading-relaxed text-slate">
            The POS Hub gives you the reliability of wired connections with
            the processing power of a computer.
          </p>
          <div className="mt-4">
            <GhostButton>Shop now</GhostButton>
          </div>
        </div>
        <HubGraphic />
      </Reveal>

      <Reveal className="grid grid-cols-1 items-center gap-10 sm:grid-cols-2">
        <HubGraphic />
        <div>
          <h3 className="text-2xl font-bold text-ink">
            Connections that never drop
          </h3>
          <p className="mt-3 text-base leading-relaxed text-slate">
            Plug in card readers, printers, and scanners for the strongest,
            most reliable connection. No pairing required.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
          {posFeatures.map((f) => (
            <div key={f.title}>
              <div className="relative aspect-3/4 overflow-hidden rounded-md bg-putty">
                <Image src={f.image} alt={f.alt} fill className="object-cover" sizes="20vw" />
              </div>
              <p className="mt-2 text-xs font-medium text-ink">{f.title}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <FeatureGrid
          items={[
            { title: "Markets for retail", body: "Set unique prices and publish products per retail location and online. Exclusive to POS Pro." },
            { title: "Retail payments in more countries", body: "Accept in-person payments, including Tap to Pay on iPhone and Android, in Luxembourg, Switzerland, and the Czech Republic." },
            { title: "QR code payments", body: "Let customers pay in store with iDeal, Swish, Twint, Mobilepay, and USDC by scanning a QR code and completing checkout on their phone." },
            { title: "Tap to Pay in more countries", body: "Let customers Tap to Pay on iPhone in Germany, Ireland, Spain, and New Zealand." },
            { title: "Cartes Bancaires accepted on POS", body: "Accept Cartes Bancaires (CB) branded cards from your POS in France." },
            { title: "Receive transfer shipments in-store", body: "Accept or reject transfers in store using the Transfers POS extension. Exclusive to POS Pro." },
            { title: "Customizable return receipts", body: "Create custom return and exchange receipts with your return policy, logo, and contact information using the Liquid editor." },
            { title: "Better in-progress return visibility", body: "Accurately track in-progress returns in your POS and easily cancel unfulfilled items." },
            { title: "Refund selections on POS", body: "Choose between original payment, gift card, or store credit on a dedicated refund screen." },
          ]}
        />
      </Reveal>
    </CategorySectionShell>
  );
}
