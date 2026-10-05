import { DashboardView, type DashboardSection } from './dashboard-view';
import { loadDashboard } from '../lib/dashboard-data';
import { messages } from '../lib/i18n';
import type { Category } from '../lib/stats';
import { signOut } from '../app/dashboard/actions';
export async function DashboardScreen({ month, section='overview', category }: { month?:string; section?:DashboardSection; category?:Category }) {
 const path=category?`/dashboard/categories/${category}`:section==='overview'?'/dashboard':`/dashboard/${section}`;
 const data=await loadDashboard(month,path);
 return <DashboardView {...data} section={section} category={category} signOut={<form action={signOut}><button className="signout" type="submit">{messages[data.locale].signOut}</button></form>}/>;
}
