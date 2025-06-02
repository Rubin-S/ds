import Banner from '@/components/home/banner';
import SpecialSection from "@/components/home/about";
import ServiceCard from '@/components/home/service';
import FaqSection from "@/components/home/faq";
import Navbar from '@/components/layout/navbar';

export default function HomePage() {
    return (
      <main>
        <Navbar />
        <Banner
          backgroundImages={[
            "/https://placehold.co",
            "/https://placehold.co",
            "/https://placehold.co",
          ]}
          pretitle="Welcome to"
          title="Sri Senthil Murugan Driving School"
          ctaText="Book Your Lesson"
          ctaLink="/contact-us"
        />
        <div id="why-smds" />
        <SpecialSection />
        <ServiceCard />
        <div id="faq" />
        <FaqSection />
      </main>
    );
}