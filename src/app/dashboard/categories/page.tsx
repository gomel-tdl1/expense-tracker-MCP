import { DashboardScreen } from '../../../components/dashboard-screen';
export default async function CategoriesPage({searchParams}:{searchParams:Promise<{month?:string}>}) {
 return <DashboardScreen section="categories" month={(await searchParams).month}/>;
}
