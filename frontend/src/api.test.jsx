import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from './App';
beforeEach(() => { global.fetch = vi.fn(async (path) => ({ ok: true, status: 200, json: async () => path === '/api/articles' ? {data:[{id:'1',slug:'hello',title:'CMS article',excerpt:'Updated content'}]} : {data:{project_types:[{id:'type',name:'Website'}],project_stages:[{id:'stage',name:'Planning'}],countries:[{id:'country',name:'Lebanon'}]}} })); });
afterEach(cleanup);
it('shows articles returned by the client API', async () => { render(<App/>); expect(await screen.findByText('CMS article')).toBeTruthy(); });
it.each([[403,'Service unavailable.'],[503,'Temporarily unavailable. Please try again later.']])('shows the %s service state without exposing credentials', async (status,message) => {
  fetch.mockResolvedValue({ok:false,status,json:async()=>({})});
  render(<App/>); expect(await screen.findAllByText(message)).toHaveLength(2);
});
it('shows contact validation feedback and acknowledgement', async () => {
  render(<App/>);
  await screen.findByText('CMS article');
  for (const [label,value] of [['Name','Visitor'],['Company','Company'],['Work email','visitor@example.test'],['Country','Lebanon'],['Project type','type'],['Project stage','stage'],['Message','Please contact me']]) {
    fireEvent.change(screen.getByLabelText(label),{target:{value}});
  }
  fetch.mockResolvedValueOnce({ok:false,status:422,json:async()=>({message:'Check your details.',errors:{work_email:['Use a valid work email.']}})});
  fireEvent.click(screen.getByRole('button',{name:'Send message'}));
  expect(await screen.findByText('Use a valid work email.')).toBeTruthy();
  fetch.mockResolvedValueOnce({ok:true,status:201,json:async()=>({message:'Your message has been received.'})});
  fireEvent.click(screen.getByRole('button',{name:'Send message'}));
  expect(await screen.findByText('Your message has been received.')).toBeTruthy();
});
