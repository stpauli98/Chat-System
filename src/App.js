import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { collection, addDoc, query, orderBy, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase';  
import { useAuthState } from 'react-firebase-hooks/auth'; 
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; 
import './App.css';

const ChatMessage = memo(({ message }) => {
  return (
    <div className="message-container">
      <p className="message-text">{message.text}</p>
      <p className="message-timestamp">
        {message.timestamp?.seconds
          ? new Date(message.timestamp.seconds * 1000).toLocaleTimeString()
          : "Nema vremenske oznake"}
      </p>
      <p className="message-username">
        ( {message.userName || "Nepoznato"} )
      </p>
    </div>
  );
});

function ChatRoom({ messages, dummy }) {
  useEffect(() => {
    if (dummy.current) {
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, dummy]);

  return (
    <div className="chat-box">
      {messages && messages.map((msg) => (
        <div key={msg.id} className="message-container">
          <ChatMessage message={msg} />
        </div>
      ))}
      <div ref={dummy}></div> 
    </div>
  );
}

function App() {
  const [message, setMessage] = useState("");
  const [user] = useAuthState(auth);
  const dummy = useRef();

  // Funkcija za slanje poruka
  const sendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      await addDoc(collection(db, "messages"), {
        text: message,
        timestamp: new Date(),
        userId: user.uid,
        userName: user.displayName,
      });
      setMessage("");
    }
  }, [message, user]);

  const handleInputChange = useCallback((e) => {
    setMessage(e.target.value);
  }, []);
  // Funkcija za brisanje svih poruka
  const deleteAllMessages = async () => {
    try {
      const messagesRef = collection(db, 'messages');
      const querySnapshot = await getDocs(messagesRef);

      const deletePromises = querySnapshot.docs.map(async (document) => {
        const docRef = doc(db, 'messages', document.id);
        await deleteDoc(docRef);
      });

      await Promise.all(deletePromises);
      console.log('Sve poruke su obrisane');
    } catch (error) {
      console.error('Greška prilikom brisanja poruka:', error);
    }
  };

  const SignIn = () => {
    const signInWithGoogle = () => {
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider)
        .then((result) => {
          console.log('User signed in:', result.user);
        })
        .catch((error) => {
          console.error('Error during sign-in:', error);
        });
    };

    return <button onClick={signInWithGoogle}>Sign in with Google</button>;
  };

  const SignOut = () => (
    <button className="sign-out" onClick={() => auth.signOut()}>
      Sign Out
    </button>
  );

  const messageRef = collection(db, 'messages');
  const queryMessages = query(messageRef, orderBy('timestamp', 'asc'));
  const [messages] = useCollectionData(queryMessages, { idField: 'id' });

  return (
    <div className="App">
      <h1>Supertajni Cet</h1>
      <section className='signInOut'>
        {user ? (
          <>
            <ChatRoom messages={messages} dummy={dummy} />
            <div className="sign-out-container">
              <SignOut />
            </div>
          </>
        ) : (
          <SignIn />
        )}
      </section>

      {user && (
        <form className='sendMessForm' onSubmit={sendMessage}>
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            placeholder="Unesi poruku"
          />
          <button type="submit">Pošalji</button>
        </form>
      )}
      <button onClick={deleteAllMessages}>Delete All</button>
    </div>
  );
}

export default App;
