import Header from "@/components/Header";
import SpecialityMenu from "@/components/SpecialityMenu";
import TopDoctors from "@/components/TopDoctors";
import Banner from "@/components/Banner";

export const metadata = {
  title: "Home — Find & Book Top Doctors Near You",
  description:
    "Prescripto helps you instantly book appointments with verified healthcare professionals. Browse by speciality and book today.",
};

export default function HomePage() {
  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  );
}
