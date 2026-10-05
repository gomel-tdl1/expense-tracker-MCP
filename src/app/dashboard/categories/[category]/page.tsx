import { notFound } from 'next/navigation';
import { DashboardScreen } from '../../../../components/dashboard-screen';
import { CATEGORY_LABELS, type Category } from '../../../../lib/stats';
export default async function CategoryPage({params,searchParams}:{params:Promise<{category:string}>;searchParams:Promise<{month?:string}>}) {
 const {category}=await params;
 if(!Object.hasOwn(CATEGORY_LABELS,category)) notFound();
 return <DashboardScreen section="categories" category={category as Category} month={(await searchParams).month}/>;
}
