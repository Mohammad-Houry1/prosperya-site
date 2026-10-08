import { useEffect, useState } from 'react';
import { request } from '../api';
const empty = {name:'',company_name:'',work_email:'',contact_country:'',project_type:'',project_stage:'',project_brief:'',website:''};
export default function ContactForm() {
  const [options,setOptions]=useState(null);
  const [values,setValues]=useState(empty);
  const [error,setError]=useState('');
  const [fields,setFields]=useState({});
  const [success,setSuccess]=useState('');
  const [pending,setPending]=useState(false);
  useEffect(()=>{let current=true;request('/contact/options').then(data=>{if(current)setOptions(data.data);}).catch(error=>{if(current)setError(error.message);});return()=>{current=false;};},[]);
  const submit=async(event)=>{
    event.preventDefault();if(pending)return;setPending(true);setError('');setFields({});setSuccess('');
    try { const data=await request('/contact',{method:'POST',body:JSON.stringify(values)});setSuccess(data.message);setValues(empty); }
    catch(error){setError(error.message);setFields(error.fields||{});} finally{setPending(false);}
  };
  const input=(field,label,type='text')=><label key={field}>{label}<input type={type} name={field} value={values[field]} required maxLength={field==='work_email'?254:255}
    onChange={event=>setValues({...values,[field]:event.target.value})}/>{fields[field]?.map(message=><span role="alert" key={message}>{message}</span>)}</label>;
  const select=(field,label,list)=><label key={field}>{label}<select name={field} value={values[field]} required onChange={event=>setValues({...values,[field]:event.target.value})}>
    <option value="">Choose an option</option>{list?.map(option=><option key={option.id} value={option.id}>{option.name}</option>)}</select></label>;
  return <section aria-labelledby="contact-title"><h2 id="contact-title">Get in touch</h2>
    {error&&<p role="alert">{error}</p>}{success&&<p role="status">{success}</p>}
    {options && <form onSubmit={submit}>
      {input('name','Name')}{input('company_name','Company')}{input('work_email','Work email','email')}
      {options.countries?.length ? <label>Country<select value={values.contact_country} required onChange={event=>setValues({...values,contact_country:event.target.value})}>
        <option value="">Choose a country</option>{options.countries.map(country=><option key={country.id} value={country.name}>{country.name}</option>)}</select></label> : input('contact_country','Country')}
      {select('project_type','Project type',options.project_types)}{select('project_stage','Project stage',options.project_stages)}
      <label>Message<textarea required name="project_brief" maxLength={10000} value={values.project_brief} onChange={event=>setValues({...values,project_brief:event.target.value})}/></label>
      <div className="honeypot" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={event=>setValues({...values,website:event.target.value})}/></div>
      <button disabled={pending}>{pending?'Sending…':'Send message'}</button>
    </form>}
  </section>;
}
