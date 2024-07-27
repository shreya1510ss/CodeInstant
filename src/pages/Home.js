import React, { useState } from 'react'
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {

    const [roomid, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const navigate=useNavigate();
   





    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success("created a new Room");

    }


    const  joinRoom=()=>{
        
        if(!roomid || !username)
        {
            toast.error("room id and username is required");
            return;

        }

        navigate(`/editor/${roomid}`,{
            state:{
                username,
            }
        })

        
    }


    const handleInputEnter=(e)=>{
      

        if(e.code==="Enter")
        {
            joinRoom();

        }
    
    }

    return (
        <div className='homePageWrapper'>
            <div className="formWrapper">
                <img src="/code-sync.png" alt="code logo" className="homePageLogo" />
                <h4 className='mainLabel'>Paste invitation ROOM ID</h4>
                <div className="inputGroup">
                    <input
                        type='text'
                        className='inputBox'
                        placeholder='Enter Room Id'
                        value={roomid}
                        onChange={(e) => setRoomId(e.target.value)}
                        onKeyUp={handleInputEnter}


                    />
                    <input
                        type='text'
                        className='inputBox'
                        placeholder='Enter Name'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyUp={handleInputEnter}
                    />
                    <button className='btn joinBtn' onClick={joinRoom}>Join</button>
                    <span className='createInfo'>
                        If you dont have an invite then create &nbsp; <a href='' className='createNewBtn' onClick={createNewRoom}>new room</a>
                    </span>
                </div>


            </div>

        </div>
    )
}

export default Home
