import DoctorsClient from './DoctorsClient';

export const metadata = {
  title: 'All Doctors',
  description: 'Browse and find the right specialist for your healthcare needs.',
};

export default function DoctorsPage() {
  return <DoctorsClient />;
}
