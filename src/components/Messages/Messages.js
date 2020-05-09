import React from 'react';
import {Segment,Comment} from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setUserPosts } from '../../actions';
import MessagesHeader from './MessagesHeader';
import MessageFrom from './MessageFrom';
import firebase from '../../firebase';
import Message from './Message';

class Messages extends React.Component{
    state={
        privateChannel: this.props.isPrivateChannel,
        privateMessagesRef:firebase.database().ref('privateMessages') ,
        messagesRef: firebase.database().ref('messages'),
        usersRef: firebase.database().ref('users'),
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
    }

    componentDidMount(){
        const {channel,user}=this.state;
        if(channel && user){
            this.addListeners(channel.id);
            this.addUserStarListener(channel.id, user.uid) // to keep displaying the stareed channels ( otherwise they will look unstar in UI)
        }
    }

    addListeners = channelId=>{
        this.addMessageListener(channelId);
    }

    addMessageListener=channelId=>{
        let loadedMessages=[];
        const ref =this.getMessagesRef();
        ref.child(channelId).on('child_added', snap=>{
            loadedMessages.push(snap.val());
            //console.log(loadedMessages); 
            this.setState({
                messages: loadedMessages,
                messagesLoading: false,
                
            });
            this.countUniqueUsers(loadedMessages);
            this.countUserPosts(loadedMessages);
        })
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



    render(){
        const {messagesRef,channel,user,messages,ProgressBar,numUniqueUsers, searchResults,searchTerm, privateChannel, isChannelStarred} =this.state;
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
                        {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
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