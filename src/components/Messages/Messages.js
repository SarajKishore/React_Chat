import React from 'react';
import {Segment,Comment} from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setUserPosts } from '../../actions';


import MessagesHeader from './MessagesHeader';
import MessageFrom from './MessageFrom';
import firebase from '../../firebase';
import Message from './Message';
import Typing from './Typing';
import Skeleton from './Skeleton';

class Messages extends React.Component{
    state={
        privateMessagesRef:firebase.database().ref('privateMessages') ,
        messagesRef: firebase.database().ref('messages'),
        usersRef: firebase.database().ref('users'),
        typingRef: firebase.database().ref('typing'),
        connectedRef: firebase.database().ref('.info/connected'), //to determine wheter the user is onine or not
        privateChannel: this.props.isPrivateChannel,
        channel: this.props.currentChannel,
        isChannelStarred: false,
        user: this.props.currentUser,
        messages: [],
        messagesLoading:true,
        ProgressBar: false,
        numUniqueUsers: "",
        searchTerm: '',
        searchLoading: false,
        searchResults: [],
        typingUsers: [],
        listeners: [],
    }

    componentDidMount(){
        const {channel,user,listeners}=this.state;
        if(channel && user){
            this.removeListeners(listeners);
            this.addListeners(channel.id);
            this.addUserStarListener(channel.id, user.uid) // to keep displaying the stareed channels ( otherwise they will look unstar in UI)
        }
    }

    componentWillUnmount(){
        this.removeListeners(this.state.listeners);
        this.state.connectedRef.off();
    }

    removeListeners = listeners =>{
        listeners.forEach(listener=>{
            listener.ref.child(listener.id).off(listener.event);
        })
    }

    componentDidUpdate(prevProps, prevState){
        if(this.messagesEnd){
            this.scrollToBottom();
        }
    }

    addToListeners= (id, ref , event)=>{
        const index = this.state.listeners.findIndex(listener =>{
            return listener.id=== id && listener.ref=== ref && listener.event === event;
        })

        if(index === -1){
            const newListener= {id ,ref, event};
            this.setState({ listeners: this.state.listeners.concat(newListener) });
        }
    }

    scrollToBottom = ()=>{
        this.messagesEnd.scrollIntoView({behavior: "smooth"})  //to scroll down to the cottom of the chat
    }

    addListeners = channelId=>{
        this.addMessageListener(channelId);
        this.addTypingListener(channelId);
    };

    addTypingListener = channelId =>{
        let typingUsers =[];
        this.state.typingRef.child(channelId).on('child_added', snap=>{
            if(snap.key !== this.state.user.uid){   //to make sure that we are not collecting the currently authenticated user within typingUsers array
                typingUsers= typingUsers.concat({
                    id: snap.key,
                    name: snap.val()
                })      
                this.setState({ typingUsers });
            }
        });
        this.addToListeners(channelId, this.state.typingRef, 'child_added');


        this.state.typingRef.child(channelId).on('child_removed', snap=>{
            const index= typingUsers.findIndex(user => user.id === snap.key);
            if( index !== -1){
                typingUsers= typingUsers.filter(user => user.id !== snap.key);
                this.setState({ typingUsers });
            }
        });
        this.addToListeners(channelId, this.state.typingRef, 'child_removed');

        this.state.connectedRef.on('value', snap=>{         //listen for value change
            if(snap.val() === true){
                this.state.typingRef
                    .child(channelId)
                    .child(this.state.user.uid)
                    .onDisconnect()     //when the current user logs out its child is removed from the typingRef
                    .remove(err=>{
                        if(err !== null){
                            console.error(err);
                        }
                    })
            }
        })

    }

    addMessageListener=channelId=>{
        let loadedMessages=[];
        const ref =this.getMessagesRef();
        ref.child(channelId).on("child_added", snap=>{
            loadedMessages.push(snap.val());
            //console.log(loadedMessages); 
            this.setState({
                messages: loadedMessages,
                messagesLoading: false,
                
            });
            this.countUniqueUsers(loadedMessages);
            this.countUserPosts(loadedMessages);
        });
        this.addToListeners(channelId, ref , "child_added");
    }

    addUserStarListener = (channelId, userId)=>{
        this.state.usersRef
            .child(userId)
            .child('starred')
            .once('value') //to get its value
            .then(data=>{
                if(data.val() !== null){ //To check starred section is not null or empty
                    const channelIds= Object.keys(data.val());
                    const prevStarred= channelIds.includes(channelId);
                    this.setState({isChannelStarred : prevStarred});
                }                
            })
    }

