import React from "react";
import "./CApp.css";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEdit,
  faCheck,
  faTimes,
  faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";
import firebase from "firebase";
import { db, auth, provider } from "./firebase";
import useStateValue from "./StateProvider";
// import db from "./firebase";
import { useEffect, useState } from "react";
import { actionTypes } from "./reducer";

function App() {
  const [todos, setTodos] = useState([""]);
  const [currTask, setCurrTask] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [error, setError] = useState(false);
  const [ModalSignIn, setModalSignIn] = useState(true);
  const [username, setUsername] = useState("");
  const [{ userGoogle }, dispatch] = useStateValue();
  const [user, setUser] = useState(null);
  

  useEffect(() => {
    db.collection("users")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setTodos(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            todo: doc.data().todo,
            status: doc.data().status,
          }))
        );
      });
  }, []);

  useEffect(() => {
    if (localStorage.getItem("users") !== null) {
      setUser(JSON.parse(localStorage.getItem("users")));
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        //already logged in
        setUser(authUser);
      } else {
        //user log out
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user, username]);


  const [input, setInput] = useState("");
  const [editInput, setEditInput] = useState("");
  const [editToggle, setEditToggle] = useState("");
  const [markerWidth, setWidth] = useState("20px");
  const [markerLeft, setLeft] = useState("10px");

  const addTodos = (event) => {
    event.preventDefault();
    // setTodos([...todos, input]);
    db.collection("users")
      .add({
        todo: input,
        status: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .catch((err) => alert(err.message));

    setInput("");
  };

  const handleSignInOpen = () => setModalSignIn(true);
  const handleSignInClose = () => setModalSignIn(false);

    //Sign Up function
    const signUp = (event) => {
      event.preventDefault();
      auth
        .createUserWithEmailAndPassword(email, password)
        .then((authUser) => {
          return authUser.user.updateProfile({
            displayName: username,
          });
        })
        .catch((err) => alert(err.message));
      setEmail("");
      setPassword("");
      handleSignInOpen();
    };
  
    //Sign In function
    const signIn = (event) => {
      event.preventDefault();
      auth
        .signInWithEmailAndPassword(email, password)
        .catch((err) => alert(err.message));
        setUser({email:email})
      setEmail("");
      setPassword("");
      handleSignInClose();
    };
  
    //Google Sign In
    const signInWithGoogle = (event) => {
      event.preventDefault();
      auth
        .signInWithPopup(provider)
        .then((result) => {
          dispatch({
            type: actionTypes.SET_USER,
            userGoogle: result.user,
          });
          setUser(result.user);
        })
        .catch((err) => alert(err.message));
      setEmail("");
      setPassword("");
    };

    const handleExitRoom = () => {
      localStorage.removeItem("users");
      setUser({ isRoom: false, key: "", password: "", room_name: "" });
      setTodos([""]);
    };
  
    const handleSignOut = () => {
      auth.signOut();
    };

  return (
    <div className="App">
      {user ? (
        <>
        <h1>TODO</h1>
        <button onClick={handleSignOut}>Log out</button>
        <div className="App__Box">
        <div className="App__input">
          <form>
            <p>+</p>
            <button onClick={handleExitRoom} title="Exit">
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
            <input
              type="text"
              placeholder="Create a new todo..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!input}
              variant="primary"
              type="submit"
              onClick={addTodos}
            >
              ADD
            </button>
          </form>
        </div>
        <div className="App__display">
          <ul>
            {todos.map((todo) => {
              if (
                currTask === 0 ||
                (currTask === 1 && todo.status === false) ||
                (currTask === 2 && todo.status === true)
              ) {
                return (
                  <>
                    <li>
                      <div className="checkbox__cover">
                        <input
                          type="checkbox"
                          checked={todo.status}
                          onChange={(e) => {
                            db.collection("users")
                             .doc(todo.id)
                             .update({ status: e.target.checked });
                          }}
                        />
                      </div>
                      <p
                        style={
                          todo.status
                            ? { textDecoration: "line-through" }
                            : { textDecoration: "none" }
                        }
                      >
                        {todo.todo}
                      </p>
                      <button
                        onClick={() => {
                          setEditInput(todo.todo);
                          setEditToggle(todo.id);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => {
                          db.collection("users").doc(todo.id).delete();
                          // setTodos(todos.filter((itm) => todo.id !== itm.id));
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </li>
                    {editToggle === todo.id ? (
                      <li className="editItem">
                        <input
                          value={editInput}
                          onChange={(e) => {
                            setEditInput(e.target.value);
                          }}
                        ></input>
                        <button
                          onClick={() => {
                            db.collection("users").doc(todo.id).update({
                              todo: editInput,
                            });
                            // setTodos(
                            //   todos.map((t) => {
                            //     if (t.id === todo.id) {
                            //       return {
                            //         ...t,
                            //         todo: editInput,
                            //       };
                            //     }
                            //   })
                            // );
                            setEditInput("");
                            setEditToggle("");
                          }}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                        <button
                          onClick={() => {
                            setEditInput("");
                            setEditToggle("");
                          }}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </li>
                    ) : (
                      <></>
                    )}
                  </>
                );
              }
            })}
          </ul>
        </div>
        <div className="App_controls">
          <p>{todos.filter((todo) => !todo.status).length} items left</p>
          <nav>
            <span
              id="marker"
              style={{ width: markerWidth, left: markerLeft }}
            ></span>
            <a 
              href=""
              className={currTask === 0 ? "active" : ""}
              onClick={(e) => {
                setCurrTask(0);
                setWidth(e.target.offsetWidth + "px");
                setLeft(e.target.offsetLeft + "px");
              }}
            >
              All
            </a>
            <a
              className={currTask === 1 ? "active" : ""}
              onClick={(e) => {
                setCurrTask(1);
                setWidth(e.target.offsetWidth + "px");
                setLeft(e.target.offsetLeft + "px");
              }}
            >
              Active
            </a>
            <a
              className={currTask === 2 ? "active" : ""}
              onClick={(e) => {
                setCurrTask(2);
                setWidth(e.target.offsetWidth + "px");
                setLeft(e.target.offsetLeft + "px");
              }}
            >
              Completed
            </a>
          </nav>
          <a
            onClick={() => {
              const confirmBox = window.confirm(
                "Do you want to delete all completed tasks?"
              );
              if (confirmBox === true) {
                todos.map((todo) => {
                  if (todo.status === true) {
                    db.collection("users").doc(todo.id).delete();
                    // setTodos(todos.filter((itm) => todo.id !== itm.id));
                  }
                  return ;
                });
              }
            }}
          >
            Clear Completed
          </a>
        </div>
      </div>
        </>    
    ):(
      <>
      <div className="App__Start">
        <div
          className="login"
          style={{
            display: ModalSignIn ? "flex" : "none",
          }}
        >
          <form>
            <h1>LOG IN</h1>
            <br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="off"
            />
            <br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="off"
            />
            <br />
            <input
              type="submit"
              disabled={!(email && password)}
              onClick={signIn}
              value="Login"
            />
            <br />
            <p>
              DON'T HAVE AN ACCOUNT ?{" "}
              <button type="button" onClick={handleSignInClose}>
                SIGNUP
              </button>
            </p>
            <div className="button-google">
            <button onClick={signInWithGoogle} class="google-btn">
              <div class="google-icon-wrapper">
                <img
                  class="google-icon"
                  src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                />
              </div>
              <p class="btn-text">Sign in with google</p>
            </button>
            </div>
          </form>
        </div>
        <div
          className="signup"
          style={{
            display: ModalSignIn ? "none" : "flex",
          }}
        >
          <form>
            <h1>SIGN UP</h1>
            <br />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="off"
            />
            <br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="off"
            />
            <br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="off"
            />
            <br />
            <input
              type="submit"
              disabled={!(email && password)}
              onClick={signUp}
              value="Signup"
            />
            <br />
            <p>
              ALREADY HAVE AN ACCOUNT ?{" "}
              <button type="buttton" onClick={handleSignInOpen}>
                LOGIN
              </button>
            </p>
            <div className="button-google">
            <button onClick={signInWithGoogle} class="google-btn">
              <div class="google-icon-wrapper">
                <img
                  class="google-icon"
                  src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                />
              </div>
              <p class="btn-text">
                <b>Sign in with google</b>
              </p>
            </button>
            </div>
          </form>
        </div>
      </div>
    </>
    )}
    </div>
    
  );
}


export default App;
