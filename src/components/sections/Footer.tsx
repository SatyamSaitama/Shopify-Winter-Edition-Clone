import { SectionContainer } from "@/components/ui/SectionContainer";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-paper py-10">
      <SectionContainer className="flex items-center justify-between text-xs text-stone">
        <p>© Shopify Inc</p>
        <div className="flex gap-4">
          <a href="#" className="underline">
            Terms of Service
          </a>
          <a href="#" className="underline">
            Privacy Policy
          </a>
        </div>
      </SectionContainer>
    </footer>
  );
}
