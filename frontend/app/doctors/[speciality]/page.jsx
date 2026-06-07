import DoctorsClient from '../DoctorsClient';

export async function generateMetadata({ params }) {
  const { speciality } = await params;
  return {
    title: `${decodeURIComponent(speciality)} Specialists`,
    description: `Find and book appointments with ${decodeURIComponent(speciality)} specialists on Prescripto.`,
  };
}

export default async function DoctorsBySpecialityPage({ params }) {
  const { speciality } = await params;
  return <DoctorsClient specialityParam={decodeURIComponent(speciality)} />;
}
