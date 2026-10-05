import { DashboardScreen } from '../../components/dashboard-screen';
export const dynamic='force-dynamic';
export default async function DashboardPage({searchParams}:{searchParams:Promise<{month?:string}>}) {
 return <DashboardScreen month={(await searchParams).month}/>;
}
