"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock3, ExternalLink, FilePlus2, Play, Save, Search, Trash2 } from "lucide-react";

type Item = { slug:string;category:string;title:string;eyebrow:string;description:string;date:string;duration?:string;format:string;featured?:boolean;available?:boolean;href?:string;topics:string[];body:string[] };
type Library = { updatedAt:string;edition:string;items:Item[] };
const categories = ["after-hours","bonus-episodes","research-notes","transcripts","downloads","early-access","behind-the-scenes"];
const blank = (): Item => ({ slug:`new-release-${Date.now()}`,category:"bonus-episodes",title:"Untitled release",eyebrow:"Bonus Episode",description:"Add a short description.",date:new Date().toISOString().slice(0,10),duration:"",format:"Private audio",available:false,topics:[],body:["Add the release body here."] });

export function ContentStudio() {
  const [library,setLibrary]=useState<Library|null>(null);
  const [selected,setSelected]=useState(0);
  const [message,setMessage]=useState("");
  const [saving,setSaving]=useState(false);
  const [loadError,setLoadError]=useState("");
  const [query,setQuery]=useState("");

  const load=useCallback(async()=>{setLoadError("");try{const response=await fetch("/api/members/content-studio",{cache:"no-store",signal:AbortSignal.timeout(8000)});if(!response.ok)throw new Error(`Content API returned ${response.status}`);setLibrary(await response.json())}catch(error){setLoadError(error instanceof Error?error.message:"Content Studio could not connect.")}},[]);
  useEffect(()=>{void load()},[load]);

  const save=useCallback(async()=>{if(!library||saving)return;setSaving(true);setMessage("");try{const response=await fetch("/api/members/content-studio",{method:"PUT",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify(library),signal:AbortSignal.timeout(45000)});const result=await response.json();setMessage(response.ok?"Published. Vercel is deploying the updated library.":result.error);if(response.ok)setLibrary(result.library)}catch(error){setMessage(error instanceof Error?error.message:"Publishing failed.")}finally{setSaving(false)}},[library,saving]);
  const add=useCallback(()=>{if(!library)return;const items=[...library.items,blank()];setLibrary({...library,items});setSelected(items.length-1);setQuery("")},[library]);

  useEffect(()=>{const onKey=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="s"){event.preventDefault();void save()}if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="n"){event.preventDefault();add()}};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[add,save]);

  if(loadError)return <main className="studio-loading studio-load-error"><div><h1>Content Studio couldn’t open.</h1><p>{loadError}</p><button onClick={()=>void load()}>Try again</button><small>If this repeats, restart the local server with <code>npm run dev</code>.</small></div></main>;
  if(!library)return <main className="studio-loading">Opening the archive editor…</main>;
  const item=library.items[selected];
  const update=(patch:Partial<Item>)=>setLibrary({...library,items:library.items.map((entry,index)=>index===selected?{...entry,...patch}:entry)});
  const remove=()=>{if(!item||!confirm(`Delete “${item.title}”?`))return;setLibrary({...library,items:library.items.filter((_,i)=>i!==selected)});setSelected(Math.max(0,selected-1))};
  const filtered=library.items.map((entry,index)=>({entry,index})).filter(({entry})=>`${entry.title} ${entry.category}`.toLowerCase().includes(query.toLowerCase()));

  return <main className="content-studio">
    <header className="studio-topbar">
      <a href="/members"><ArrowLeft/> Members</a>
      <div><span>HXP</span><b>Content Studio<small>Podcast publishing desk</small></b></div>
      <a href="/members" target="_blank">Open members page <ExternalLink/></a>
    </header>
    <div className="studio-layout">
      <aside className="studio-sidebar">
        <div className="studio-sidebar-title"><div><small>Private archive</small><p>Releases</p></div><button onClick={add} title="New release (⌘N)"><FilePlus2/> New</button></div>
        <label className="studio-search"><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search releases"/></label>
        <label className="studio-edition">Library edition<input value={library.edition} onChange={event=>setLibrary({...library,edition:event.target.value})}/></label>
        <nav>{filtered.map(({entry,index})=><button className={index===selected?"active":""} key={entry.slug} onClick={()=>setSelected(index)}><span>{String(index+1).padStart(2,"0")}</span><b>{entry.title}<small>{entry.category.replaceAll("-"," ")} · {entry.available===false?"Draft":"Live"}</small></b></button>)}</nav>
        <div className="studio-shortcuts"><span>Shortcuts</span><p><kbd>⌘ S</kbd> Publish</p><p><kbd>⌘ N</kbd> New release</p></div>
      </aside>
      {item?<>
        <section className="studio-editor">
          <div className="studio-title"><div><p>Editing release</p><h1>{item.title}</h1><small>{item.available===false?"Draft · not yet available":"Published release"}</small></div><button className="studio-delete" onClick={remove}><Trash2/> Delete</button></div>
          <EditorSection number="01" title="Identity" note="The title and language members see first.">
            <div className="studio-form"><Field label="Title"><input value={item.title} onChange={e=>update({title:e.target.value})}/></Field><Field label="Eyebrow"><input value={item.eyebrow} onChange={e=>update({eyebrow:e.target.value})}/></Field><Field label="Slug"><input value={item.slug} onChange={e=>update({slug:e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,"-")})}/></Field><Field label="Category"><select value={item.category} onChange={e=>update({category:e.target.value})}>{categories.map(category=><option key={category}>{category}</option>)}</select></Field></div>
          </EditorSection>
          <EditorSection number="02" title="Release details" note="Publishing metadata and the destination link.">
            <div className="studio-form"><Field label="Release date"><input type="date" value={item.date} onChange={e=>update({date:e.target.value})}/></Field><Field label="Duration"><input value={item.duration??""} placeholder="48 min" onChange={e=>update({duration:e.target.value})}/></Field><Field label="Format"><input value={item.format} placeholder="Private audio" onChange={e=>update({format:e.target.value})}/></Field><Field label="Media / download URL"><input type="url" value={item.href??""} placeholder="https://…" onChange={e=>update({href:e.target.value})}/></Field><div className="studio-checks"><label><input type="checkbox" checked={item.available!==false} onChange={e=>update({available:e.target.checked})}/> Available now</label><label><input type="checkbox" checked={Boolean(item.featured)} onChange={e=>update({featured:e.target.checked})}/> Featured release</label></div></div>
          </EditorSection>
          <EditorSection number="03" title="Editorial" note="The description, topics, and full release notes.">
            <div className="studio-form"><Field label="Short description" wide><textarea value={item.description} onChange={e=>update({description:e.target.value})}/></Field><Field label="Topics — comma separated" wide><input value={item.topics.join(", ")} onChange={e=>update({topics:e.target.value.split(",").map(v=>v.trim()).filter(Boolean)})}/></Field><Field label="Body — separate paragraphs with a blank line" wide><textarea className="body-field" value={item.body.join("\n\n")} onChange={e=>update({body:e.target.value.split(/\n\s*\n/).map(v=>v.trim()).filter(Boolean)})}/></Field></div>
          </EditorSection>
        </section>
        <aside className="studio-preview-panel">
          <div className="studio-preview-head"><div><span>Live preview</span><small>Members card</small></div><i>{item.available===false?"Draft":"Live"}</i></div>
          <PreviewCard item={item}/>
          <div className="studio-publish"><p>{message||"Changes stay local until you publish."}</p><button onClick={()=>void save()} disabled={saving}><Save/>{saving?"Publishing…":"Publish release"}</button><small><kbd>⌘ S</kbd> to publish from anywhere</small></div>
        </aside>
      </>:<section className="studio-empty">Create your first release.</section>}
    </div>
  </main>;
}

function EditorSection({number,title,note,children}:{number:string;title:string;note:string;children:React.ReactNode}){return <section className="studio-form-section"><header><span>{number}</span><div><h2>{title}</h2><p>{note}</p></div></header>{children}</section>}
function Field({label,wide=false,children}:{label:string;wide?:boolean;children:React.ReactNode}){return <label className={wide?"wide":""}><span>{label}</span>{children}</label>}
function PreviewCard({item}:{item:Item}){const formatted=useMemo(()=>new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"}).format(new Date(`${item.date}T00:00:00Z`)),[item.date]);return <article className="studio-preview-card"><div className="studio-preview-art"><span>{item.eyebrow}</span><i/><button aria-label="Play preview"><Play fill="currentColor"/></button><b>{item.format}</b></div><div className="studio-preview-copy"><p>{formatted}{item.duration&&<><Clock3/>{item.duration}</>}</p><h3>{item.title||"Untitled release"}</h3><div>{item.description||"Add a short description to preview the release card."}</div><footer>{item.topics.slice(0,3).map(topic=><span key={topic}>{topic}</span>)}</footer></div></article>}
