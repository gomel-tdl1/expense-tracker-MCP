import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({ claims:vi.fn(), receipts:vi.fn() }));
vi.mock('../src/lib/supabase/server',()=>({createServerClient:async()=>({auth:{getClaims:mocks.claims}})}));
vi.mock('../src/lib/expenses',()=>({loadMonthReceipts:mocks.receipts}));
vi.mock('../src/lib/preferences',()=>({getPreferences:async()=>({locale:'en'})}));
import { GET } from '../src/app/dashboard/export/route';
describe('authenticated CSV endpoint',()=>{
 beforeEach(()=>{vi.clearAllMocks();mocks.claims.mockResolvedValue({data:{claims:{sub:'owner'}}});});
 it('rejects anonymous exports without loading purchases',async()=>{
  mocks.claims.mockResolvedValue({data:null});
  expect((await GET(new Request('https://example.test/dashboard/export?month=2026-10'))).status).toBe(401);
  expect(mocks.receipts).not.toHaveBeenCalled();
 });
 it('rejects invalid month and unknown categories',async()=>{
  expect((await GET(new Request('https://example.test/dashboard/export?month=2026-13'))).status).toBe(400);
  expect((await GET(new Request('https://example.test/dashboard/export?month=2026-10&category=__proto__'))).status).toBe(400);
  expect(mocks.receipts).not.toHaveBeenCalled();
 });
 it('downloads only the selected category and month without caching private data',async()=>{
  const record={id:'r',spent_on:'2026-10-05',created_at:'2026-10-05T12:00:00Z',merchant:'Station',currency:'PLN',total_grosz:2100,expense_items:[
   {id:'a',name:'Fuel',quantity:1,category:'fuel',amount_grosz:2000,position:0},
   {id:'b',name:'Coffee',quantity:1,category:'cafes',amount_grosz:100,position:1},
  ]};
  mocks.receipts.mockResolvedValue([record,{...record,id:'prior',spent_on:'2026-09-05'}]);
  const response=await GET(new Request('https://example.test/dashboard/export?month=2026-10&category=fuel'));
  expect(response.status).toBe(200);
  expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  expect(response.headers.get('Content-Disposition')).toContain('expenses-2026-10-fuel.csv');
  const text=await response.text();
  expect(text).toContain('Fuel');expect(text).not.toContain('Coffee');expect(text).not.toContain('2026-09-05');
 });
 it('returns a controlled error when loading fails',async()=>{
  mocks.receipts.mockRejectedValue(new Error('private database detail'));
  const response=await GET(new Request('https://example.test/dashboard/export?month=2026-10'));
  expect(response.status).toBe(500);expect(await response.text()).not.toContain('private database detail');
 });
});
