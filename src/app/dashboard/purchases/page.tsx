import { DashboardScreen } from '../../../components/dashboard-screen';
export default async function PurchasesPage({searchParams}:{searchParams:Promise<{month?:string}>}) {
 return <DashboardScreen section="purchases" month={(await searchParams).month}/>;
}
