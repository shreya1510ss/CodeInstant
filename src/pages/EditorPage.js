import React, { useEffect, useRef, useState } from 'react'
import Client from '../components/Client'
import Editor from '../components/Editor';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import Whiteboard from '../components/Whiteboard';
import { initSocket } from '../socket';
import ACTIONS, { JOINED } from '../Actions';
import toast from 'react-hot-toast';

const EditorPage = () => {

    const location = useLocation();
    const reactNavigator = useNavigate();
    const { roomid } = useParams();
    const codeRef=useRef(null);
    const [clients, setClients] = useState([]);
    

    const socketRef = useRef(null);
    useEffect(() => {

        
        const init = async () => {
            console.log('once')
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));


            function handleErrors(e) {
                console.log("socket error", e);
                toast.error('Socket connection failed. try again later');
                reactNavigator("/");

            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomid,
                username: location.state?.username,
            })


            //Listening for joined event
            socketRef.current.on(ACTIONS.JOINED,

                ({ clients, username, socketid }) => {


                    console.log("hello");
                    if (username != location.state?.username) {
                        toast.success(`${username} joined the room`);
                        console.log(`${username} joined the room`)
                    }

                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketid,
                    });

                });


            //listening for disconect
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketid, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketid !== socketid
                        );
                    });
                }
            );


        }



        init();

        return () => {
            console.log('EditorPage unmounting');
            if (socketRef.current) {

                socketRef.current.disconnect();
                socketRef.current.off(ACTIONS.JOINED);
                socketRef.current.off(ACTIONS.DISCONNECTED);
            }
        }





    }, []);

    // const [clients, setClients] = useState([
    //     { socketId: 1, username: "shreya" },
    //     { socketId: 2, username: "rohit" }

    // ]);

    const [open, setOpen] = useState(false);



    const leaveRoom = () => {
        reactNavigator('/');

    }

    const copyRoomId = async() => {
        try {
            await navigator.clipboard.writeText(roomid);
            toast.success('Room ID has been copied to your clipboard');
            
        } catch (error) {
            toast.error('Could not copy the Room ID');
            console.error(error);
            
        }


    }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    const handleClick = () => {
        setOpen(!open);
    };



    return (
        <div className='mainWrap'>
            <div className='aside'>
                <div className='asideInner'>
                    <div className='logo'>
                        <img src="/code-sync.png" alt="logo" className='logoImage' />
                    </div>
                    <h3>Users Connected</h3>
                    <div className='clientsList'>
                        {
                            clients.map(client => (
                                <Client key={client.socketid} username={client.username} />
                            ))
                        }
                    </div>
                </div>

                <button className="btn copyBtn" onClick={copyRoomId} >
                    Copy ROOM ID
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom}>
                    Leave
                </button>
                <button className="btn leaveBtn" onClick={handleClick}>
                    {open == true ? "Editor" : "Whiteboard"}
                </button>
            </div>
            <div className="editorWrap">
                {
                    open == false ? <div>
                    <Editor
                     socketRef={socketRef}
                     roomid={roomid}
                     onCodeChange={(code)=>{codeRef.current=code}}
                     />
                     </div> :
                        <div className='whiteboardWrap'>
                            <Whiteboard 
                            socketRef={socketRef}
                            roomid={roomid}
                        
                        /></div>

                }
            </div>

            {/* <div className="editorWrap">
        <Whiteboard/>
       </div>

     */}

        </div>
    )
}

export default EditorPage
