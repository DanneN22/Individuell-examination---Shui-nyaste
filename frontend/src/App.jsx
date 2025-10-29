// frontend/src/App.jsx
import React, { useEffect, useState } from 'react';
import { fetchMessages, postMessage, updateMessage, deleteMessage } from './api';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const load = async () => {
    const data = await fetchMessages();
    setMessages(data);
  };

  useEffect(() => { load(); }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!username || !text) return alert('Användarnamn och text krävs');
    await postMessage(username, text);
    setText('');
    load();
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditingText(m.text);
  };
  const saveEdit = async () => {
    await updateMessage(editingId, editingText);
    setEditingId(null);
    setEditingText('');
    load();
  };
  const handleDelete = async (id) => {
    if (!confirm('Ta bort meddelandet?')) return;
    await deleteMessage(id);
    load();
  };

  return (
    <div style={{maxWidth:800, margin:'2rem auto', fontFamily:'Arial, sans-serif'}}>
      <h1>Shui - Anslagstavla</h1>

      <form onSubmit={handlePost} style={{marginBottom: '1.5rem'}}>
        <input placeholder="Användarnamn" value={username} onChange={e=>setUsername(e.target.value)} />
        <input placeholder="Meddelande" value={text} onChange={e=>setText(e.target.value)} style={{width:'60%', marginLeft:8}} />
        <button type="submit" style={{marginLeft:8}}>Posta</button>
      </form>

      <section>
        {messages.length === 0 ? <p>Inga meddelanden än.</p> : messages.map(m => (
          <div key={m.id} style={{border:'1px solid #ddd', padding:12, marginBottom:8, borderRadius:6}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <strong style={{cursor:'pointer'}} onClick={() => window.location = `/user/${encodeURIComponent(m.username)}`}>{m.username}</strong>
              <small>{new Date(m.createdAt).toLocaleString()}</small>
            </div>
            {editingId === m.id ? (
              <>
                <textarea value={editingText} onChange={e=>setEditingText(e.target.value)} style={{width:'100%'}} />
                <div>
                  <button onClick={saveEdit}>Spara</button>
                  <button onClick={()=>setEditingId(null)} style={{marginLeft:8}}>Avbryt</button>
                </div>
              </>
            ) : (
              <>
                <p style={{whiteSpace:'pre-wrap'}}>{m.text}</p>
                <div>
                  <button onClick={()=>startEdit(m)}>Ändra</button>
                  <button onClick={()=>handleDelete(m.id)} style={{marginLeft:8}}>Ta bort</button>
                </div>
              </>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