    getMessagesRef= () =>{
        const { messagesRef, privateMessagesRef, privateChannel}= this.state;
        return privateChannel ? privateMessagesRef : messagesRef;
    }

    handleStar= ()=>{
        this.setState(prevState=>({
            isChannelStarred: !prevState.isChannelStarred       //Always give opposite value ex- 0 to 1 and vice versa
        }),()=>this.starChannel())
    }

    starChannel = () =>{
        if(this.state.isChannelStarred){
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)    //To star the particular channel and sore it under the user who starred it
                .update({
                    [this.state.channel.id] : {
                        name: this.state.channel.name,      //Name of the Channel
                        details: this.state.channel.details,
                        createdBy:{
                            name: this.state.channel.createdBy.name,    //creator of the channel
                            avatar: this.state.channel.createdBy.avatar,
                        }
                    }
                })
        }else{
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .child(this.state.channel.id)
                .remove(err =>{
                    if(err !== null){
                        console.error(err);
                    }
                })
        }
    }

    handleSearchChange = event =>{
        this.setState({
            searchTerm: event.target.value,
            searchLoading: true
        }, ()=>this.handleSearchMessages());
    }

    handleSearchMessages= () =>{
        const channelMessages= [...this.state.messages];    // copy messages so the original values are not mutated
        const regex = new RegExp(this.state.searchTerm,'gi');
        const searchResults = channelMessages.reduce((acc,message)=>{
            if(message.content && message.content.match(regex)){
                acc.push(message);
            }
            return acc;
        },[]);
        this.setState({ searchResults });
    }
    
    countUniqueUsers= messages =>{
        const uniqueUsers = messages.reduce((acc,message)=>{
            if(!acc.includes(message.user.name)){
                acc.push(message.user.name)
            }
            return acc;
        },[]);
        const plural= uniqueUsers.length >1 || uniqueUsers.length === 0;
        const numUniqueUsers=`${uniqueUsers.length} user${plural ? "s" : ""}`;
        this.setState({ numUniqueUsers })
    }

    countUserPosts = messages =>{
        let userPosts= messages.reduce((acc,message)=>{
            if(message.user.name in acc){
                acc[message.user.name].count +=1; //to count number of messages the specic user has sent
            }else{                                //For the first time (adding a person who has sent a message a first message)
                acc[message.user.name]={          //adding avatar and count to array of accumulator
                    avatar : message.user.avatar,
                    count: 1                      // for the first message
                }
            }
            return acc;
        },{});
        this.props.setUserPosts(userPosts);
    }

    displayMessages= messages =>(
        messages.length > 0 && messages.map(message=>(
            <Message
                key={message.timestamp}      // since we are iterating over it
                message={message}
                user={this.state.user}
            />
        ))
    );

    isProgressBarVisible =percent =>{
        if(percent > 0){
            this.setState({
                ProgressBar: true
            });
        }
    }

    displayChannelName= channel =>{
        return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}`: '';
    }

    displayTypingUsers= users =>(
        users.length > 0 &&  users.map(user=>(
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.2em'}} key={user.id}>
                <span className="user__typing">{user.name} is Typing</span> <Typing />
            </div>
        ))
    )

    displayMessageSkeleton = loading =>
        loading ? (
            <React.Fragment>
                {[...Array(10)].map((_,i)=>(
                    <Skeleton key={i}/>
                ))}
            </React.Fragment>
        ) :null; 
    


    render(){
        const {messagesRef,channel,user,messages,ProgressBar,numUniqueUsers, searchResults,searchTerm, privateChannel, isChannelStarred,typingUsers,messagesLoading} =this.state;
        return(
            <React.Fragment>
                <MessagesHeader
                    channelName ={this.displayChannelName(channel)}
                    numUniqueUsers ={numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    isPrivateChannel={privateChannel} //Basically to show start icon
                    handleStar={this.handleStar}
                    isChannelStarred={isChannelStarred}
                />

                <Segment>
                    <Comment.Group className={ProgressBar ? 'messages__progress' : 'messages'}>
                        {this.displayMessageSkeleton(messagesLoading)}
                        {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
                        {this.displayTypingUsers(typingUsers)}
                        <div ref={node =>(this.messagesEnd = node)}></div>
                    </Comment.Group>
                </Segment>

                <MessageFrom 
                    messagesRef={messagesRef}
                    currentChannel={channel}
                    currentUser={user}
                    isProgressBarVisible={this.isProgressBarVisible}
                    isPrivateChannel={privateChannel}
                    getMessagesRef={this.getMessagesRef}
                />
            </React.Fragment>
        )
    }
}
export default connect(null , {setUserPosts})(Messages);